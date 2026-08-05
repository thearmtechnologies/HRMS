import React from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import { Users, UserPlus, FileSpreadsheet } from 'lucide-react';

export default function EmployeeReports() {
  const subReports = [
    { id: 'directory', title: 'Employee Directory', description: 'Complete list of active employees with contact info.', icon: Users, path: '#' },
    { id: 'joining', title: 'New Joiners Report', description: 'Employees who joined within a specific date range.', icon: UserPlus, path: '#' },
    { id: 'profile', title: 'Profile Completeness', description: 'Audit report for missing employee data fields.', icon: FileSpreadsheet, path: '#' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ReportBreadcrumb items={[{ label: 'Employee Reports' }]} />
      
      <ReportsHeader 
        title="Employee Reports" 
        description="Select a report type below and configure filters to generate data."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {subReports.map(report => (
          <ReportCard key={report.id} {...report} colorClass="bg-purple-50 text-purple-600" />
        ))}
      </div>

      <div className="border-t border-[#d6d9df] pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Report Configuration</h3>
        <ReportFilters filters={['department', 'designation', 'status']} />
        <EmptyReportState />
      </div>
    </div>
  );
}
