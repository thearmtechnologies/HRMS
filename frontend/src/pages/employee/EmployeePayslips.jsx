import React, { useState, useEffect, useContext } from 'react';
import { 
  Wallet, IndianRupee, FileText, Download, Calendar, 
  Clock, Eye, Loader2, ChevronDown, TrendingUp
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatINR = (amount) => {
  if (!amount && amount !== 0) return '₹0';
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

export default function EmployeePayslips() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewPayroll, setViewPayroll] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Use employeeId from user context
      const empId = user?.employeeId;
      if (!empId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/pay/employee-history/${empId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Error fetching payroll history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (payroll) => {
    setDownloadingId(payroll._id);
    try {
      const params = new URLSearchParams({
        month: payroll.month,
        year: payroll.year,
        employeeId: history?.employee?.employeeId || user?.employeeId,
      });

      const response = await fetch(`http://localhost:5000/api/pay/pdf?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip_${payroll.monthName}_${payroll.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f3f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#3B82F6] mx-auto mb-3" />
          <p className="text-sm text-[#8f9192]">Loading payroll history...</p>
        </div>
      </div>
    );
  }

  const summary = history?.summary || {};
  const payrolls = history?.payrolls || [];

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="max-w-screen-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">My Payslips</h1>
        <p className="text-[#8f9192] mt-1">View your salary history and download payslips.</p>
      </div>

      <div className="max-w-screen-xl mx-auto space-y-6">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-[#f0f3f5] rounded-xl text-[#1E293B]">
              <IndianRupee size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-1">Current Salary</p>
              <h2 className="text-2xl font-bold text-[#1E293B]">{formatINR(summary.currentSalary)}</h2>
            </div>
          </div>

          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-1">Last Payslip</p>
              <h2 className="text-2xl font-bold text-[#1E293B]">{formatINR(summary.lastPayslipAmount)}</h2>
              <p className="text-[10px] text-[#bdc2c7] font-medium mt-0.5">{summary.lastPayslipMonth || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-green-50 rounded-xl text-green-600">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-1">Total Earnings ({new Date().getFullYear()})</p>
              <h2 className="text-2xl font-bold text-[#1E293B]">{formatINR(summary.totalEarningsThisYear)}</h2>
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
          
          <div className="px-6 py-5 border-b border-[#d6d9df]">
            <h2 className="text-base font-bold text-[#1E293B]">Payroll History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f3f5]/50 border-b border-[#d6d9df] text-xs font-bold uppercase tracking-wider text-[#bdc2c7]">
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4 text-right">Gross Salary</th>
                  <th className="px-6 py-4 text-right">OT Amount</th>
                  <th className="px-6 py-4 text-right">Deductions</th>
                  <th className="px-6 py-4 text-right">Net Salary</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3f5]">
                {payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-[#f0f3f5]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f0f3f5] rounded-lg">
                          <Calendar size={16} className="text-[#8f9192]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#1E293B] text-sm">{p.monthName} {p.year}</p>
                          {p.paidAt && (
                            <p className="text-[10px] text-[#bdc2c7] mt-0.5">
                              Paid on {new Date(p.paidAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-[#8f9192]">
                      {formatINR(p.grossSalary)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-purple-600">
                      {p.overtimeAmount > 0 ? `+${formatINR(p.overtimeAmount)}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-red-500">
                      {p.leaveDeduction > 0 ? `-${formatINR(p.leaveDeduction)}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-bold text-[#1E293B] bg-[#3B82F6]/5 px-3 py-1.5 rounded-lg border border-[#3B82F6]/10">
                        {formatINR(p.netPay)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(p)}
                          disabled={downloadingId === p._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#3B82F6] bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-lg hover:bg-[#3B82F6]/10 transition-colors disabled:opacity-50"
                        >
                          {downloadingId === p._id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payrolls.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-[#f0f3f5] rounded-full flex items-center justify-center text-[#bdc2c7] mb-4">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-1">No payslips yet</h3>
                <p className="text-[#8f9192]">Your payroll history will appear here once processed.</p>
              </div>
            )}
          </div>

          {payrolls.length > 0 && (
            <div className="px-6 py-4 border-t border-[#d6d9df]">
              <p className="text-sm text-[#8f9192]">
                Showing <span className="font-bold text-[#1E293B]">{payrolls.length}</span> payroll records
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
