import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  IndianRupee,
} from "lucide-react";

export default function SalaryAdvanceManagement() {
  const [advances, setAdvances] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee: "",
    amount: "",
    reason: "",
    recoveryStartMonth: new Date().getMonth() + 1,
    recoveryStartYear: new Date().getFullYear(),
    recoveryMethod: "Fixed Monthly",
    installmentAmount: "",
  });

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);

  const openHistory = (advance) => {
    setSelectedAdvance(advance);
    setHistoryModalOpen(true);
  };

  useEffect(() => {
    fetchAdvances();
    fetchEmployees();
  }, []);

  const fetchAdvances = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/advance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch advances");
      const res = { data: await response.json() };
      setAdvances(res.data);
    } catch (err) {
      setError("Failed to fetch advances");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/employee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch employees");
      const res = { data: await response.json() };
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/advance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw { response: { data: { message: errData.message } } };
      }
      setSuccess("Salary advance requested successfully");
      setTimeout(() => setSuccess(""), 3000);
      setIsModalOpen(false);
      fetchAdvances();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create advance");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/advance/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) throw new Error("Failed to update status");
      setSuccess(`Advance ${status.toLowerCase()} successfully`);
      setTimeout(() => setSuccess(""), 3000);
      fetchAdvances();
    } catch (err) {
      setError("Failed to update status");
      setTimeout(() => setError(""), 5000);
    }
  };

  const deleteAdvance = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this pending request?")
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/advance/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete advance");
      setSuccess("Advance deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
      fetchAdvances();
    } catch (err) {
      setError("Failed to delete advance");
      setTimeout(() => setError(""), 5000);
    }
  };

  const filteredAdvances = advances.filter((a) => {
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    const nameMatch = (a.employee?.firstName + " " + a.employee?.lastName)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const empIdMatch = a.employee?.employeeId
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return nameMatch || empIdMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {success && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Advances</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage employee advance requests and recoveries
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              employee: "",
              amount: "",
              reason: "",
              recoveryStartMonth: new Date().getMonth() + 1,
              recoveryStartYear: new Date().getFullYear(),
              recoveryMethod: "Fixed Monthly",
              installmentAmount: "",
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> New Advance
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search employee..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Request Date</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Balance</th>
                  <th className="p-4 font-semibold">Recovery Start</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdvances.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No salary advances found
                    </td>
                  </tr>
                ) : (
                  filteredAdvances.map((advance) => (
                    <tr key={advance._id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {advance.employee?.firstName}{" "}
                          {advance.employee?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {advance.employee?.employeeId}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(advance.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900">
                        ₹{advance.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-sm font-medium text-blue-600">
                        ₹{advance.outstandingBalance.toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(
                          advance.recoveryStartYear,
                          advance.recoveryStartMonth - 1,
                        ).toLocaleString("default", {
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            advance.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : advance.status === "Pending"
                                ? "bg-amber-100 text-amber-700"
                                : advance.status === "Completed"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {advance.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {advance.status === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(advance._id, "Approved")
                                }
                                className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(advance._id, "Rejected")
                                }
                                className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => deleteAdvance(advance._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <IndianRupee size={20} className="text-blue-600" />
                Request Salary Advance
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  name="employee"
                  required
                  value={formData.employee}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Advance Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  name="reason"
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Recovery Start Month
                  </label>
                  <select
                    name="recoveryStartMonth"
                    required
                    value={formData.recoveryStartMonth}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Recovery Start Year
                  </label>
                  <input
                    type="number"
                    name="recoveryStartYear"
                    required
                    value={formData.recoveryStartYear}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Recovery Method *
                </label>
                <select
                  name="recoveryMethod"
                  required
                  value={formData.recoveryMethod}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="Fixed Monthly">
                    Fixed Monthly Installment
                  </option>
                  <option value="Manual">Manual Deduction (Review Time)</option>
                </select>
              </div>

              {formData.recoveryMethod === "Fixed Monthly" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Monthly Installment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="installmentAmount"
                    required
                    min="1"
                    max={formData.amount}
                    value={formData.installmentAmount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {historyModalOpen && selectedAdvance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recovery History
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedAdvance.employee?.firstName}{" "}
                  {selectedAdvance.employee?.lastName} - ₹
                  {selectedAdvance.amount}
                </p>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Recovery Schedule
              </h3>
              <div className="overflow-x-auto border rounded-lg mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 border-b">Month/Year</th>
                      <th className="p-3 border-b">Planned</th>
                      <th className="p-3 border-b">Actual</th>
                      <th className="p-3 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAdvance.recoverySchedule?.map((s, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-3">
                          {s.month}/{s.year}
                        </td>
                        <td className="p-3 text-gray-600">
                          ₹{s.plannedRecovery}
                        </td>
                        <td className="p-3 font-semibold text-gray-900">
                          ₹{s.actualRecovery}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              s.status === "Pending"
                                ? "bg-yellow-50 text-yellow-700"
                                : s.status === "Partial"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-green-50 text-green-700"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!selectedAdvance.recoverySchedule?.length && (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-4 text-center text-gray-500"
                        >
                          No schedule generated
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Actual Recoveries
              </h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 border-b">Date</th>
                      <th className="p-3 border-b">Recovered</th>
                      <th className="p-3 border-b">Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAdvance.recoveryHistory?.map((h, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-3">
                          {new Date(h.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-semibold text-red-600">
                          ₹{h.recoveredAmount}
                        </td>
                        <td className="p-3 font-semibold text-gray-900">
                          ₹{h.balanceAfter}
                        </td>
                      </tr>
                    ))}
                    {!selectedAdvance.recoveryHistory?.length && (
                      <tr>
                        <td
                          colSpan="3"
                          className="p-4 text-center text-gray-500"
                        >
                          No recoveries yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
