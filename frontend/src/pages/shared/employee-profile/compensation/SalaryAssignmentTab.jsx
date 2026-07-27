import React, { useState, useEffect } from 'react';
import { Loader2, IndianRupee, Edit2, History } from 'lucide-react';
import SalaryStructureModal from '../../../../components/employee/SalaryStructureModal';

export default function SalaryAssignmentTab({ employee }) {
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSalary = () => {
    if (!employee?._id) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/pay/salary-fixed/employee/${employee._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setSalaryInfo(data))
      .catch(() => setSalaryInfo(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSalary();
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
        <p className="text-xs text-[#bdc2c7] mt-1 mb-4">Assign a payroll template from the Employee Management page.</p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white text-sm font-semibold rounded-lg hover:bg-[#2563EB] transition-colors"
        >
          <IndianRupee size={16} />
          Assign Salary Structure
        </button>
        <SalaryStructureModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employee={employee}
          onSaved={() => {
            setIsModalOpen(false);
            fetchSalary();
          }}
        />
      </div>
    );
  }

  // Backwards compatibility or new dynamic structure
  const templateName = salaryInfo.templateId ? salaryInfo.templateId.name : 'Legacy Custom Assignment';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1E293B]">Salary Assignment</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#d6d9df] text-sm font-semibold text-[#475569] hover:bg-[#f0f3f5] rounded-lg transition-colors"
          >
            <Edit2 size={14} />
            Edit Assignment
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl p-5 text-white">
        <div className="flex justify-between items-start mb-4 border-b border-white/20 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase opacity-80">Assigned Template</p>
            <p className="text-lg font-bold">{templateName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase opacity-80">Status</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white text-blue-600 mt-1">
              {salaryInfo.isActive ? 'Active' : 'Archived'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-[10px] font-bold uppercase opacity-80">Gross Monthly</p>
            <p className="text-xl font-bold mt-1">{formatINR(salaryInfo.grossMonthly)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase opacity-80">Total Deductions</p>
            <p className="text-xl font-bold mt-1 text-red-200">-{formatINR(salaryInfo.grossMonthly - salaryInfo.inHandMonthly)}</p>
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
        <div className="bg-[#f0f3f5] rounded-lg p-3 col-span-2">
            <div>
              <p className="text-xs font-semibold text-[#bdc2c7] uppercase">Effective Date</p>
              <p className="text-sm font-bold text-[#1E293B] mt-0.5">
                  {salaryInfo.effectiveDate ? new Date(salaryInfo.effectiveDate).toLocaleDateString() : '—'}
              </p>
            </div>
        </div>

        {salaryInfo.assignedComponents && salaryInfo.assignedComponents.length > 0 ? (
            salaryInfo.assignedComponents.map((item, i) => (
                <div key={i} className="bg-[#f0f3f5] rounded-lg p-3">
                    <p className="text-[10px] font-bold text-[#bdc2c7] uppercase">
                        {item.component?.type === 'Earning' ? 'Earning' : 'Deduction'}
                    </p>
                    <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">{item.component?.name || 'Unknown Component'}</p>
                    <p className="text-sm font-bold text-[#1E293B] mt-0.5">{formatINR(item.value)}</p>
                </div>
            ))
        ) : (
            // Fallback for legacy assignments without dynamic components
            [
                { label: 'Basic Salary', value: formatINR(salaryInfo.basicMonthly) },
                { label: 'HRA', value: formatINR(salaryInfo.hraMonthly) },
                { label: 'Medical Allowance', value: formatINR(salaryInfo.maMonthly) },
                { label: 'Conveyance Allowance', value: formatINR(salaryInfo.caMonthly) },
                { label: 'Special Allowance', value: formatINR(salaryInfo.saMonthly) },
                { label: 'Employee PF', value: formatINR(salaryInfo.employeePFMonthly) },
                { label: 'Employer PF', value: formatINR(salaryInfo.employerPFMonthly) },
                { label: 'Professional Tax', value: formatINR(salaryInfo.professionalTax) },
            ].map((item, i) => (
                <div key={i} className="bg-[#f0f3f5] rounded-lg p-3">
                <p className="text-xs font-semibold text-[#bdc2c7] uppercase">{item.label}</p>
                <p className="text-sm font-bold text-[#1E293B] mt-0.5">{item.value}</p>
                </div>
            ))
        )}
      </div>

      <SalaryStructureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={employee}
        onSaved={() => {
          setIsModalOpen(false);
          fetchSalary();
        }}
      />
    </div>
  );
}
