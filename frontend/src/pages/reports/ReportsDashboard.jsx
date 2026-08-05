import React, { useState } from 'react';
import { 
  Users, CalendarCheck, Clock, Wallet, Building2, FolderKanban, 
  BarChart3, DownloadCloud, Activity, History
} from 'lucide-react';

import ReportsHeader from './components/layout/ReportsHeader';
import ReportSearch from './components/filters/ReportSearch';
import ReportCard from './components/cards/ReportCard';
import RecentReports from './components/tables/RecentReports';

export default function ReportsDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const reportCategories = [
    { id: 'attendance', title: 'Attendance Reports', description: 'Daily attendance, late check-ins, overtimes, and regularization.', icon: CalendarCheck, path: '/reports/attendance', colorClass: 'bg-blue-50 text-blue-600' },
    { id: 'payroll', title: 'Payroll Reports', description: 'Salary registers, deductions, and complete payroll history.', icon: Wallet, path: '/reports/payroll', colorClass: 'bg-emerald-50 text-emerald-600' },
    { id: 'leave', title: 'Leave Reports', description: 'Leave balances, history, and approval statuses.', icon: Clock, path: '/reports/leave', colorClass: 'bg-orange-50 text-orange-600' },
    { id: 'employees', title: 'Employee Reports', description: 'Active employees, new joiners, and full directory.', icon: Users, path: '/reports/employees', colorClass: 'bg-purple-50 text-purple-600' },
    { id: 'departments', title: 'Department Reports', description: 'Department-wise analytics and structural overviews.', icon: Building2, path: '/reports/departments', colorClass: 'bg-indigo-50 text-indigo-600' },
    { id: 'projects', title: 'Project Reports', description: 'Project allocations, team assignments, and timelines.', icon: FolderKanban, path: '/reports/projects', colorClass: 'bg-pink-50 text-pink-600' },
  ];

  const filteredCategories = reportCategories.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ReportsHeader 
        title="Reports Hub" 
        description="Generate, view, and analyze organizational data"
      />

      {/* Metric Cards (Dummy Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#d6d9df] flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg"><BarChart3 size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Report Types</p>
            <p className="text-2xl font-bold text-slate-800">24</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#d6d9df] flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Activity size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Recently Generated</p>
            <p className="text-2xl font-bold text-slate-800">12</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#d6d9df] flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><DownloadCloud size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Downloads This Month</p>
            <p className="text-2xl font-bold text-slate-800">148</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#d6d9df] flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><History size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Most Used</p>
            <p className="text-sm font-bold text-slate-800 mt-1">Monthly Attendance</p>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white p-5 rounded-xl border border-[#d6d9df]">
        <h3 className="font-bold text-slate-800 mb-4">Report Categories</h3>
        <div className="mb-6">
          <ReportSearch 
            placeholder="Search for a report category..." 
            value={searchQuery} 
            onChange={setSearchQuery} 
          />
        </div>
        
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <ReportCard key={category.id} {...category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No report categories found matching "{searchQuery}".
          </div>
        )}
      </div>

      {/* Recent Reports Table */}
      <RecentReports />
    </div>
  );
}
