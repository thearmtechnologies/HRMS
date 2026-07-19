import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, Calendar, Filter, Loader2 } from 'lucide-react';

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

export default function ExportPayrollModal({ isOpen, onClose, defaultMonth, defaultYear }) {
  const [periodType, setPeriodType] = useState('single'); // 'single', 'range', 'all'
  const [month, setMonth] = useState(defaultMonth || new Date().getMonth() + 1);
  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  
  const [status, setStatus] = useState('');
  const [calculationMode, setCalculationMode] = useState('');
  const [format, setFormat] = useState('csv'); // 'csv' or 'excel'
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 3; y <= currentYear + 1; y++) years.push(y);

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (periodType === 'single') {
        if (month) params.append('month', month);
        if (year) params.append('year', year);
      } else if (periodType === 'range') {
        params.append('startMonth', startMonth);
        params.append('startYear', startYear);
        params.append('endMonth', endMonth);
        params.append('endYear', endYear);
      } // 'all' appends no period params

      if (status) params.append('status', status);
      if (calculationMode) params.append('calculationMode', calculationMode);

      const endpoint = format === 'csv' 
        ? `http://localhost:5000/api/pay/export/csv?${params}`
        : `http://localhost:5000/api/pay/export/excel?${params}`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = format === 'csv' ? 'csv' : 'xls';
      a.download = `payroll_export_${periodType}_${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export payroll data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-[#f0f3f5] border-b border-[#d6d9df]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl">
                <Download size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Export Payroll Data</h3>
                <p className="text-xs text-[#8f9192]">Select custom period and filters to download</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-[#8f9192] hover:text-[#1E293B] hover:bg-[#d6d9df]/40 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleExport} className="p-6 space-y-5">
            {/* Period Type Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-2">Period Interval</label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#f0f3f5] rounded-xl">
                <button
                  type="button"
                  onClick={() => setPeriodType('single')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    periodType === 'single' ? 'bg-[#fdfdfe] text-[#1E293B] shadow-sm' : 'text-[#8f9192] hover:text-[#1E293B]'
                  }`}
                >
                  Specific Month
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('range')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    periodType === 'range' ? 'bg-[#fdfdfe] text-[#1E293B] shadow-sm' : 'text-[#8f9192] hover:text-[#1E293B]'
                  }`}
                >
                  Custom Range
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('all')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    periodType === 'all' ? 'bg-[#fdfdfe] text-[#1E293B] shadow-sm' : 'text-[#8f9192] hover:text-[#1E293B]'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            {/* Single Month Selectors */}
            {periodType === 'single' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="exportSingleMonth" className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-1.5">Month</label>
                  <select
                    id="exportSingleMonth"
                    name="exportSingleMonth"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#f0f3f5] rounded-xl text-xs font-semibold text-[#1E293B] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                  >
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="exportSingleYear" className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-1.5">Year</label>
                  <select
                    id="exportSingleYear"
                    name="exportSingleYear"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#f0f3f5] rounded-xl text-xs font-semibold text-[#1E293B] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Custom Range Selectors */}
            {periodType === 'range' && (
              <div className="space-y-3 p-3.5 bg-[#f0f3f5]/60 rounded-xl border border-[#d6d9df]/60">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="exportStartMonth" className="block text-[11px] font-bold uppercase tracking-wider text-[#8f9192] mb-1">From Month</label>
                    <select
                      id="exportStartMonth"
                      name="exportStartMonth"
                      value={startMonth}
                      onChange={(e) => setStartMonth(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-[#fdfdfe] rounded-lg text-xs font-semibold text-[#1E293B] border border-[#d6d9df]"
                    >
                      {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="exportStartYear" className="block text-[11px] font-bold uppercase tracking-wider text-[#8f9192] mb-1">From Year</label>
                    <select
                      id="exportStartYear"
                      name="exportStartYear"
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-[#fdfdfe] rounded-lg text-xs font-semibold text-[#1E293B] border border-[#d6d9df]"
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="exportEndMonth" className="block text-[11px] font-bold uppercase tracking-wider text-[#8f9192] mb-1">To Month</label>
                    <select
                      id="exportEndMonth"
                      name="exportEndMonth"
                      value={endMonth}
                      onChange={(e) => setEndMonth(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-[#fdfdfe] rounded-lg text-xs font-semibold text-[#1E293B] border border-[#d6d9df]"
                    >
                      {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="exportEndYear" className="block text-[11px] font-bold uppercase tracking-wider text-[#8f9192] mb-1">To Year</label>
                    <select
                      id="exportEndYear"
                      name="exportEndYear"
                      value={endYear}
                      onChange={(e) => setEndYear(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-[#fdfdfe] rounded-lg text-xs font-semibold text-[#1E293B] border border-[#d6d9df]"
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="exportStatus" className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-1.5">Status Filter</label>
                <select
                  id="exportStatus"
                  name="exportStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f0f3f5] rounded-xl text-xs font-semibold text-[#1E293B] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                >
                  <option value="">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Generated">Generated</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label htmlFor="exportCalcMode" className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-1.5">Mode Filter</label>
                <select
                  id="exportCalcMode"
                  name="exportCalcMode"
                  value={calculationMode}
                  onChange={(e) => setCalculationMode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f0f3f5] rounded-xl text-xs font-semibold text-[#1E293B] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                >
                  <option value="">All Modes</option>
                  <option value="system">System Calculated</option>
                  <option value="custom">Custom Assigned</option>
                </select>
              </div>
            </div>

            {/* File Format */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-2">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    format === 'csv'
                      ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]'
                      : 'bg-[#fdfdfe] border-[#d6d9df] text-[#8f9192] hover:bg-[#f0f3f5]'
                  }`}
                >
                  <FileText size={16} /> CSV Spreadsheet (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('excel')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    format === 'excel'
                      ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]'
                      : 'bg-[#fdfdfe] border-[#d6d9df] text-[#8f9192] hover:bg-[#f0f3f5]'
                  }`}
                >
                  <FileSpreadsheet size={16} /> Excel Workbook (.xls)
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#d6d9df]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#8f9192] hover:bg-[#f0f3f5] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-[#fdfdfe] text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Download Export
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
