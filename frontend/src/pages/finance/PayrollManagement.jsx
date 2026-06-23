import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Search, Download, Filter, MoreHorizontal, 
  Calendar, Building2, CheckCircle2, FileText, 
  Edit, Wallet, ChevronDown, CheckCircle, Clock,
  Users, IndianRupee, Lock, Unlock, Mail,
  BarChart3, Loader2, RefreshCw, FileSpreadsheet,
  Eye, CreditCard, AlertTriangle
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import GeneratePayrollModal from './GeneratePayrollModal';
import ReviewPayrollModal from './ReviewPayrollModal';

const MONTHS = [
  { value: '', label: 'All Months' },
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Generated', label: 'Generated' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Paid', label: 'Paid' },
];

const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const StatusBadge = ({ status }) => {
  const styles = {
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    Generated: 'bg-blue-50 text-blue-700 border-blue-200',
    Approved: 'bg-green-50 text-green-700 border-green-200',
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }[status] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${styles}`}>
      {status}
    </span>
  );
};

export default function PayrollManagement() {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reviewPayroll, setReviewPayroll] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  const isAdmin = user?.role === 'admin';

  const fetchPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:5000/api/pay/final-payroll?${params}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setPayrolls(data);
      }
    } catch (err) {
      console.error('Error fetching payrolls:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedStatus, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);

      const response = await fetch(`http://localhost:5000/api/pay/dashboard-stats?${params}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchPayrolls();
    fetchStats();
  }, [fetchPayrolls, fetchStats]);

  const refreshData = () => {
    fetchPayrolls();
    fetchStats();
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleDownloadPdf = async (record) => {
    setActionLoading(`pdf-${record._id}`);
    try {
      const empId = record.employee?.employeeId;
      const params = new URLSearchParams({
        month: record.payrollInfo?.month,
        year: record.payrollInfo?.year,
      });
      if (empId) params.append('employeeId', empId);

      const response = await fetch(`http://localhost:5000/api/pay/pdf?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('PDF download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const disposition = response.headers.get('content-disposition');
      let filename = `payslip.pdf`;
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match) filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setActionLoading('');
      setActiveDropdown(null);
    }
  };

  const handleStatusChange = async (record, newStatus) => {
    setActionLoading(`status-${record._id}`);
    try {
      const response = await fetch(`http://localhost:5000/api/pay/payroll/${record._id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        refreshData();
      } else {
        const data = await response.json();
        alert(data.message || 'Status update failed');
      }
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setActionLoading('');
      setActiveDropdown(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);

      const response = await fetch(`http://localhost:5000/api/pay/export/csv?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${selectedMonth || 'all'}_${selectedYear || 'all'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('CSV export error:', err);
    }
    setShowExportMenu(false);
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);

      const response = await fetch(`http://localhost:5000/api/pay/export/excel?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${selectedMonth || 'all'}_${selectedYear || 'all'}.xls`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Excel export error:', err);
    }
    setShowExportMenu(false);
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) years.push(y);

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Payroll Management</h1>
          <p className="text-[#8f9192] mt-1">Review, process, and manage employee salaries and payslips.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-3 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] text-[#8f9192] hover:text-[#1E293B] text-sm font-semibold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all"
          >
            <RefreshCw size={16} />
          </button>
          
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] text-[#8f9192] hover:text-[#1E293B] text-sm font-semibold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all"
            >
              <Download size={18} />
              Export
              <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-12 w-44 bg-[#fdfdfe] rounded-xl shadow-lg border border-[#d6d9df] z-20 py-2 overflow-hidden">
                  <button onClick={handleExportCSV} className="w-full px-4 py-2.5 text-sm font-medium text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#1E293B] flex items-center gap-2 transition-colors">
                    <FileText size={16} /> Export CSV
                  </button>
                  <button onClick={handleExportExcel} className="w-full px-4 py-2.5 text-sm font-medium text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#1E293B] flex items-center gap-2 transition-colors">
                    <FileSpreadsheet size={16} /> Export Excel
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] text-[#fdfdfe] text-sm font-semibold rounded-lg shadow-sm hover:bg-[#2563EB] transition-all"
          >
            <Wallet size={18} />
            Generate Payroll
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { title: 'Total Employees', value: stats.totalEmployees || 0, icon: Users, color: 'bg-[#f0f3f5] text-[#1E293B]' },
            { title: 'Salary Assigned', value: stats.salaryAssigned || 0, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
            { title: 'Salary Missing', value: stats.salaryMissing || 0, icon: AlertTriangle, color: 'bg-orange-50 text-orange-500' },
            { title: 'Pending', value: stats.payrollPending || 0, icon: Clock, color: 'bg-orange-50 text-orange-500' },
            { title: 'Generated', value: stats.payrollProcessed || 0, icon: FileText, color: 'bg-blue-50 text-blue-600' },
            { title: 'Approved', value: stats.payrollApproved || 0, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
            { title: 'Paid', value: stats.payrollPaid || 0, icon: CreditCard, color: 'bg-emerald-50 text-emerald-600' },
            { title: 'Monthly Amount', value: formatINR(stats.monthlyPayrollAmount || 0), icon: IndianRupee, color: 'bg-purple-50 text-purple-600', isAmount: true },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm hover:border-[#bdc2c7] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 ${card.color} rounded-xl`}>
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className={`${card.isAmount ? 'text-lg' : 'text-2xl'} font-bold text-[#1E293B]`}>{card.value}</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8f9192] mt-1">{card.title}</p>
              </div>
            );
          })}
        </div>

        {/* Payroll Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-[#f0f3f5] rounded-xl text-[#1E293B]">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8f9192] mb-1">Total Gross Salary</p>
              <h2 className="text-xl font-bold text-[#1E293B]">{formatINR(stats.totalGrossSalary || 0)}</h2>
            </div>
          </div>
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-red-50 rounded-xl text-red-500">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8f9192] mb-1">Total Deductions</p>
              <h2 className="text-xl font-bold text-red-600">{formatINR(stats.totalDeductions || 0)}</h2>
            </div>
          </div>
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8f9192] mb-1">Total Overtime</p>
              <h2 className="text-xl font-bold text-purple-600">{formatINR(stats.totalOvertimeAmount || 0)}</h2>
            </div>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-visible">
          
          {/* Filters */}
          <div className="p-5 border-b border-[#d6d9df] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#fdfdfe] rounded-t-2xl">
            
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#bdc2c7]" />
              </div>
              <input 
                type="text" 
                placeholder="Search employee or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Month */}
              <div className="relative w-full sm:w-40">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-[#8f9192]" />
                </div>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : '')}
                  className="w-full appearance-none pl-10 pr-10 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-semibold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all cursor-pointer"
                >
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
              </div>

              {/* Year */}
              <div className="relative w-full sm:w-28">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full appearance-none px-4 pr-10 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-semibold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all cursor-pointer"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
              </div>

              {/* Status */}
              <div className="relative w-full sm:w-36">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-[#8f9192]" />
                </div>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none pl-10 pr-10 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#8f9192] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all cursor-pointer"
                >
                  {STATUS_FILTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-[#3B82F6] mb-3" />
                <p className="text-sm text-[#8f9192]">Loading payroll data...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#f0f3f5]/50 border-b border-[#d6d9df] text-xs font-bold uppercase tracking-wider text-[#bdc2c7]">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4 text-center">Period</th>
                    <th className="px-6 py-4 text-right">Gross</th>
                    <th className="px-6 py-4 text-right">Deductions</th>
                    <th className="px-6 py-4 text-right">Net Salary</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3f5]">
                  {payrolls.map((record) => (
                    <tr key={record._id} className="hover:bg-[#f0f3f5]/30 transition-colors group">
                      
                      {/* Employee */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#f0f3f5] border border-[#d6d9df] text-[#1E293B] flex items-center justify-center font-bold text-sm shadow-sm">
                            {getInitials(record.employee?.name)}
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B] text-sm">{record.employee?.name || 'N/A'}</p>
                            <p className="text-xs text-[#bdc2c7] font-medium mt-0.5">
                              {record.employee?.employeeId || ''}
                              {record.isLocked && <Lock size={10} className="inline ml-1 text-orange-500" />}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[#8f9192]">{record.employee?.department || 'N/A'}</span>
                      </td>

                      {/* Period */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-[#8f9192]">
                          {MONTH_NAMES[(record.payrollInfo?.month || 1) - 1]?.slice(0, 3)} {record.payrollInfo?.year}
                        </span>
                      </td>

                      {/* Gross */}
                      <td className="px-6 py-4 text-right text-sm font-medium text-[#8f9192]">
                        {formatINR(record.totals?.grossSalary)}
                      </td>

                      {/* Deductions */}
                      <td className="px-6 py-4 text-right text-sm font-medium text-red-500">
                        -{formatINR((record.totals?.totalDeductions || 0) + (record.totals?.leaveDeduction || 0))}
                      </td>

                      {/* Net */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-base font-bold text-[#1E293B] bg-[#3B82F6]/5 px-3 py-1.5 rounded-lg border border-[#3B82F6]/10">
                          {formatINR(record.totals?.netPay)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={record.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center relative">
                        <button 
                          onClick={() => toggleDropdown(record._id)}
                          className="p-2 text-[#bdc2c7] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-lg transition-colors focus:outline-none"
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {activeDropdown === record._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                            <div className="absolute right-8 top-12 w-52 bg-[#fdfdfe] rounded-xl shadow-lg border border-[#d6d9df] z-20 py-2 overflow-hidden text-left">
                              
                              {/* Review / View */}
                              <button
                                onClick={() => { setReviewPayroll(record); setActiveDropdown(null); }}
                                className="w-full px-4 py-2.5 text-sm font-medium text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#1E293B] flex items-center gap-2 transition-colors"
                              >
                                <Eye size={16} /> Review Details
                              </button>

                              {/* Approve */}
                              {record.status === 'Generated' && ['admin', 'hr'].includes(user?.role) && (
                                <button
                                  onClick={() => handleStatusChange(record, 'Approved')}
                                  disabled={actionLoading === `status-${record._id}`}
                                  className="w-full px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
                                >
                                  <CheckCircle2 size={16} /> Approve Payroll
                                </button>
                              )}

                              {/* Mark Paid */}
                              {record.status === 'Approved' && isAdmin && (
                                <button
                                  onClick={() => handleStatusChange(record, 'Paid')}
                                  disabled={actionLoading === `status-${record._id}`}
                                  className="w-full px-4 py-2.5 text-sm font-medium text-[#3B82F6] hover:bg-blue-50 flex items-center gap-2 transition-colors"
                                >
                                  <CreditCard size={16} /> Mark as Paid
                                </button>
                              )}

                              <div className="h-px bg-[#f0f3f5] my-1" />

                              {/* Download PDF */}
                              <button
                                onClick={() => handleDownloadPdf(record)}
                                disabled={actionLoading === `pdf-${record._id}`}
                                className="w-full px-4 py-2.5 text-sm font-medium text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#1E293B] flex items-center gap-2 transition-colors"
                              >
                                {actionLoading === `pdf-${record._id}` ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                                Download Payslip
                              </button>

                              {/* Email */}
                              {['Approved', 'Paid'].includes(record.status) && (
                                <button
                                  onClick={async () => {
                                    setActionLoading(`email-${record._id}`);
                                    try {
                                      const response = await fetch(`http://localhost:5000/api/pay/payroll/${record._id}/email`, {
                                        method: 'POST', headers
                                      });
                                      if (response.ok) {
                                        refreshData();
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                    setActionLoading('');
                                    setActiveDropdown(null);
                                  }}
                                  disabled={actionLoading === `email-${record._id}`}
                                  className="w-full px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 flex items-center gap-2 transition-colors"
                                >
                                  {actionLoading === `email-${record._id}` ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                  Email Payslip
                                  {record.tracking?.emailSent && <span className="text-[10px] ml-auto text-green-500">Sent</span>}
                                </button>
                              )}

                              {/* Lock/Unlock (Admin) */}
                              {isAdmin && (
                                <>
                                  <div className="h-px bg-[#f0f3f5] my-1" />
                                  {record.isLocked ? (
                                    <button
                                      onClick={async () => {
                                        await fetch(`http://localhost:5000/api/pay/payroll/${record._id}/unlock`, {
                                          method: 'PATCH', headers
                                        });
                                        refreshData();
                                        setActiveDropdown(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                    >
                                      <Unlock size={16} /> Unlock Payroll
                                    </button>
                                  ) : (
                                    <button
                                      onClick={async () => {
                                        await fetch(`http://localhost:5000/api/pay/payroll/${record._id}/lock`, {
                                          method: 'PATCH', headers
                                        });
                                        refreshData();
                                        setActiveDropdown(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                    >
                                      <Lock size={16} /> Lock Payroll
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Empty State */}
            {!loading && payrolls.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 bg-[#f0f3f5] rounded-full flex items-center justify-center text-[#bdc2c7] mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-1">No payroll records found</h3>
                <p className="text-[#8f9192] max-w-sm">
                  {searchTerm || selectedStatus
                    ? 'No records match your filters. Try adjusting your search criteria.'
                    : 'No payroll has been generated for this period. Click "Generate Payroll" to get started.'}
                </p>
                {(searchTerm || selectedStatus) && (
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedStatus(''); }}
                    className="mt-4 text-[#1E293B] font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#d6d9df] flex items-center justify-between bg-[#fdfdfe] rounded-b-2xl">
            <p className="text-sm text-[#8f9192] font-medium">
              Showing <span className="font-bold text-[#1E293B]">{payrolls.length}</span> records
              {selectedMonth && <span> for <span className="font-bold text-[#1E293B]">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span></span>}
            </p>
          </div>

        </div>
      </div>

      {/* Modals */}
      <GeneratePayrollModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerated={refreshData}
      />

      <ReviewPayrollModal
        isOpen={!!reviewPayroll}
        onClose={() => setReviewPayroll(null)}
        payroll={reviewPayroll}
        onStatusChange={refreshData}
        onRefresh={() => {
          refreshData();
          // Re-fetch the specific payroll for the review modal
          if (reviewPayroll?._id) {
            fetch(`http://localhost:5000/api/pay/final-payroll?month=${reviewPayroll.payrollInfo?.month}&year=${reviewPayroll.payrollInfo?.year}&employeeId=${reviewPayroll.employee?.employeeId}`, { headers })
              .then(r => r.json())
              .then(data => {
                if (data.length > 0) setReviewPayroll(data[0]);
              })
              .catch(() => {});
          }
        }}
      />
    </div>
  );
}