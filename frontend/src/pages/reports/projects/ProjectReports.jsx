import React from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import { FolderKanban, Users, Clock } from 'lucide-react';

export default function ProjectReports() {
  const subReports = [
    { id: 'allocation', title: 'Project Allocations', description: 'Employee distribution across active projects.', icon: FolderKanban, path: '#' },
    { id: 'timeline', title: 'Project Timelines', description: 'Status and timelines of all projects.', icon: Clock, path: '#' },
    { id: 'team', title: 'Team Utilization', description: 'Utilization rates of project teams.', icon: Users, path: '#' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ReportBreadcrumb items={[{ label: 'Project Reports' }]} />
      <ReportsHeader 
        title="Project Reports" 
        description="Select a report type below and configure filters to generate data."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {subReports.map(report => (
          <ReportCard key={report.id} {...report} colorClass="bg-pink-50 text-pink-600" />
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
