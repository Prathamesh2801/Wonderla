import { useEffect, useState } from "react";
import EntityRecords from "../components/EntityRecords";
import { fetchAll } from "../api/FetchAllUsers";
import { motion } from "framer-motion";
import { Database, AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchAll();
        const rows = resp?.Data || [];
        if (mounted) setData(rows);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load records");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 220 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "number", headerName: "Phone", width: 140 },
    // { field: "pincode", headerName: "Pincode", width: 110 },
    // { field: "company_id", headerName: "Company", width: 140 },
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-[52px]">
            Manage and view all entity records
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
              Loading records...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-1">
                  Error Loading Data
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Data Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6"
          >
            <EntityRecords
              rowData={data}
              columnDefs={columns}
              pageSize={10}
              theme="dark"
              gridOptions={{
                rowSelection: { mode: "multiRow" },
                pagination: true,
                paginationPageSizeSelector: [10, 20, 50, 100],
              }}
              onRowDoubleClicked={(row) =>
                alert(`Open detail for ${row.name} (id: ${row.id})`)
              }
              onSelectionChanged={(rows) => console.log("selected rows", rows)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}