import React, { useMemo, useState, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  Columns,
  X,
  RefreshCw,
  Trash2,        // 👈 NEW
} from "lucide-react";
import * as XLSX from "xlsx";

import "ag-grid-community/styles/ag-theme-alpine.css";

export default function EntityRecords({
  rowData = [],
  columnDefs: externalColumnDefs = null,
  defaultColDef = null,
  gridOptions = {},
  pageSize = 10,
  theme = "light",
  onRefresh = null,
  onRowDoubleClicked = null,
  onSelectionChanged = null,
  onDeleteRow = null,          // 👈 NEW
}) {
  const gridRef = useRef(null);

  const [quickFilter, setQuickFilter] = useState("");
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [colSearch, setColSearch] = useState("");
  const [localColumnDefs, setLocalColumnDefs] = useState([]);
  const [visibleMap, setVisibleMap] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // small delete cell renderer using lucide-react
  const deleteCellRenderer = (params) => {
    if (!onDeleteRow) return null;
    const row = params.data;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // don't trigger row selection / double-click
          onDeleteRow(row);
        }}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        title="Delete row"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    );
  };

  // default column def
  const makeDefaultColDef = useMemo(
    () =>
      defaultColDef || {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 80,
        flex: 1,
      },
    [defaultColDef]
  );

  // capture grid api on ready
  function onGridReady(params) {
    const cols = params.api.getAllDisplayedColumns() || [];
    const vm = {};
    cols.forEach((c) => {
      const colId = c.getColId();
      vm[colId] = c.isVisible();
    });
    setVisibleMap(vm);
  }

  // derive columns if external not provided
  useEffect(() => {
    // helper to optionally add actions column
    const withActions = (cols) => {
      if (!onDeleteRow) return cols;
      const hasActions = cols.some((c) => c.field === "__actions");
      if (hasActions) return cols;

      return [
        ...cols,
        {
          field: "__actions",
          headerName: "",
          width: 90,
          sortable: false,
          filter: false,
          pinned: "right",
          cellRenderer: deleteCellRenderer,
        },
      ];
    };

    if (externalColumnDefs && externalColumnDefs.length) {
      const cols = withActions(externalColumnDefs);
      setLocalColumnDefs(cols);

      const vm = {};
      cols.forEach((c) => (vm[c.field] = true));
      setVisibleMap((s) => ({ ...vm, ...s }));
      return;
    }

    const first = rowData && rowData.length ? rowData[0] : null;
    if (!first) {
      setLocalColumnDefs(withActions([]));
      return;
    }

    const keys = Object.keys(first);
    const auto = keys.map((k) => {
      if (k === "score") {
        return {
          field: k,
          headerName: "Score",
          valueFormatter: (p) =>
            p.value == null ? "-" : Number(p.value).toFixed(2),
          width: 110,
          sortable: true,
        };
      }
      if (k === "id") return { field: k, headerName: "ID", width: 90 };
      if (k === "created_at")
        return { field: k, headerName: "Created At", width: 180 };
      return { field: k, headerName: startCase(k) };
    });

    const cols = withActions(auto);
    setLocalColumnDefs(cols);

    const vm = {};
    cols.forEach((c) => (vm[c.field] = true));
    setVisibleMap((s) => ({ ...vm, ...s }));
  }, [rowData, externalColumnDefs, onDeleteRow]); // 👈 include onDeleteRow

  // helper: Title case
  function startCase(str = "") {
    return String(str)
      .replace(/_/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
  }

  // toggles column visibility safely and updates visibleMap
  function toggleColumnVisibility(colId) {
    if (!gridRef.current?.api) return;

    const api = gridRef.current.api;
    const column = api.getColumn(colId);
    if (!column) return;

    const currentlyVisible = column.isVisible();
    api.setColumnsVisible([colId], !currentlyVisible);
    setVisibleMap((s) => ({ ...s, [colId]: !currentlyVisible }));
  }

  // export to Excel with proper formatting
  function onExportExcel() {
    if (!gridRef.current?.api) return;

    try {
      const allDisplayedRows = [];
      gridRef.current.api.forEachNodeAfterFilterAndSort((node) => {
        allDisplayedRows.push(node.data);
      });

      if (allDisplayedRows.length === 0) {
        alert("No data to export");
        return;
      }

      // filter out selection + actions column
      const visibleColumns = gridRef.current.api
        .getAllDisplayedColumns()
        .filter(
          (col) =>
            col.getColId() !== "ag-Grid-SelectionColumn" &&
            col.getColId() !== "__actions" // 👈 NEW
        );

      const headers = visibleColumns.map(
        (col) => col.getColDef().headerName || col.getColId()
      );
      const fields = visibleColumns.map((col) => col.getColId());

      const excelData = allDisplayedRows.map((row) => {
        const rowData = {};
        visibleColumns.forEach((col, index) => {
          const field = col.getColId();
          const colDef = col.getColDef();
          let value = row[field];

          if (colDef.valueFormatter && value != null) {
            const params = {
              value,
              data: row,
              node: null,
              colDef,
              column: col,
              api: gridRef.current.api,
            };
            value = colDef.valueFormatter(params);
          }

          rowData[headers[index]] = value ?? "";
        });
        return rowData;
      });

      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = headers.map((header, index) => {
        const field = fields[index];

        if (
          field.includes("date") ||
          field.includes("created_at") ||
          field.includes("updated_at") ||
          field.includes("time")
        ) {
          return { wch: 20 };
        }

        let maxWidth = header.length;

        excelData.forEach((row) => {
          const cellValue = String(row[header] || "");
          maxWidth = Math.max(maxWidth, cellValue.length);
        });

        return { wch: Math.min(Math.max(maxWidth + 2, 10), 50) };
      });

      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");

      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `export_${timestamp}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    }
  }

  // quick filter handler
  function handleQuickFilterChange(val) {
    setQuickFilter(val);
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("quickFilterText", val);
    }
  }

  // selection changed callback
  function handleSelectionChanged() {
    if (!onSelectionChanged || !gridRef.current?.api) return;
    const selected = gridRef.current.api.getSelectedRows() || [];
    onSelectionChanged(selected);
  }

  // refresh data handler
  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  const resolvedGridOptions = useMemo(() => {
    let rowSelection = { mode: "singleRow" };

    if (gridOptions.rowSelection) {
      if (typeof gridOptions.rowSelection === "string") {
        rowSelection = {
          mode:
            gridOptions.rowSelection === "multiple" ? "multiRow" : "singleRow",
        };
      } else if (gridOptions.rowSelection.type) {
        rowSelection = {
          mode:
            gridOptions.rowSelection.type === "multiple"
              ? "multiRow"
              : "singleRow",
        };
      } else {
        rowSelection = gridOptions.rowSelection;
      }
    }

    return {
      rowSelection,
      pagination: gridOptions.pagination ?? true,
      paginationPageSize: pageSize,
      paginationPageSizeSelector:
        gridOptions.paginationPageSizeSelector ??
        (() => {
          const base = [20, 50, 100];
          if (!base.includes(pageSize)) base.unshift(pageSize);
          return base;
        })(),
      ...gridOptions,
    };
  }, [gridOptions, pageSize]);

  const filteredCols = localColumnDefs.filter((c) =>
    (c.headerName || c.field || "")
      .toLowerCase()
      .includes(colSearch.toLowerCase())
  );

  const themeClass =
    theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {/* top controls */}
      <div className="flex flex-col gap-3 mb-4">
        {/* First row: Search input - full width */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={quickFilter}
            onChange={(e) => handleQuickFilterChange(e.target.value)}
            placeholder="Search across rows..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Second row: Buttons and info - responsive grid */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 bg-blue-600 dark:bg-blue-700 text-white border border-blue-700 dark:border-blue-600 rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>

            <button
              onClick={onExportExcel}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 bg-emerald-600 dark:bg-emerald-700 text-white border border-emerald-700 dark:border-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
              title="Export to Excel"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => {
                  setShowColumnsMenu((s) => !s);
                  setColSearch("");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Columns className="w-4 h-4" />
                <span className="hidden sm:inline">Columns</span>
              </button>

              {showColumnsMenu && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 z-10 lg:hidden"
                    onClick={() => setShowColumnsMenu(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 lg:left-0 mt-2 w-72 max-h-80 overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        value={colSearch}
                        onChange={(e) => setColSearch(e.target.value)}
                        placeholder="Filter columns..."
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setShowColumnsMenu(false)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {filteredCols.map((c) => {
                        const id = c.field || c.colId || c.headerName;
                        const checked = !!visibleMap[id];
                        return (
                          <label
                            key={id}
                            className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-1.5 rounded cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleColumnVisibility(id)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="truncate">
                              {c.headerName || id}
                            </span>
                          </label>
                        );
                      })}
                      {filteredCols.length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                          No columns found
                        </p>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
            Showing{" "}
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              {rowData?.length ?? 0}
            </span>{" "}
            rows
          </div>
        </div>
      </div>

      {/* grid container: responsive height */}
      <div
        className={`${themeClass} rounded-lg shadow-md overflow-hidden border border-slate-200 dark:border-slate-700`}
        style={{
          height: "calc(100vh - 280px)",
          minHeight: 400,
          maxHeight: 700,
          width: "100%",
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={localColumnDefs}
          defaultColDef={makeDefaultColDef}
          onGridReady={onGridReady}
          onRowDoubleClicked={(ev) =>
            onRowDoubleClicked && onRowDoubleClicked(ev.data)
          }
          onSelectionChanged={handleSelectionChanged}
          animateRows={true}
          suppressAggFuncInHeader={true}
          {...resolvedGridOptions}
        />
      </div>
    </motion.div>
  );
}
