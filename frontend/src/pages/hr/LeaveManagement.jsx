import { useState, useEffect } from 'react';
import { 
  Search, CheckCircle2, XCircle, AlertCircle, FileText, PlusCircle, 
  Settings2, Filter, Info, UserCheck, Clock, UserX
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import employeeService from '../../services/employeeService';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] p-5 shadow-sm hover:border-[#bdc2c7] transition-all flex items-center justify-between">
    <div>
      <p className="text-3xl font-bold text-[#1E293B]">{value}</p>
      <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mt-1">{title}</p>
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  let styles = "bg-[#f0f3f5] text-[#8f9192]";
  if (status === 'Approved') styles = "bg-green-50 text-green-700 border-green-200";
  if (status === 'Pending') styles = "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (status === 'Rejected') styles = "bg-red-50 text-red-700 border-red-200";
  if (status === 'Cancelled') styles = "bg-slate-100 text-slate-600 border-slate-200";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${styles}`}>{status}</span>;
};

export default function HRLeaveManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ totalRequests: 0, pending: 0, approved: 0, rejected: 0, onLeaveToday: 0 });
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({ id: null, status: '', remarks: '', reason: '' });

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState({
    employeeId: '', leaveType: 'Casual Leave', startDate: '', endDate: '', isHalfDay: false, reason: '', source: 'Phone Call'
  });

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceData, setBalanceData] = useState({ employeeId: '', leaveType: 'Casual Leave', amount: '', action: 'Add', reason: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqs, dashboardStats, emps] = await Promise.all([
        leaveService.getAllLeaveRequests(),
        leaveService.getDashboardStats(),
        employeeService.getAllEmployees().catch(()=>[])
      ]);
      setRequests(reqs);
      setStats(dashboardStats);
      setEmployees(emps);
    } catch (err) {
      setError("Failed to load leave data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredRequests = requests.filter(req => {
    if (activeTab !== 'All' && req.status !== activeTab) return false;
    return true;
  });

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await leaveService.updateLeaveStatus(approvalData.id, approvalData.status, approvalData.remarks, approvalData.reason);
      setSuccess(`Request ${approvalData.status} successfully.`);
      setShowApprovalModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await leaveService.manualLeaveEntry(manualData);
      setSuccess("Manual leave entry created successfully.");
      setShowManualEntry(false);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to create manual entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBalanceAdjust = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await leaveService.adjustBalance(balanceData);
      setSuccess("Leave balance adjusted successfully.");
      setShowBalanceModal(false);
    } catch (err) {
      setError(err.message || "Failed to adjust balance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Company Leaves</h1>
          <p className="text-[#8f9192] mt-1">Manage approvals, manual entries, and view organizational leave trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowBalanceModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#1E293B] text-sm font-bold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all">
            <Settings2 size={16} /> Adjust Balances
          </button>
          <button onClick={() => setShowManualEntry(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-[#2563EB] transition-all">
            <PlusCircle size={16} /> Manual Entry
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto space-y-6">
        
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

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard title="Total Requests" value={stats.totalRequests} icon={FileText} colorClass="bg-slate-100 text-slate-700" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} colorClass="bg-yellow-100 text-yellow-700" />
          <StatCard title="Approved" value={stats.approved} icon={CheckCircle2} colorClass="bg-green-100 text-green-700" />
          <StatCard title="Rejected" value={stats.rejected} icon={XCircle} colorClass="bg-red-100 text-red-700" />
          <StatCard title="On Leave Today" value={stats.onLeaveToday} icon={UserX} colorClass="bg-purple-100 text-purple-700" />
        </div>

        {/* Main Table Container */}
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden">
          
          <div className="px-5 border-b border-[#d6d9df] flex gap-6 overflow-x-auto hide-scrollbar">
            {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'border-[#3B82F6] text-[#1E293B]' : 'border-transparent text-[#8f9192] hover:text-[#1E293B]'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f3f5] text-[#8f9192]">
                  <th className="px-5 py-3 font-semibold">Employee</th>
                  <th className="px-5 py-3 font-semibold">Leave Details</th>
                  <th className="px-5 py-3 font-semibold">Duration</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6d9df]">
                {isLoading ? (
                  <tr><td colSpan="5" className="px-5 py-10 text-center text-[#8f9192]">Loading records...</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan="5" className="px-5 py-10 text-center text-[#8f9192]">No leave requests found.</td></tr>
                ) : filteredRequests.map(req => (
                  <tr key={req._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#1E293B]">{req.employee?.firstName} {req.employee?.lastName}</p>
                      <p className="text-xs text-[#8f9192]">{req.employee?.department?.departmentName || 'N/A'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#1E293B]">{req.leaveType}</p>
                      <p className="text-xs text-[#8f9192] max-w-[200px] truncate" title={req.reason}>"{req.reason}"</p>
                      {req.isEmergency && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">Emergency</span>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#1E293B]">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                      <p className="text-xs text-[#8f9192]">{req.totalDays} Days {req.isHalfDay && '(Half Day)'}</p>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-5 py-4 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setApprovalData({ id: req._id, status: 'Approved', remarks: '', reason: '' }); setShowApprovalModal(true); }}
                            className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => { setApprovalData({ id: req._id, status: 'Rejected', remarks: '', reason: '' }); setShowApprovalModal(true); }}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#bdc2c7]">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Approval/Rejection Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfdfe] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className={`p-4 border-b border-[#d6d9df] flex justify-between items-center ${approvalData.status === 'Approved' ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-bold ${approvalData.status === 'Approved' ? 'text-green-800' : 'text-red-800'}`}>Confirm {approvalData.status}</h3>
              <button onClick={() => setShowApprovalModal(false)} className="text-[#8f9192] hover:text-[#1E293B]"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4">
              {approvalData.status === 'Rejected' && (
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                  <input required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={approvalData.reason} onChange={e => setApprovalData({...approvalData, reason: e.target.value})} />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-[#1E293B] mb-1">HR Remarks (Optional)</label>
                <textarea rows="3" className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-[#f0f3f5] resize-none"
                  value={approvalData.remarks} onChange={e => setApprovalData({...approvalData, remarks: e.target.value})} />
              </div>
              <button type="submit" disabled={isSubmitting} className={`w-full py-2.5 text-white font-bold rounded-xl shadow-sm transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} ${approvalData.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {isSubmitting ? 'Processing...' : `Submit ${approvalData.status}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfdfe] rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#d6d9df] flex justify-between items-center bg-blue-50">
              <h3 className="font-bold text-blue-800">Manual Leave Entry</h3>
              <button onClick={() => setShowManualEntry(false)} className="text-[#8f9192] hover:text-[#1E293B]"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleManualEntry} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-[#1E293B] mb-1">Select Employee <span className="text-red-500">*</span></label>
                <select required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                  value={manualData.employeeId} onChange={e => setManualData({...manualData, employeeId: e.target.value})}>
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">Leave Type</label>
                  <select className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                    value={manualData.leaveType} onChange={e => setManualData({...manualData, leaveType: e.target.value})}>
                    {['Casual Leave', 'Sick Leave', 'Earned Leave', 'Comp Off', 'Unpaid Leave', 'Work From Home'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">Source</label>
                  <select className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                    value={manualData.source} onChange={e => setManualData({...manualData, source: e.target.value})}>
                    {['Phone Call', 'WhatsApp', 'Email', 'Manager Approval', 'HR Entry'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">Start Date</label>
                  <input type="date" required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                    value={manualData.startDate} onChange={e => setManualData({...manualData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">End Date</label>
                  <input type="date" required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                    value={manualData.endDate} onChange={e => setManualData({...manualData, endDate: e.target.value})} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-[#1E293B] cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  checked={manualData.isHalfDay} onChange={e => setManualData({...manualData, isHalfDay: e.target.checked})} />
                Half Day Request
              </label>
              <div>
                <label className="block text-sm font-bold text-[#1E293B] mb-1">Reason <span className="text-red-500">*</span></label>
                <textarea required rows="2" className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm bg-white resize-none" 
                  value={manualData.reason} onChange={e => setManualData({...manualData, reason: e.target.value})} />
              </div>
              <button type="submit" disabled={isSubmitting} className={`w-full py-2.5 text-white font-bold rounded-xl shadow-sm transition-colors ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#3B82F6] hover:bg-[#2563EB]'}`}>
                {isSubmitting ? 'Creating...' : 'Create Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfdfe] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#d6d9df] flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Adjust Leave Balance</h3>
              <button onClick={() => setShowBalanceModal(false)} className="text-[#8f9192] hover:text-[#1E293B]"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleBalanceAdjust} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-[#1E293B] mb-1">Select Employee <span className="text-red-500">*</span></label>
                <select required className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                  value={balanceData.employeeId} onChange={e => setBalanceData({...balanceData, employeeId: e.target.value})}>
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">Action</label>
                  <select className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                    value={balanceData.action} onChange={e => setBalanceData({...balanceData, action: e.target.value})}>
                    <option value="Add">Credit (Add)</option>
                    <option value="Deduct">Debit (Deduct)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">Leave Type</label>
                  <select className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                    value={balanceData.leaveType} onChange={e => setBalanceData({...balanceData, leaveType: e.target.value})}>
                    {['Casual Leave', 'Sick Leave', 'Earned Leave', 'Comp Off'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1E293B] mb-1">Amount (Days) <span className="text-red-500">*</span></label>
                <input type="number" step="0.5" required min="0.5" className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                  value={balanceData.amount} onChange={e => setBalanceData({...balanceData, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1E293B] mb-1">Reason for Adjustment <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="This will be recorded in the audit log." className="w-full border border-[#d6d9df] rounded-xl p-2.5 text-sm bg-white" 
                  value={balanceData.reason} onChange={e => setBalanceData({...balanceData, reason: e.target.value})} />
              </div>
              <button type="submit" disabled={isSubmitting} className={`w-full py-2.5 text-white font-bold rounded-xl shadow-sm transition-colors ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1E293B] hover:bg-slate-800'}`}>
                {isSubmitting ? 'Applying...' : 'Apply Adjustment'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
