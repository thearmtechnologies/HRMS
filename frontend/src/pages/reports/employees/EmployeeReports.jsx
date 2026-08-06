import React, { useState } from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import ExportMenu from '../components/common/ExportMenu';
import { Users, UserPlus, FileSpreadsheet } from 'lucide-react';
import { exportReport } from '../../../services/reportService';

// Report types that have backend services implemented
const IMPLEMENTED_TYPES = new Set(['directory']);

export default function EmployeeReports() {
  const [isExporting, setIsExporting] = useState(false);
  const [activeReportType, setActiveReportType] = useState('directory');

  const isImplemented = IMPLEMENTED_TYPES.has(activeReportType);

  const handleExport = async (format) => {
    if (!isImplemented) return;
    setIsExporting(true);
    try {
      await exportReport('employees', activeReportType, format);
    } catch (error) {
      alert('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

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
        actionButton={<ExportMenu onExport={handleExport} isExporting={isExporting} disabled={!isImplemented} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {subReports.map(report => (
          <div 
            key={report.id} 
            onClick={() => setActiveReportType(report.id)} 
            className={`cursor-pointer relative ${activeReportType === report.id ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
          >
            <ReportCard {...report} colorClass="bg-purple-50 text-purple-600" />
            {!IMPLEMENTED_TYPES.has(report.id) && (
              <span className="absolute top-2 right-2 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Coming Soon</span>
            )}
          </div>
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
