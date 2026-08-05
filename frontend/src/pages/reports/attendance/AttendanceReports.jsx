import React from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export default function AttendanceReports() {
  const subReports = [
    { id: 'monthly', title: 'Monthly Attendance', description: 'Comprehensive monthly view of employee attendance.', icon: Calendar, path: '#' },
    { id: 'daily', title: 'Daily Attendance', description: 'Day-to-day attendance tracking and logs.', icon: Clock, path: '#' },
    { id: 'late', title: 'Late Check-in Report', description: 'Employees who arrived late beyond the grace period.', icon: AlertCircle, path: '#' },
    { id: 'overtime', title: 'Overtime Summary', description: 'Calculated overtime hours and rates.', icon: Clock, path: '#' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ReportBreadcrumb items={[{ label: 'Attendance Reports' }]} />
      
      <ReportsHeader 
        title="Attendance Reports" 
        description="Select a report type below and configure filters to generate data."
      />

      {/* Sub-report selection cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {subReports.map(report => (
          <ReportCard key={report.id} {...report} colorClass="bg-blue-50 text-blue-600" />
        ))}
      </div>

      <div className="border-t border-[#d6d9df] pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Report Configuration</h3>
        
        {/* Dynamic Filters UI */}
        <ReportFilters filters={['dateRange', 'department', 'employee', 'shift']} />
        
        {/* Dummy Table / Empty State */}
        <EmptyReportState />
      </div>
    </div>
  );
}
