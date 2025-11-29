import { useEffect, useState } from "react";
import { PlusCircle, Table2 } from "lucide-react";
import toast from "react-hot-toast";

import EntityRecords from "./EntityRecords";
import EntityForm from "./EntityForm";
import { fetchAll, addUser , deleteUser } from "../api/userAPI";

export default function EntityManage() {
  const [activeTab, setActiveTab] = useState("records"); // "records" | "add"
  const [data, setData] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState(null);

  // Load all records
  const loadData = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const resp = await fetchAll();
      const rows = resp?.Data || [];
      setData(rows);
    } catch (err) {
      console.error(err);
      setError("Failed to load records");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle add user submit
  const handleAddUser = async (formData) => {
    setLoadingForm(true);
    try {
      const resp = await addUser(formData);
      // you can customise based on resp.Status / resp.Message if backend sends it
      toast.success("User added successfully");
      await loadData();
      setActiveTab("records");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to add user");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDeleteRow = async (row) => {
  // Adjust according to your API’s field name
  const userId = row.User_ID || row.id;

  if (!userId) {
    toast.error("User ID not found");
    return;
  }

//   const confirmed = window.confirm(
//     `Are you sure you want to delete user ${row.Name || ""}?`
//   );
//   if (!confirmed) return;

  try {
    await deleteUser(userId);
    toast.success("User deleted successfully");
    await loadData(); // refresh list
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete user");
  }
};


  // Table columns (same config you used earlier)
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 220 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "number", headerName: "Phone", width: 140 },
    {
      field: "score",
      headerName: "Score",
      width: 110,
      valueFormatter: (p) =>
        p.value == null ? "-" : Number(p.value).toFixed(2),
    },
    { field: "created_at", headerName: "Created At", width: 180 },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
      {/* Tabs / buttons row */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
        <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("records")}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "records"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>Records</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "add"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add_User</span>
          </button>
        </div>

        {/* Mobile-friendly Add User shortcut (when on records tab) */}
        {activeTab === "records" && (
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className="sm:hidden inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {/* Error message (for list) */}
      {error && activeTab === "records" && (
        <div className="mb-4 text-sm rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Content switch */}
      {activeTab === "records" ? (
        <EntityRecords
          rowData={data}
          columnDefs={columns}
          pageSize={50}
          theme="dark"
          gridOptions={{
            rowSelection: { mode: "multiRow" },
            pagination: true,
            paginationPageSizeSelector: [10, 20, 50, 100],
          }}
          onRefresh={loadData}
          onRowDoubleClicked={(row) =>
            alert(`Open detail for ${row.name} (id: ${row.id})`)
          }
          onSelectionChanged={(rows) => console.log("selected rows", rows)}
           onDeleteRow={handleDeleteRow} 
        />
      ) : (
        <EntityForm
          onSubmit={handleAddUser}
          loading={loadingForm}
          onCancel={() => setActiveTab("records")}
        />
      )}

      {/* Lightweight loading indicator for records tab */}
      {loadingList && activeTab === "records" && (
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-right">
          Refreshing records…
        </div>
      )}
    </div>
  );
}
