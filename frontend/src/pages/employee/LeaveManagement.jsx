import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle,
  FileText, History, PlusCircle, Paperclip, Info
} from 'lucide-react';
import leaveService from '../../services/leaveService';

const StatCard = ({ title, available, total, colorClass, isUnlimited }) => {
  const percentage = isUnlimited ? 100 : (total > 0 ? Math.round((available / total) * 100) : 0);
  
  return (
    <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 flex flex-col justify-between shadow-sm hover:border-[#bdc2c7] transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-[#1E293B] text-sm uppercase tracking-wider">{title}</h3>
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${colorClass}`}>
          {isUnlimited ? '∞' : `${available} Left`}
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-[#1E293B] mb-2">
          {isUnlimited ? available : available} <span className="text-sm font-semibold text-[#8f9192]">/ {isUnlimited ? 'Used' : total}</span>
        </p>
        {!isUnlimited && (
          <div className="w-full bg-[#f0f3f5] rounded-full h-2">
            <div className={`h-2 rounded-full ${colorClass.split(' ')[0].replace('text-', 'bg-').replace('-700', '-500')}`} style={{ width: `${percentage}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  let styles = "bg-[#f0f3f5] text-[#8f9192]";
  if (status === 'Approved') styles = "bg-green-50 text-green-700 border-green-200";
  if (status === 'Pending') styles = "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (status === 'Rejected') styles = "bg-red-50 text-red-700 border-red-200";
  if (status === 'Cancelled') styles = "bg-slate-100 text-slate-600 border-slate-200";

  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${styles}`}>{status}</span>;
};

export default function EmployeeLeaveManagement() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [balances, setBalances] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: '',
    isEmergency: false
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [balData, histData] = await Promise.all([
        leaveService.getMyBalances(),
        leaveService.getMyHistory()
      ]);
      setBalances(balData);
      setHistory(histData);
    } catch (err) {
      setError("Failed to load leave data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await leaveService.applyLeave(formData);
      setSuccess("Leave request submitted successfully.");
      setFormData({ ...formData, startDate: '', endDate: '', reason: '', isHalfDay: false, isEmergency: false });
      fetchDashboardData();
      setActiveTab('History');
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await leaveService.cancelLeave(id);
      setSuccess("Leave request cancelled.");
      fetchDashboardData();
    } catch (err) {
      setError(err.message || "Failed to cancel request.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="max-w-screen-xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">My Leaves</h1>
        <p className="text-[#8f9192] mt-1">Manage your leave balances and requests.</p>
      </div>

      <div className="max-w-screen-xl mx-auto space-y-6">
        
        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2"><AlertCircle size={18} /> {error}</div>
            <button onClick={() => setError(null)}><XCircle size={16} /></button>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2"><CheckCircle2 size={18} /> {success}</div>
            <button onClick={() => setSuccess(null)}><XCircle size={16} /></button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#d6d9df] overflow-x-auto hide-scrollbar">
          {['Overview', 'Apply Leave', 'History'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab ? 'border-[#3B82F6] text-[#1E293B]' : 'border-transparent text-[#8f9192] hover:text-[#1E293B]'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="p-10 text-center">Loading leave data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && balances && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Casual Leave" available={balances.casualLeave?.available || 0} total={balances.casualLeave?.total || 0} colorClass="bg-blue-100 text-blue-700" />
                  <StatCard title="Sick Leave" available={balances.sickLeave?.available || 0} total={balances.sickLeave?.total || 0} colorClass="bg-red-100 text-red-700" />
                  <StatCard title="Earned Leave" available={balances.earnedLeave?.available || 0} total={balances.earnedLeave?.total || 0} colorClass="bg-green-100 text-green-700" />
                  <StatCard title="Comp Off" available={balances.compOff?.available || 0} total={balances.compOff?.total || 0} colorClass="bg-purple-100 text-purple-700" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard title="Unpaid Leave" available={balances.unpaidLeave?.used || 0} total={0} isUnlimited colorClass="bg-slate-100 text-slate-700" />
                  <StatCard title="Work From Home" available={balances.wfh?.used || 0} total={0} isUnlimited colorClass="bg-teal-100 text-teal-700" />
                </div>

                {/* Transaction History Summary */}
                <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden mt-6">
                  <div className="p-5 border-b border-[#d6d9df]">
                    <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2"><History size={20}/> Balance History</h2>
                  </div>
                  <div className="p-5 overflow-x-auto">
                    {balances.transactions && balances.transactions.length > 0 ? (
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                          <tr className="text-[#8f9192]">
                            <th className="pb-3 font-semibold">Date</th>
                            <th className="pb-3 font-semibold">Type</th>
                            <th className="pb-3 font-semibold">Leave Type</th>
                            <th className="pb-3 font-semibold">Amount</th>
                            <th className="pb-3 font-semibold">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d6d9df]">
                          {balances.transactions.map((t, idx) => (
                            <tr key={idx}>
                              <td className="py-3 font-medium text-[#1E293B]">{new Date(t.date).toLocaleDateString()}</td>
                              <td className="py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'Credit' ? 'bg-green-100 text-green-700' : t.type === 'Debit' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{t.type}</span></td>
                              <td className="py-3 font-medium text-[#1E293B]">{t.leaveType}</td>
                              <td className="py-3 font-bold">{t.type === 'Credit' ? '+' : t.type === 'Debit' ? '-' : ''}{t.amount}</td>
                              <td className="py-3 text-xs italic">{t.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-center text-[#8f9192] text-sm">No transactions recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* APPLY LEAVE TAB */}
            {activeTab === 'Apply Leave' && (
              <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm max-w-2xl">
                <div className="p-5 border-b border-[#d6d9df]">
                  <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2"><PlusCircle size={20}/> New Leave Request</h2>
                </div>
                <form onSubmit={handleApplyLeave} className="p-5 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Leave Type <span className="text-red-500">*</span></label>
                    <select required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})}>
                      {['Casual Leave', 'Sick Leave', 'Earned Leave', 'Comp Off', 'Unpaid Leave', 'Work From Home'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Start Date <span className="text-red-500">*</span></label>
                      <input type="date" required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1E293B] mb-1.5">End Date <span className="text-red-500">*</span></label>
                      <input type="date" required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#1E293B] cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        checked={formData.isHalfDay} onChange={e => setFormData({...formData, isHalfDay: e.target.checked})} />
                      Half Day Request
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-red-600 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-red-600 rounded border-red-300"
                        checked={formData.isEmergency} onChange={e => setFormData({...formData, isEmergency: e.target.checked})} />
                      Emergency Leave
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1.5">Reason <span className="text-red-500">*</span></label>
                    <textarea required rows="3" className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Please provide a brief reason for your leave..."
                      value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                  </div>

                  {/* Future attachment support UI stub */}
                  <div className="border border-dashed border-[#bdc2c7] rounded-xl p-4 flex flex-col items-center justify-center text-center bg-[#f0f3f5]/50">
                    <Paperclip size={20} className="text-[#8f9192] mb-2" />
                    <p className="text-sm font-bold text-[#1E293B]">Attach Document (Optional)</p>
                    <p className="text-xs text-[#8f9192] mt-1">Medical certificate required for Sick Leave &gt; 2 days.</p>
                    <button type="button" className="mt-3 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">Browse Files</button>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={isSubmitting} className={`w-full py-3 text-white font-bold rounded-xl shadow-sm transition-colors ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#3B82F6] hover:bg-[#2563EB]'}`}>
                      {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'History' && (
              <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#d6d9df]">
                  <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2"><FileText size={20}/> Leave Requests</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#f0f3f5] text-[#8f9192]">
                        <th className="px-5 py-3 font-semibold">Leave Type</th>
                        <th className="px-5 py-3 font-semibold">Date Range</th>
                        <th className="px-5 py-3 font-semibold">Days</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold">Applied On</th>
                        <th className="px-5 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d6d9df]">
                      {history.length === 0 ? (
                        <tr><td colSpan="6" className="px-5 py-10 text-center text-[#8f9192]">No leave requests found.</td></tr>
                      ) : history.map(req => (
                        <tr key={req._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-[#1E293B]">{req.leaveType}</p>
                            {req.isEmergency && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Emergency</span>}
                            {req.isHalfDay && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase ml-1">Half Day</span>}
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-[#1E293B] font-medium">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                          </td>
                          <td className="px-5 py-4 font-bold text-[#1E293B]">{req.totalDays}</td>
                          <td className="px-5 py-4"><StatusBadge status={req.status} /></td>
                          <td className="px-5 py-4 text-[#8f9192]">{new Date(req.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-4 text-right">
                            {['Pending', 'Approved'].includes(req.status) && new Date(req.startDate) >= new Date() ? (
                              <button onClick={() => handleCancelLeave(req._id)} className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-transparent hover:border-red-200 transition-colors">
                                Cancel
                              </button>
                            ) : (
                              <span className="text-[#bdc2c7] text-xs">--</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
