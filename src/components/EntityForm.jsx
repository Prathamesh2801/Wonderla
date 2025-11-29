import { useState } from "react";
import { motion } from "framer-motion";

export default function EntityForm({ onSubmit, loading = false, onCancel }) {
  const [form, setForm] = useState({
    Name: "",
    Email: "",
    Number: "",
    Pincode: "",
    Company_ID: "",
    Score: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    onSubmit({
      ...form,
      // ensure score is sent as number
      Score: form.Score !== "" ? Number(form.Score) : "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Add User
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Back to Records
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-4"
      >
        {/* Name */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="sm:w-40 text-sm font-medium text-slate-700 dark:text-slate-200">
            Name<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            name="Name"
            value={form.Name}
            onChange={handleChange}
            required
            placeholder="Enter full name"
            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="sm:w-40 text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
          </label>
          <input
            type="email"
            name="Email"
            value={form.Email}
            onChange={handleChange}
            placeholder="example@email.com"
            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Number */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="sm:w-40 text-sm font-medium text-slate-700 dark:text-slate-200">
            Phone Number
          </label>
          <input
            type="tel"
            name="Number"
            value={form.Number}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Pincode */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="sm:w-40 text-sm font-medium text-slate-700 dark:text-slate-200">
            Pincode
          </label>
          <input
            type="text"
            name="Pincode"
            value={form.Pincode}
            onChange={handleChange}
            placeholder="Area pincode"
            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Company_ID */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="sm:w-40 text-sm font-medium text-slate-700 dark:text-slate-200">
            Company ID
          </label>
          <input
            type="text"
            name="Company_ID"
            value={form.Company_ID}
            onChange={handleChange}
            placeholder="Company identifier"
            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Score */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="sm:w-40 text-sm font-medium text-slate-700 dark:text-slate-200">
            Score<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="number"
            step="0.001"
            name="Score"
            value={form.Score}
            onChange={handleChange}
            required
            placeholder="2.513"
            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save User"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="text-red-500">*</span> Required fields
        </p>
      </form>
    </motion.div>
  );
}
