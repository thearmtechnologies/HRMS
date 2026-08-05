import React from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import { Wallet, Calculator, TrendingDown, Receipt } from 'lucide-react';

export default function PayrollReports() {
  const subReports = [
    { id: 'payroll_register', title: 'Payroll Register', description: 'Comprehensive payroll register for the selected month.', icon: Wallet, path: '#' },
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
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {subReports.map(report => (
          <ReportCard key={report.id} {...report} colorClass="bg-emerald-50 text-emerald-600" />
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
