import React, { useState, useEffect } from "react";
import { Clock, Loader2, Save, Calendar, History, ShieldAlert } from "lucide-react";

export default function ShiftAssignmentTab({ employee, setEmployee }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [selectedShift, setSelectedShift] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/shift", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setShifts(data);
        }
      } catch (err) {
        console.error("Failed to fetch shifts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedShift || !effectiveFrom) {
      setMessage({ text: "Shift and Effective Date are required.", type: "error" });
      return;
    }

    setAssigning(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("http://localhost:5000/api/shift/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          employeeId: employee._id,
          shiftId: selectedShift,
          effectiveFrom,
          remarks
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Shift assigned successfully!", type: "success" });
        // Update local employee state to reflect the new history immediately
        // Wait, best is to refetch or update the employee object so UI re-renders properly
        if (setEmployee && data.employee) {
          setEmployee({
            ...employee,
            shift: shifts.find(s => s._id === selectedShift) || data.employee.shift,
            shiftHistory: data.employee.shiftHistory
          });
        }
        setEffectiveFrom("");
        setRemarks("");
      } else {
        setMessage({ text: data.message || "Failed to assign shift.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error occurred.", type: "error" });
    } finally {
      setAssigning(false);
    }
  };

  const getShiftName = (shiftObj) => {
    if (!shiftObj) return "Unassigned";
    if (typeof shiftObj === 'string') {
        const found = shifts.find(s => s._id === shiftObj);
        return found ? found.name : "Unknown Shift";
    }
    return shiftObj.name;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  // Sort history descending by effectiveFrom
  const sortedHistory = employee?.shiftHistory ? [...employee.shiftHistory].sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom)) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Current Shift Card */}
      <div className="bg-white rounded-xl border border-[#d6d9df] p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Clock size={20} />
          </div>
          <h3 className="text-base font-bold text-[#1E293B]">Current Active Shift (Today)</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-[#8f9192] font-semibold mb-1">Active Shift</p>
                <p className="text-lg font-bold text-[#1E293B]">{employee?.shift?.name || "Unassigned"}</p>
            </div>
            {employee?.shift && (
                <div className="text-right">
                    <p className="text-sm text-[#8f9192] font-semibold mb-1">Timings</p>
                    <p className="text-sm font-bold text-[#1E293B]">{employee.shift.startTime} - {employee.shift.endTime}</p>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assign New Shift Form */}
        <div className="bg-white rounded-xl border border-[#d6d9df] p-5 shadow-sm h-fit">
          <h3 className="text-base font-bold text-[#1E293B] mb-4">Assign New Shift</h3>
          
          <form onSubmit={handleAssign} className="space-y-4">
            {message.text && (
              <div className={`p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  message.type === "error" ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {message.type === "error" && <ShieldAlert size={16} />}
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-1">
                Select Shift <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#d6d9df] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">-- Select Shift --</option>
                {shifts.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-1">
                Effective From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#d6d9df] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                required
              />
              <p className="text-xs text-[#8f9192] mt-1">Select any date to update history.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-1">
                Reason / Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="E.g., Shift changed as per new team requirements"
                className="w-full px-3 py-2 bg-white border border-[#d6d9df] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={assigning}
              className="w-full flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {assigning ? "Assigning..." : "Assign Shift"}
            </button>
          </form>
        </div>

        {/* Shift History Log */}
        <div className="bg-white rounded-xl border border-[#d6d9df] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <History size={20} />
            </div>
            <h3 className="text-base font-bold text-[#1E293B]">Shift History</h3>
          </div>

          <div className="space-y-4">
            {sortedHistory.length === 0 ? (
              <div className="text-center py-8 text-[#8f9192]">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No shift history found.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-2">
                {sortedHistory.map((record, index) => (
                  <div key={index} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-sm font-bold text-[#1E293B]">{getShiftName(record.shift)}</p>
                                <p className="text-xs text-[#8f9192] font-semibold mt-0.5">
                                    Effective: <span className="text-[#3B82F6]">{new Date(record.effectiveFrom).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </p>
                            </div>
                            {index === 0 && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Active</span>
                            )}
                        </div>
                        
                        {record.remarks && (
                            <p className="text-xs text-[#475569] mt-2 bg-white p-2 rounded border border-gray-100">
                                <span className="font-semibold text-[#1E293B]">Remarks:</span> {record.remarks}
                            </p>
                        )}
                        
                        {record.assignedBy && (
                            <p className="text-[10px] text-[#8f9192] mt-2 font-medium">
                                Assigned by: {record.assignedBy.firstName} {record.assignedBy.lastName}
                            </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
