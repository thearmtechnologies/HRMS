import React from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import { CalendarDays, CheckCircle, History } from 'lucide-react';

export default function LeaveReports() {
  const subReports = [
    { id: 'balance', title: 'Leave Balance', description: 'Current leave balances for all employees.', icon: CalendarDays, path: '#' },
    { id: 'history', title: 'Leave History', description: 'Historical leave consumption and requests.', icon: History, path: '#' },
    { id: 'approval', title: 'Leave Approvals', description: 'Status of all leave requests (Approved/Pending/Rejected).', icon: CheckCircle, path: '#' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ReportBreadcrumb items={[{ label: 'Leave Reports' }]} />
      <ReportsHeader 
        title="Leave Reports" 
        description="Select a report type below and configure filters to generate data."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {subReports.map(report => (
          <ReportCard key={report.id} {...report} colorClass="bg-orange-50 text-orange-600" />
        ))}
      </div>
      <div className="border-t border-[#d6d9df] pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Report Configuration</h3>
        <ReportFilters filters={['dateRange', 'department', 'employee', 'status']} />
        <EmptyReportState />
      </div>
    </div>
  );
}
