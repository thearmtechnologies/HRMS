import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeForm from "../../components/employee/EmployeeForm";
import shiftService from "../../services/shiftService";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const getEmployeeDisplayName = (emp) => {
  if (!emp) return "Unknown";
  return emp.employeeName || emp.fullName || (emp.firstName || emp.lastName ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : emp.name || "Unknown");
};

export default function CreateEmployee() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [credentialsData, setCredentialsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, shiftsData] = await Promise.all([
          fetch("http://localhost:5000/api/department", {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          shiftService.getShifts().catch(() => [])
        ]);

        const deptData = await deptRes.json();
        setDepartments(Array.isArray(deptData) ? deptData : []);
        setAvailableShifts(Array.isArray(shiftsData) ? shiftsData : []);
      } catch (err) {
        console.error("Error loading create employee dependencies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSuccess = (responseData) => {
    if (responseData?.tempPassword) {
      setCredentialsData({
        employeeId: responseData.employee?.employeeId,
        employeeName: getEmployeeDisplayName(responseData.employee),
        email: responseData.employee?.email,
        tempPassword: responseData.tempPassword,
      });
    } else {
      navigate(-1);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 font-medium">
        Loading dependencies...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleClose}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          title="Back to Employee Management"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Register New Employee</h1>
          <p className="text-sm mt-1 text-slate-600 font-medium">Create an account and profile for a new organization member.</p>
        </div>
      </div>

      <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm p-6">
        <EmployeeForm
          mode="create"
          departments={departments}
          availableShifts={availableShifts}
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      </div>

      {/* Credentials Success Modal */}
      {credentialsData && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" 
            onClick={() => navigate(-1)} 
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-xl w-full max-w-md p-6 space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B]">Employee Created!</h3>
                <p className="text-sm text-slate-600 font-medium mt-1">Account credentials have been generated.</p>
              </div>

              <div className="bg-[#f0f3f5] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Employee ID</span>
                  <span className="font-bold text-[#1E293B]">{credentialsData.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Name</span>
                  <span className="font-bold text-[#1E293B]">{credentialsData.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Email</span>
                  <span className="font-bold text-[#1E293B]">{credentialsData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Temp Password</span>
                  <span className="font-bold text-[#1E293B] font-mono">{credentialsData.tempPassword}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-4 py-2.5 text-sm font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
