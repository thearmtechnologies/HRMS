import React, { useState, useContext } from 'react';
import {
  X, User, Briefcase, CalendarDays, Clock, IndianRupee,
  Plus, Trash2, Loader2, CheckCircle2, CreditCard, AlertTriangle,
  Lock, Mail
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const ADJUSTMENT_TYPES = ['Bonus', 'Incentive', 'Reimbursement', 'Penalty', 'Salary Correction'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const StatusBadge = ({ status }) => {
  const styles = {
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    Generated: 'bg-blue-50 text-blue-700 border-blue-200',
    Approved: 'bg-green-50 text-green-700 border-green-200',
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }[status] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${styles}`}>
      {status}
    </span>
  );
};

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="p-1.5 bg-[#f0f3f5] rounded-lg">
      <Icon size={16} className="text-[#1E293B]" />
    </div>
    <h3 className="text-sm font-bold uppercase tracking-wider text-[#8f9192]">{title}</h3>
  </div>
);

const InfoRow = ({ label, value, highlight = false }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-[#8f9192]">{label}</span>
    <span className={`text-sm font-semibold ${highlight ? 'text-[#1E293B] text-base' : 'text-[#1E293B]'}`}>
      {value}
    </span>
  </div>
);

const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function ReviewPayrollModal({ isOpen, onClose, payroll, onStatusChange, onRefresh }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [showAdjForm, setShowAdjForm] = useState(false);
  const [adjType, setAdjType] = useState('Bonus');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !payroll) return null;

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const isLocked = payroll.isLocked;
  const canEdit = !isLocked && ['Draft', 'Generated'].includes(payroll.status);
  const canApprove = payroll.status === 'Generated' && ['admin', 'hr'].includes(user?.role);
  const canMarkPaid = payroll.status === 'Approved' && ['admin'].includes(user?.role);
  const canEmail = ['Approved', 'Paid'].includes(payroll.status);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(newStatus);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`http://localhost:5000/api/pay/payroll/${payroll._id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setSuccessMsg(`Payroll ${newStatus.toLowerCase()} successfully`);
      if (onStatusChange) onStatusChange();
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleAddAdjustment = async () => {
    if (!adjAmount || !adjReason) {
      setError('Amount and reason are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/pay/payroll/${payroll._id}/adjustment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: adjType, amount: Number(adjAmount), reason: adjReason }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setAdjAmount('');
      setAdjReason('');
      setShowAdjForm(false);
      setSuccessMsg('Adjustment added');
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdjustment = async (adjId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/pay/payroll/${payroll._id}/adjustment/${adjId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      setSuccessMsg('Adjustment removed');
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPayslip = async () => {
    setActionLoading('email');
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/pay/payroll/${payroll._id}/email`, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSuccessMsg(data.message || 'Payslip emailed');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const emp = payroll.employee || {};
  const info = payroll.payrollInfo || {};
  const totals = payroll.totals || {};
  const adjustments = payroll.adjustments || [];
  const earnings = payroll.earnings || {};
  const deductions = payroll.deductions || {};

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="sticky top-0 bg-[#fdfdfe] flex items-center justify-between p-6 border-b border-[#d6d9df] rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#1E293B]">Payroll Review</h2>
                <p className="text-xs text-[#8f9192] mt-0.5">
                  {MONTH_NAMES[(info.month || 1) - 1]} {info.year}
                </p>
              </div>
              <StatusBadge status={payroll.status} />
              {isLocked && <Lock size={16} className="text-orange-500" />}
            </div>
            <button onClick={onClose} className="p-2 text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">

            {/* Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                <CheckCircle2 size={16} />
                {successMsg}
              </div>
            )}

            {/* Employee Info */}
            <div className="bg-[#f0f3f5] rounded-xl p-5">
              <SectionTitle icon={User} title="Employee Information" />
              <div className="grid grid-cols-2 gap-x-6 divide-y divide-[#d6d9df]/50">
                <InfoRow label="Name" value={emp.name || 'N/A'} />
                <InfoRow label="Employee ID" value={emp.employeeId || 'N/A'} />
                <InfoRow label="Department" value={emp.department || 'N/A'} />
                <InfoRow label="Designation" value={emp.designation || 'N/A'} />
              </div>
            </div>

            {/* Attendance Summary */}
            <div>
              <SectionTitle icon={CalendarDays} title="Attendance Summary" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Present', value: info.present || 0, color: 'bg-green-50 text-green-700 border-green-200' },
                  { label: 'Absent', value: info.absent || 0, color: 'bg-red-50 text-red-700 border-red-200' },
                  { label: 'Paid Leave', value: info.paidLeaveDays || 0, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: 'Unpaid Leave', value: info.unpaidLeaveDays || 0, color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { label: 'OT Hours', value: info.overtimeHours || 0, color: 'bg-purple-50 text-purple-700 border-purple-200' },
                  { label: 'Working Days', value: info.totalDays || 0, color: 'bg-gray-50 text-gray-700 border-gray-200' },
                  { label: 'Payable Days', value: info.payableDays || payroll.payrollInfo?.payableDays || 0, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: 'Week Offs', value: info.weekOffs || 0, color: 'bg-slate-50 text-slate-700 border-slate-200' },
                ].map(item => (
                  <div key={item.label} className={`p-3 rounded-xl border ${item.color} text-center`}>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-[10px] font-bold uppercase mt-1 opacity-80">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings */}
            <div>
              <SectionTitle icon={IndianRupee} title="Earnings" />
              <div className="bg-[#fdfdfe] border border-[#d6d9df] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f0f3f5]/50 text-xs text-[#8f9192] uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-bold">Component</th>
                      <th className="px-4 py-3 text-right font-bold">Standard</th>
                      <th className="px-4 py-3 text-right font-bold">Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f3f5]">
                    {Object.entries(earnings).map(([key, val]) => (
                      <tr key={key}>
                        <td className="px-4 py-2.5 font-medium text-[#1E293B] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                        <td className="px-4 py-2.5 text-right text-[#8f9192]">{formatINR(val?.standard)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-[#1E293B]">{formatINR(val?.earned)}</td>
                      </tr>
                    ))}
                    {(totals.overtimeAmount || 0) > 0 && (
                      <tr className="bg-purple-50/30">
                        <td className="px-4 py-2.5 font-medium text-purple-700">Overtime</td>
                        <td className="px-4 py-2.5 text-right text-[#8f9192]">—</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-purple-700">{formatINR(totals.overtimeAmount)}</td>
                      </tr>
                    )}
                    <tr className="bg-[#f0f3f5] font-bold">
                      <td className="px-4 py-3 text-[#1E293B]">Total Earnings</td>
                      <td className="px-4 py-3 text-right text-[#8f9192]">{formatINR(totals.grossSalary)}</td>
                      <td className="px-4 py-3 text-right text-[#1E293B]">{formatINR(totals.totalEarnings)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <SectionTitle icon={CreditCard} title="Deductions" />
              <div className="bg-[#fdfdfe] border border-[#d6d9df] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#f0f3f5]">
                    {Object.entries(deductions).map(([key, val]) => (
                      <tr key={key}>
                        <td className="px-4 py-2.5 font-medium text-[#1E293B] capitalize">{key === 'pt' ? 'Professional Tax' : key === 'pf' ? 'Provident Fund' : key === 'esi' ? 'ESI' : key}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-red-600">-{formatINR(val)}</td>
                      </tr>
                    ))}
                    {(totals.leaveDeduction || 0) > 0 && (
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-orange-700">Leave Deduction</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-red-600">-{formatINR(totals.leaveDeduction)}</td>
                      </tr>
                    )}
                    <tr className="bg-red-50/30 font-bold">
                      <td className="px-4 py-3 text-red-700">Total Deductions</td>
                      <td className="px-4 py-3 text-right text-red-700">-{formatINR(totals.totalDeductions + (totals.leaveDeduction || 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Adjustments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <SectionTitle icon={Plus} title="Manual Adjustments" />
                {canEdit && (
                  <button
                    onClick={() => setShowAdjForm(!showAdjForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold rounded-lg hover:bg-[#3B82F6]/20 transition-colors"
                  >
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>

              {/* Add adjustment form */}
              {showAdjForm && (
                <div className="p-4 bg-[#f0f3f5] rounded-xl mb-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={adjType}
                      onChange={(e) => setAdjType(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#d6d9df] rounded-lg text-sm"
                    >
                      {ADJUSTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#d6d9df] rounded-lg text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Reason"
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#d6d9df] rounded-lg text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowAdjForm(false)} className="px-3 py-1.5 text-xs font-semibold text-[#8f9192] hover:text-[#1E293B]">Cancel</button>
                    <button onClick={handleAddAdjustment} disabled={loading} className="px-4 py-1.5 bg-[#3B82F6] text-white text-xs font-bold rounded-lg disabled:opacity-50">
                      {loading ? 'Adding...' : 'Add Adjustment'}
                    </button>
                  </div>
                </div>
              )}

              {/* Adjustment list */}
              {adjustments.length > 0 ? (
                <div className="space-y-2">
                  {adjustments.map((adj, i) => (
                    <div key={adj._id || i} className="flex items-center justify-between p-3 bg-[#f0f3f5] rounded-xl">
                      <div>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2 ${
                          ['Bonus', 'Incentive', 'Reimbursement'].includes(adj.type)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {adj.type}
                        </span>
                        <span className="text-sm text-[#8f9192]">{adj.reason}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${
                          ['Bonus', 'Incentive', 'Reimbursement'].includes(adj.type) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {['Bonus', 'Incentive', 'Reimbursement'].includes(adj.type) ? '+' : '-'}{formatINR(Math.abs(adj.amount))}
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveAdjustment(adj._id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#bdc2c7] italic">No manual adjustments</p>
              )}
            </div>

            {/* Net Salary */}
            <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase opacity-80">Net Salary</p>
                  <p className="text-3xl font-bold mt-1">{formatINR(totals.netPay)}</p>
                </div>
                <IndianRupee size={40} className="opacity-20" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-[#fdfdfe] flex flex-wrap items-center justify-end gap-2 p-6 border-t border-[#d6d9df] rounded-b-2xl">
            {canEmail && (
              <button
                onClick={handleEmailPayslip}
                disabled={actionLoading === 'email'}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 border border-purple-200 text-sm font-semibold rounded-xl hover:bg-purple-100 disabled:opacity-50 transition-all"
              >
                {actionLoading === 'email' ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                Email Payslip
              </button>
            )}
            {canApprove && (
              <button
                onClick={() => handleStatusChange('Approved')}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 text-sm font-semibold rounded-xl hover:bg-green-100 disabled:opacity-50 transition-all"
              >
                {actionLoading === 'Approved' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Approve
              </button>
            )}
            {canMarkPaid && (
              <button
                onClick={() => handleStatusChange('Paid')}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-xl hover:bg-[#2563EB] disabled:opacity-50 transition-all"
              >
                {actionLoading === 'Paid' ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                Mark Paid
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-xl transition-colors">
              Close
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
