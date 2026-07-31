import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle,
  FileText, History, PlusCircle, Paperclip, Info
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import leaveTypeService from '../../services/leaveTypeService';
import StatCard from '../../components/common/StatCard';

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
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: '',
    isEmergency: false
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [balData, histData, typesData] = await Promise.all([
        leaveService.getMyBalances(),
        leaveService.getMyHistory(),
        leaveTypeService.getLeaveTypes()
      ]);
      setBalances(balData);
      setHistory(histData);
      setLeaveTypes(typesData || []);
      const assigned = (typesData || []).filter(t => balData?.normalizedBalances?.[t.name]);
      if (assigned.length > 0 && !assigned.some(t => t.name === formData.leaveType)) {
        setFormData(prev => ({ ...prev, leaveType: assigned[0].name }));
      }
    } catch (err) {
      setError("Failed to load leave data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const assignedLeaveTypes = leaveTypes.filter(lt => balances?.normalizedBalances?.[lt.name]);
  const selectedType = leaveTypes.find(t => t.name === formData.leaveType);

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
        <p className="text-[#8f9192] mt-1">Manage your leave balances and requests driven by organizational leave policies.</p>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
                  {assignedLeaveTypes.length === 0 ? (
                    <p className="text-[#8f9192] col-span-full py-4 text-center">No assigned leaves found.</p>
                  ) : assignedLeaveTypes.map((lt, idx) => {
                    const bal = balances.normalizedBalances[lt.name];
                    const icons = [CalendarIcon, AlertCircle, CheckCircle2, Clock, FileText, Info];
                    const colorClasses = [
                      "bg-blue-50 text-blue-600",
                      "bg-red-50 text-red-600",
                      "bg-green-50 text-green-600",
                      "bg-purple-50 text-purple-600",
                      "bg-amber-50 text-amber-600",
                      "bg-teal-50 text-teal-600"
                    ];
                    const Icon = icons[idx % icons.length];
                    const colorClass = colorClasses[idx % colorClasses.length];
                    
                    const val = lt.category === 'Unpaid' 
                      ? `${bal.used || 0} Used` 
                      : `${bal.available !== undefined ? bal.available : lt.allocation} / ${bal.total !== undefined ? bal.total : lt.allocation}`;

                    return (
                      <StatCard key={lt._id || lt.name} title={lt.name} value={val} icon={Icon} colorClass={colorClass} />
                    );
                  })}
                </div>

                {/* Transaction History Summary */}
                <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden mt-6">
                  <div className="p-5 border-b border-[#d6d9df]">
                    <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2"><History size={20}/> Balance History & Audit Trail</h2>
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
                            <tr key={idx} className="hover:bg-[#f0f3f5]/30 transition-colors">
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
                    <label htmlFor="empLeaveType" className="block text-sm font-bold text-[#1E293B] mb-1.5">Leave Type <span className="text-red-500">*</span></label>
                    <select id="empLeaveType" name="empLeaveType" required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-[#1E293B]"
                      value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})}>
                      {assignedLeaveTypes.map(type => {
                        const avail = balances.normalizedBalances[type.name].available;
                        return (
                          <option key={type._id || type.name} value={type.name}>
                            {type.name} ({type.category}) {type.category === 'Paid' ? `— ${avail} day(s) available` : ''}
                          </option>
                        );
                      })}
                    </select>

                    {/* Dynamic Policy Rule Box */}
                    {selectedType && (
                      <div className="bg-[#f0f3f5]/80 rounded-xl p-4 border border-[#d6d9df] space-y-2.5 mt-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1E293B] text-sm flex items-center gap-2">
                            {selectedType.name}
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${selectedType.category === 'Paid' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                              {selectedType.category}
                            </span>
                          </span>
                          <span className="text-[#8f9192]">Accrual: <strong className="text-[#1E293B]">{selectedType.accrualType || 'Yearly'}</strong></span>
                        </div>
                        <p className="text-[#64748b] font-normal">{selectedType.description || 'No specific description provided for this leave policy.'}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#d6d9df]/70">
                          <div>Allocation: <strong className="text-[#1E293B] block mt-0.5">{selectedType.allocation || 0} days/yr</strong></div>
                          <div>Max Consecutive: <strong className="text-[#1E293B] block mt-0.5">{selectedType.maxConsecutiveDays ? `${selectedType.maxConsecutiveDays} days` : 'No limit'}</strong></div>
                          <div>Notice Period: <strong className="text-[#1E293B] block mt-0.5">{selectedType.minimumNoticePeriod ? `${selectedType.minimumNoticePeriod} days` : 'None'}</strong></div>
                          <div>Half Day: <strong className={`block mt-0.5 font-bold ${selectedType.allowHalfDay ? 'text-emerald-700' : 'text-rose-600'}`}>{selectedType.allowHalfDay ? 'Allowed' : 'Not Allowed'}</strong></div>
                          <div>Carry Forward: <strong className="text-[#1E293B] block mt-0.5">{selectedType.carryForward ? `Yes (Max ${selectedType.maxCarryForwardDays || 0})` : 'No'}</strong></div>
                          <div>Supporting Doc: <strong className="text-[#1E293B] block mt-0.5">{selectedType.requireSupportingDocument ? 'Required' : 'Optional'}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="empLeaveStartDate" className="block text-sm font-bold text-[#1E293B] mb-1.5">Start Date <span className="text-red-500">*</span></label>
                      <input id="empLeaveStartDate" name="empLeaveStartDate" type="date" required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none text-[#1E293B] font-medium"
                        value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="empLeaveEndDate" className="block text-sm font-bold text-[#1E293B] mb-1.5">End Date <span className="text-red-500">*</span></label>
                      <input id="empLeaveEndDate" name="empLeaveEndDate" type="date" required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none text-[#1E293B] font-medium"
                        value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-1">
                    <label htmlFor="empLeaveHalfDay" className={`flex items-center gap-2 text-sm font-bold ${selectedType?.allowHalfDay === false ? 'text-[#bdc2c7] cursor-not-allowed' : 'text-[#1E293B] cursor-pointer'}`}>
                      <input id="empLeaveHalfDay" name="empLeaveHalfDay" type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-40"
                        disabled={selectedType?.allowHalfDay === false}
                        checked={formData.isHalfDay && selectedType?.allowHalfDay !== false} 
                        onChange={e => setFormData({...formData, isHalfDay: e.target.checked})} />
                      <span>Half Day Request {selectedType?.allowHalfDay === false && <span className="text-xs font-normal text-rose-500 ml-1">(Disabled by policy)</span>}</span>
                    </label>
                    <label htmlFor="empLeaveEmergency" className="flex items-center gap-2 text-sm font-bold text-red-600 cursor-pointer">
                      <input id="empLeaveEmergency" name="empLeaveEmergency" type="checkbox" className="w-4 h-4 text-red-600 rounded border-red-300"
                        checked={formData.isEmergency} onChange={e => setFormData({...formData, isEmergency: e.target.checked})} />
                      Emergency Leave (Bypass Notice)
                    </label>
                  </div>

                  <div>
                    <label htmlFor="empLeaveReason" className="block text-sm font-bold text-[#1E293B] mb-1.5">Reason <span className="text-red-500">*</span></label>
                    <textarea id="empLeaveReason" name="empLeaveReason" required rows="3" className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none text-[#1E293B]"
                      placeholder="Please provide a brief explanation for your leave..."
                      value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                  </div>

                  <div className="border border-dashed border-[#bdc2c7] rounded-xl p-4 flex flex-col items-center justify-center text-center bg-[#f0f3f5]/50">
                    <Paperclip size={20} className="text-[#8f9192] mb-2" />
                    <p className="text-sm font-bold text-[#1E293B]">Attach Supporting Document {selectedType?.requireSupportingDocument ? <span className="text-red-500">* (Required)</span> : '(Optional)'}</p>
                    <p className="text-xs text-[#8f9192] mt-1">Upload medical certificates, proof, or approval documents if required by policy.</p>
                    <button type="button" className="mt-3 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-lg border border-blue-200 transition-colors">Browse Files</button>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={isSubmitting || assignedLeaveTypes.length === 0} className={`w-full py-3 text-white font-bold rounded-xl shadow-sm transition-all ${isSubmitting || assignedLeaveTypes.length === 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-blue-500/10'}`}>
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
                  <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2"><FileText size={20}/> Leave Requests & History</h2>
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
                      ) : history.map(req => {
                        const config = leaveTypes.find(t => t.name === req.leaveType);
                        return (
                          <tr key={req._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1E293B]">{req.leaveType}</span>
                                {config && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${config.category === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                    {config.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1 mt-1">
                                {req.isEmergency && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Emergency</span>}
                                {req.isHalfDay && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">Half Day</span>}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-[#1E293B] font-medium">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                            </td>
                            <td className="px-5 py-4 font-bold text-[#1E293B]">{req.totalDays}</td>
                            <td className="px-5 py-4"><StatusBadge status={req.status} /></td>
                            <td className="px-5 py-4 text-[#8f9192]">{new Date(req.createdAt).toLocaleDateString()}</td>
                            <td className="px-5 py-4 text-right">
                              {['Pending', 'Approved'].includes(req.status) && new Date(req.startDate) >= new Date() ? (
                                <button onClick={() => handleCancelLeave(req._id)} className="text-xs font-bold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-200 transition-colors">
                                  Cancel
                                </button>
                              ) : (
                                <span className="text-[#bdc2c7] text-xs">--</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
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
