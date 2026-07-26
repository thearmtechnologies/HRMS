import React, { useState, useEffect } from 'react';
import { Loader2, IndianRupee } from 'lucide-react';

export default function SalaryAssignmentTab({ employee }) {
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employee?._id) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/pay/salary-fixed/employee/${employee._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setSalaryInfo(data))
      .catch(() => setSalaryInfo(null))
      .finally(() => setLoading(false));
  }, [employee]);

  const formatINR = (v) => {
    if (!v && v !== 0) return '—';
    return '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!salaryInfo) {
    return (
      <div className="text-center py-12 animate-in fade-in">
        <IndianRupee size={40} className="mx-auto mb-3 text-[#bdc2c7] opacity-50" />
        <p className="font-medium text-[#8f9192]">No salary structure assigned</p>
        <p className="text-xs text-[#bdc2c7] mt-1">Assign a salary structure from the Employee Management page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl p-5 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] font-bold uppercase opacity-80">Gross Monthly</p>
            <p className="text-xl font-bold mt-1">{formatINR(salaryInfo.grossMonthly)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase opacity-80">In-Hand Monthly</p>
            <p className="text-xl font-bold mt-1">{formatINR(salaryInfo.inHandMonthly)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase opacity-80">Annual CTC</p>
            <p className="text-xl font-bold mt-1">{formatINR(salaryInfo.annualCTC)}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Basic Salary', value: formatINR(salaryInfo.basicMonthly) },
          { label: 'HRA', value: formatINR(salaryInfo.hraMonthly) },
          { label: 'Medical Allowance', value: formatINR(salaryInfo.maMonthly) },
          { label: 'Conveyance Allowance', value: formatINR(salaryInfo.caMonthly) },
          { label: 'Special Allowance', value: formatINR(salaryInfo.saMonthly) },
          { label: 'Employee PF', value: formatINR(salaryInfo.employeePFMonthly) },
          { label: 'Employer PF', value: formatINR(salaryInfo.employerPFMonthly) },
          { label: 'Professional Tax', value: formatINR(salaryInfo.professionalTax) },
          { label: 'Overtime Rate/hr', value: formatINR(salaryInfo.overtimeRate) },
          { label: 'Effective Date', value: salaryInfo.effectiveDate ? new Date(salaryInfo.effectiveDate).toLocaleDateString() : '—' },
        ].map((item, i) => (
          <div key={i} className="bg-[#f0f3f5] rounded-lg p-3">
            <p className="text-xs font-semibold text-[#bdc2c7] uppercase">{item.label}</p>
            <p className="text-sm font-bold text-[#1E293B] mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
