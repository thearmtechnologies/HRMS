import React from 'react';

export default function BankDetailsTab({ employee }) {
  if (!employee) return null;
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Bank Name</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.bankName || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Branch</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.branch || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Account Number</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.accountNo || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">IFSC Code</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium uppercase">{employee.ifscCode || '—'}</div>
        </div>
      </div>
    </div>
  );
}
