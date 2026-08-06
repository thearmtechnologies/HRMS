import React, { useState } from 'react';
import ReportsHeader from '../components/layout/ReportsHeader';
import ReportBreadcrumb from '../components/layout/ReportBreadcrumb';
import ReportFilters from '../components/filters/ReportFilters';
import EmptyReportState from '../components/common/EmptyReportState';
import ReportCard from '../components/cards/ReportCard';
import ExportMenu from '../components/common/ExportMenu';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { exportReport } from '../../../services/reportService';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const pad = (value) => String(value).padStart(2, '0');

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

export default function AttendanceReports() {
  const [isExporting, setIsExporting] = useState(false);
  const [activeReportType, setActiveReportType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()));

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 3; year <= currentYear + 1; year += 1) {
    years.push(year);
  }

  const isMonthly = activeReportType === 'monthly';

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const filters = activeReportType === 'daily'
        ? { date: selectedDate }
        : { month: selectedMonth, year: selectedYear };

      await exportReport('attendance', activeReportType, format, filters);
    } catch (error) {
      alert('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const subReports = [
    { id: 'monthly', title: 'Monthly Attendance', description: 'Comprehensive monthly view of employee attendance.', icon: Calendar, path: '#' },
    { id: 'daily', title: 'Daily Attendance', description: 'Day-to-day attendance tracking and logs.', icon: Clock, path: '#' },
    { id: 'late', title: 'Late Check-in Report', description: 'Employees who arrived late beyond the grace period.', icon: AlertCircle, path: '#' },
    { id: 'overtime', title: 'Overtime Summary', description: 'Calculated overtime hours and rates.', icon: Clock, path: '#' },
  ];

  const reportConfigTitle = activeReportType === 'monthly'
    ? 'Monthly Report Settings'
    : activeReportType === 'daily'
      ? 'Daily Report Settings'
      : 'Monthly Summary Settings';

  const reportConfigMessage = activeReportType === 'monthly'
    ? 'Choose a month and year, then export the official attendance summary.'
    : activeReportType === 'daily'
      ? 'Choose a specific day to download that day’s attendance log.'
      : 'Choose a month and year to download the selected attendance summary.';

  const exportFormats = ['pdf', 'excel', 'csv'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ReportBreadcrumb items={[{ label: 'Attendance Reports' }]} />
      
      <ReportsHeader 
        title="Attendance Reports" 
        description={reportConfigMessage}
        actionButton={<ExportMenu onExport={handleExport} isExporting={isExporting} disabled={false} formats={exportFormats} />}
      />

      {/* Sub-report selection cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {subReports.map(report => (
          <div key={report.id} className="relative">
            <ReportCard
              {...report}
              onClick={() => setActiveReportType(report.id)}
              selected={activeReportType === report.id}
              colorClass={activeReportType === report.id ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'}
            />
          </div>
        ))}
      </div>

      <div className="border-t border-[#d6d9df] pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{reportConfigTitle}</h3>

        {activeReportType === 'monthly' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        ) : activeReportType === 'daily' ? (
          <div className="mb-6 max-w-sm">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <ReportFilters filters={activeReportType === 'monthly' ? ['dateRange', 'department', 'employee', 'shift'] : activeReportType === 'daily' ? ['dateRange', 'department', 'employee'] : ['dateRange', 'department', 'employee', 'shift']} />

        <EmptyReportState />
      </div>
    </div>
  );
}
