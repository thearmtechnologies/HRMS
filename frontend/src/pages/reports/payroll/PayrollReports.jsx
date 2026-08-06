import React, { useState } from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import ExportMenu from '../components/common/ExportMenu';
import { Wallet, Calculator, TrendingDown, Receipt } from 'lucide-react';
import { exportReport } from '../../../services/reportService';

// Report types that have backend services implemented
const IMPLEMENTED_TYPES = new Set(['register']);

export default function PayrollReports() {
  const [isExporting, setIsExporting] = useState(false);
  const [activeReportType, setActiveReportType] = useState('register');

  const isImplemented = IMPLEMENTED_TYPES.has(activeReportType);

  const handleExport = async (format) => {
    if (!isImplemented) return;
    setIsExporting(true);
    try {
      await exportReport('payroll', activeReportType, format);
    } catch (error) {
      alert('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const subReports = [
    { id: 'register', title: 'Payroll Register', description: 'Comprehensive payroll register for the selected month.', icon: Wallet, path: '#' },
    { id: 'salary_register', title: 'Salary Register', description: 'Detailed salary breakdown by employee.', icon: Receipt, path: '#' },
    { id: 'overtime_payroll', title: 'Overtime Payouts', description: 'Overtime compensation distributed in payroll.', icon: Calculator, path: '#' },
    { id: 'late_deductions', title: 'Late Deductions', description: 'Penalties and deductions for late check-ins.', icon: TrendingDown, path: '#' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ReportBreadcrumb items={[{ label: 'Payroll Reports' }]} />
      <ReportsHeader 
        title="Payroll Reports" 
        description="Select a report type below and configure filters to generate data."
        actionButton={<ExportMenu onExport={handleExport} isExporting={isExporting} disabled={!isImplemented} />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {subReports.map(report => (
          <div 
            key={report.id} 
            onClick={() => setActiveReportType(report.id)} 
            className={`cursor-pointer relative ${activeReportType === report.id ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
          >
            <ReportCard {...report} colorClass="bg-emerald-50 text-emerald-600" />
            {!IMPLEMENTED_TYPES.has(report.id) && (
              <span className="absolute top-2 right-2 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Coming Soon</span>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-[#d6d9df] pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Report Configuration</h3>
        <ReportFilters filters={['dateRange', 'department', 'employee']} />
        <EmptyReportState />
      </div>
    </div>
  );
}
