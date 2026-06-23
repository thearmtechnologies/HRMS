import React, { useState } from 'react';
import {
  BarChart3, Download, Calendar, Building2, ChevronDown,
  Users, Clock, IndianRupee, FileText, FileSpreadsheet,
  Loader2, Filter
} from 'lucide-react';

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const REPORT_TYPES = [
  { value: 'monthly', label: 'Monthly Payroll Report', icon: Calendar, description: 'Summary of all payroll for a specific month' },
  { value: 'department', label: 'Department Report', icon: Building2, description: 'Payroll breakdown by department' },
  { value: 'overtime', label: 'Overtime Report', icon: Clock, description: 'Overtime hours and amounts' },
  { value: 'deduction', label: 'Deduction Report', icon: IndianRupee, description: 'All deductions breakdown' },
  { value: 'employee', label: 'Employee Report', icon: Users, description: 'Individual employee payroll history' },
];

const formatINR = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function PayrollReports() {
  const [reportType, setReportType] = useState('monthly');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 3; y <= currentYear + 1; y++) years.push(y);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const params = new URLSearchParams({ reportType, month, year });
      const response = await fetch(`http://localhost:5000/api/pay/reports?${params}`, { headers });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({ month, year });
      const response = await fetch(`http://localhost:5000/api/pay/export/csv?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_report_${month}_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams({ month, year });
      const response = await fetch(`http://localhost:5000/api/pay/export/excel?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_report_${month}_${year}.xls`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="max-w-screen-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Payroll Reports</h1>
        <p className="text-[#8f9192] mt-1">Generate and export payroll reports.</p>
      </div>

      <div className="max-w-screen-xl mx-auto space-y-6">

        {/* Report Type Selection */}
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#8f9192] mb-4">Select Report Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {REPORT_TYPES.map(rt => {
              const Icon = rt.icon;
              const selected = reportType === rt.value;
              return (
                <button
                  key={rt.value}
                  onClick={() => setReportType(rt.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selected
                      ? 'bg-[#3B82F6]/5 border-[#3B82F6] ring-2 ring-[#3B82F6]/20'
                      : 'bg-[#fdfdfe] border-[#d6d9df] hover:bg-[#f0f3f5]'
                  }`}
                >
                  <Icon size={20} className={selected ? 'text-[#3B82F6] mb-2' : 'text-[#8f9192] mb-2'} />
                  <p className={`text-sm font-bold ${selected ? 'text-[#1E293B]' : 'text-[#8f9192]'}`}>{rt.label}</p>
                  <p className="text-[10px] text-[#bdc2c7] mt-1">{rt.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters & Generate */}
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-2">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
              >
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
              Generate Report
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        {/* Report Results */}
        {reportData && (
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
            
            {/* Report Header */}
            <div className="px-6 py-5 border-b border-[#d6d9df] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#1E293B]">{reportData.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#8f9192] bg-[#f0f3f5] rounded-lg hover:bg-[#d6d9df] transition-colors"
                >
                  <FileText size={14} /> CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#8f9192] bg-[#f0f3f5] rounded-lg hover:bg-[#d6d9df] transition-colors"
                >
                  <FileSpreadsheet size={14} /> Excel
                </button>
              </div>
            </div>

            {/* Summary Stats (for monthly/overtime/deduction reports) */}
            {(reportData.totalEmployees !== undefined || reportData.totalOvertimeHours !== undefined || reportData.totalDeductions !== undefined) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#f0f3f5]/50 border-b border-[#d6d9df]">
                {reportData.totalEmployees !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1E293B]">{reportData.totalEmployees}</p>
                    <p className="text-[10px] font-bold uppercase text-[#8f9192]">Employees</p>
                  </div>
                )}
                {reportData.totalGross !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1E293B]">{formatINR(reportData.totalGross)}</p>
                    <p className="text-[10px] font-bold uppercase text-[#8f9192]">Total Gross</p>
                  </div>
                )}
                {reportData.totalNet !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatINR(reportData.totalNet)}</p>
                    <p className="text-[10px] font-bold uppercase text-[#8f9192]">Total Net</p>
                  </div>
                )}
                {reportData.totalOvertime !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{formatINR(reportData.totalOvertime)}</p>
                    <p className="text-[10px] font-bold uppercase text-[#8f9192]">Total Overtime</p>
                  </div>
                )}
                {reportData.totalOvertimeHours !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{reportData.totalOvertimeHours}h</p>
                    <p className="text-[10px] font-bold uppercase text-[#8f9192]">OT Hours</p>
                  </div>
                )}
                {reportData.totalOvertimeAmount !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{formatINR(reportData.totalOvertimeAmount)}</p>
                    <p className="text-[10px] font-bold uppercase text-[#8f9192]">OT Amount</p>
                  </div>
                )}
                {reportData.totalDeductions !== undefined && reportType === 'deduction' && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{formatINR(reportData.totalDeductions)}</p>
                    <p className="text-[10px] font-bold uppercase text-[#8f9192]">Total Deductions</p>
                  </div>
                )}
              </div>
            )}

            {/* Records Table */}
            <div className="overflow-x-auto">
              {reportData.records && reportData.records.length > 0 && (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#f0f3f5]/50 border-b border-[#d6d9df] text-xs font-bold uppercase tracking-wider text-[#bdc2c7]">
                      {Object.keys(reportData.records[0]).map(key => (
                        <th key={key} className="px-6 py-3 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f3f5]">
                    {reportData.records.map((row, i) => (
                      <tr key={i} className="hover:bg-[#f0f3f5]/30 transition-colors">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-6 py-3 text-sm text-[#1E293B] font-medium">
                            {typeof val === 'number' ? formatINR(val) : (val || 'N/A')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Department report */}
              {reportData.departments && reportData.departments.length > 0 && (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#f0f3f5]/50 border-b border-[#d6d9df] text-xs font-bold uppercase tracking-wider text-[#bdc2c7]">
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3 text-center">Employees</th>
                      <th className="px-6 py-3 text-right">Total Gross</th>
                      <th className="px-6 py-3 text-right">Total Net</th>
                      <th className="px-6 py-3 text-right">Total Overtime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f3f5]">
                    {reportData.departments.map((dept, i) => (
                      <tr key={i} className="hover:bg-[#f0f3f5]/30 transition-colors">
                        <td className="px-6 py-3 font-bold text-[#1E293B]">{dept.department}</td>
                        <td className="px-6 py-3 text-center">{dept.employees}</td>
                        <td className="px-6 py-3 text-right font-medium">{formatINR(dept.totalGross)}</td>
                        <td className="px-6 py-3 text-right font-bold text-[#1E293B]">{formatINR(dept.totalNet)}</td>
                        <td className="px-6 py-3 text-right text-purple-600">{formatINR(dept.totalOvertime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* No data */}
              {(!reportData.records || reportData.records.length === 0) && 
               (!reportData.departments || reportData.departments.length === 0) && (
                <div className="text-center py-12 text-[#bdc2c7]">
                  <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
                  <p>No data found for this report.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
