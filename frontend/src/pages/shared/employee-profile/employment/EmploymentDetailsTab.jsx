import React from 'react';

export default function EmploymentDetailsTab({ employee }) {
  if (!employee) return null;
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Employee ID</label>
          <div className="w-full px-4 py-2.5 bg-[#e2e6ea] border border-[#d6d9df] rounded-lg text-[#1E293B] font-bold">{employee.employeeId || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">System Role</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium capitalize">{employee.role || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Joining</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">
            {employee.doj ? new Date(employee.doj).toLocaleDateString() : '—'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Employment Type</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.employmentType || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Status</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#3B82F6] font-bold">{employee.status || 'Active'}</div>
        </div>
      </div>
    </div>
  );
}
