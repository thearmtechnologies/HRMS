import React from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import { Building2, TrendingUp, Users } from 'lucide-react';

export default function DepartmentReports() {
  const subReports = [
    { id: 'headcount', title: 'Department Headcount', description: 'Total active headcount segmented by department.', icon: Users, path: '#' },
    { id: 'growth', title: 'Department Growth', description: 'Month-over-month growth and attrition per department.', icon: TrendingUp, path: '#' },
    { id: 'structure', title: 'Department Structure', description: 'Organizational hierarchy and role distribution.', icon: Building2, path: '#' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ReportBreadcrumb items={[{ label: 'Department Reports' }]} />
      <ReportsHeader 
        title="Department Reports" 
        description="Select a report type below and configure filters to generate data."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {subReports.map(report => (
          <ReportCard key={report.id} {...report} colorClass="bg-indigo-50 text-indigo-600" />
        ))}
      </div>
      <div className="border-t border-[#d6d9df] pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Report Configuration</h3>
        <ReportFilters filters={['dateRange', 'department']} />
        <EmptyReportState />
      </div>
    </div>
  );
}
