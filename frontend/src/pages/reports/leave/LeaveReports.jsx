import React, { useState } from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import ExportMenu from '../components/common/ExportMenu';
import { CalendarDays, CheckCircle, History } from 'lucide-react';
import { exportReport } from '../../../services/reportService';

// Report types that have backend services implemented
const IMPLEMENTED_TYPES = new Set(['balance']);

export default function LeaveReports() {
  const [isExporting, setIsExporting] = useState(false);
  const [activeReportType, setActiveReportType] = useState('balance');

  const isImplemented = IMPLEMENTED_TYPES.has(activeReportType);

  const handleExport = async (format) => {
    if (!isImplemented) return;
    setIsExporting(true);
    try {
      await exportReport('leave', activeReportType, format);
    } catch (error) {
      alert('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

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
        actionButton={<ExportMenu onExport={handleExport} isExporting={isExporting} disabled={!isImplemented} />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {subReports.map(report => (
          <div 
            key={report.id} 
            onClick={() => setActiveReportType(report.id)} 
            className={`cursor-pointer relative ${activeReportType === report.id ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
          >
            <ReportCard {...report} colorClass="bg-orange-50 text-orange-600" />
            {!IMPLEMENTED_TYPES.has(report.id) && (
              <span className="absolute top-2 right-2 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Coming Soon</span>
            )}
          </div>
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
