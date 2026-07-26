import React from 'react';

export default function OrganizationTab({ employee }) {
  if (!employee) return null;
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Department</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.department?.departmentName || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Designation</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.designation || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Work Location</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.workLocation || '—'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Working Shift</label>
          <div className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.shift?.name || 'Default Company Shift'}</div>
        </div>
      </div>
    </div>
  );
}
