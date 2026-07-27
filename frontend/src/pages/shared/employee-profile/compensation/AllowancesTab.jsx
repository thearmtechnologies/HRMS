import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';

export default function AllowancesTab({ employee }) {
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

  if (!salaryInfo || !salaryInfo.assignedComponents || salaryInfo.assignedComponents.length === 0) {
    return (
      <div className="text-center py-12 animate-in fade-in">
        <TrendingUp size={40} className="mx-auto mb-3 text-[#bdc2c7] opacity-50" />
        <p className="font-medium text-[#8f9192]">No dynamic allowances found</p>
        <p className="text-xs text-[#bdc2c7] mt-1">Earnings will appear here once assigned.</p>
      </div>
    );
  }

  const allowances = salaryInfo.assignedComponents.filter(c => c.component?.type === 'Earning');

  if (allowances.length === 0) {
    return (
      <div className="text-center py-12 animate-in fade-in">
        <TrendingUp size={40} className="mx-auto mb-3 text-[#bdc2c7] opacity-50" />
        <p className="font-medium text-[#8f9192]">No earnings components</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <h3 className="text-sm font-bold text-[#1E293B] mb-2 flex items-center gap-2">
        <TrendingUp size={16} className="text-green-500" /> Earnings / Allowances
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {allowances.map((item, i) => (
          <div key={i} className="bg-[#f0f3f5] rounded-lg p-3">
            <p className="text-[10px] font-bold text-[#bdc2c7] uppercase">{item.component?.code || 'EARNING'}</p>
            <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">{item.component?.name}</p>
            <p className="text-sm font-bold text-[#1E293B] mt-0.5">{formatINR(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
