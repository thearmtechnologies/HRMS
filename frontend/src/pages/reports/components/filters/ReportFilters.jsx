import React from 'react';
import { Filter } from 'lucide-react';

export default function ReportFilters({ filters = [] }) {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-[#d6d9df] p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={18} className="text-slate-500" />
        <h3 className="font-bold text-slate-800 text-sm">Report Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.includes('dateRange') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Date Range</label>
            <select className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
              <option>Custom Range...</option>
            </select>
          </div>
        )}
        
        {filters.includes('department') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
            <select className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Human Resources</option>
              <option>Sales</option>
              <option>Marketing</option>
            </select>
          </div>
        )}
        
        {filters.includes('employee') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Employee</label>
            <select className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>All Employees</option>
              <option>Active Employees Only</option>
              <option>Specific Employee...</option>
            </select>
          </div>
        )}

        {filters.includes('designation') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Designation</label>
            <select className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>All Designations</option>
              <option>Manager</option>
              <option>Developer</option>
              <option>Designer</option>
            </select>
          </div>
        )}

        {filters.includes('status') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
            <select className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>All Statuses</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>
        )}

        {filters.includes('shift') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Shift</label>
            <select className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>All Shifts</option>
              <option>Morning Shift</option>
              <option>Night Shift</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
