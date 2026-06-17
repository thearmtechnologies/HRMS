import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";
import { 
  Edit, Calendar, Clock, MapPin, Mail, Phone, 
  CheckCircle, AlertCircle, Briefcase, ChevronDown, 
  CalendarPlus, X, Send, CreditCard, FileText, CheckCircle2, AlertTriangle
} from 'lucide-react';

const STATS = {
  totalDaysWorked: 142,
  leavesTaken: 8,
  lateAttendance: 3,
  absent: 1,
  leaveBalance: 12
};

export default function EmployeeProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.employeeId) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/employee?employeeId=${user.employeeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const emp = Array.isArray(data) ? data.find(e => e.employeeId === user.employeeId) : data;
      setEmployeeData(emp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    console.log('Leave applied:', leaveForm);
    setIsLeaveModalOpen(false);
    setLeaveForm({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f0f3f5]">Loading...</div>;
  }

  if (!employeeData) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f0f3f5]">Employee data not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192]">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Welcome & Action Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#fdfdfe] p-6 rounded-2xl border border-[#d6d9df] shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Hello, {employeeData.firstName}! 👋</h1>
            <p className="text-[#8f9192] mt-1">Ready for a great day at work? Don't forget to check in.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-[#f0f3f5] p-2 rounded-xl border border-[#d6d9df]">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-0.5">Current Time</p>
              <p className="text-lg font-bold text-[#1E293B] leading-none">{formatTime(currentTime)}</p>
            </div>
            <button 
              onClick={() => setIsCheckedIn(!isCheckedIn)}
              className={`px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center gap-2
                ${isCheckedIn 
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' 
                  : 'bg-[#3B82F6] hover:bg-opacity-90 shadow-[#3B82F6]/20'}`}
            >
              <Clock size={18} />
              {isCheckedIn ? 'Check Out' : 'Check In Now'}
            </button>
          </div>
        </div>

        {!employeeData.profileCompleted && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-600" />
              <div>
                <p className="font-bold">Your profile is incomplete ({employeeData.profileCompletion}%).</p>
                <p className="text-sm">Please complete your profile to access all features.</p>
              </div>
            </div>
            <button onClick={() => navigate('/complete-profile')} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold rounded-lg transition-colors">
              Complete Profile
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Profile View */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
              <div className="h-24 bg-[#3B82F6] relative"></div>
              
              <div className="px-6 pb-6 relative">
                {/* Profile Photo */}
                <div className="absolute -top-12 left-6 w-24 h-24 bg-[#f0f3f5] rounded-full border-4 border-[#fdfdfe] flex items-center justify-center text-3xl font-bold text-[#1E293B] shadow-sm overflow-hidden">
                  {employeeData.url ? (
                    <img src={employeeData.url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    employeeData.firstName?.substring(0, 2).toUpperCase() || 'EM'
                  )}
                </div>
                
                <div className="flex justify-end mt-4 mb-2">
                  <button 
                    onClick={() => navigate('/complete-profile')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1E293B] bg-[#f0f3f5] hover:bg-[#e2e6ea] px-3 py-1.5 rounded-lg transition-colors border border-[#d6d9df]"
                  >
                    <Edit size={14} /> Edit Profile
                  </button>
                </div>

                <div className="mt-2">
                  <h2 className="text-xl font-bold text-[#1E293B]">{employeeData.fullName || `${employeeData.firstName} ${employeeData.lastName}`}</h2>
                  <p className="text-[#8f9192] font-medium">{employeeData.designation}</p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Briefcase size={18} className="text-[#bdc2c7] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8f9192] uppercase">Department & ID</p>
                      <p className="text-sm font-bold text-[#1E293B]">
                        {employeeData.department?.departmentName || 'Department'} • {employeeData.employeeId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-[#bdc2c7] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8f9192] uppercase">Work Email</p>
                      <p className="text-sm font-bold text-[#1E293B]">{employeeData.email}</p>
                    </div>
                  </div>
                  {employeeData.mobile && (
                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-[#bdc2c7] mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#8f9192] uppercase">Phone Number</p>
                        <p className="text-sm font-bold text-[#1E293B]">{employeeData.mobile}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#bdc2c7] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8f9192] uppercase">Work Location</p>
                      <p className="text-sm font-bold text-[#1E293B]">{employeeData.workLocation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="flex items-center justify-between bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm">
              <div>
                <h3 className="font-bold text-[#1E293B]">Need time off?</h3>
                <p className="text-xs text-[#8f9192] mt-0.5">You have {STATS.leaveBalance} days of annual leave remaining.</p>
              </div>
              <button 
                onClick={() => setIsLeaveModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#f0f3f5] text-[#1E293B] border border-[#d6d9df] rounded-lg font-bold hover:bg-[#3B82F6] hover:text-[#fdfdfe] transition-all shadow-sm"
              >
                <CalendarPlus size={18} />
                Apply for Leave
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#bdc2c7] transition-colors">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3"><CheckCircle size={24} /></div>
                <p className="text-2xl font-bold text-[#1E293B]">{STATS.totalDaysWorked}</p>
                <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">Days Worked</p>
              </div>
              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#bdc2c7] transition-colors">
                <div className="p-3 bg-green-50 text-green-600 rounded-full mb-3"><Calendar size={24} /></div>
                <p className="text-2xl font-bold text-[#1E293B]">{STATS.leavesTaken}</p>
                <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">Leaves Taken</p>
              </div>
              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#bdc2c7] transition-colors">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full mb-3"><Clock size={24} /></div>
                <p className="text-2xl font-bold text-[#1E293B]">{STATS.lateAttendance}</p>
                <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">Late Arrivals</p>
              </div>
              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#bdc2c7] transition-colors">
                <div className="p-3 bg-red-50 text-red-600 rounded-full mb-3"><AlertCircle size={24} /></div>
                <p className="text-2xl font-bold text-[#1E293B]">{STATS.absent}</p>
                <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">Absences</p>
              </div>
            </div>

            {/* Bank & Documents Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm relative overflow-hidden">
                <h3 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2"><CreditCard size={18}/> Bank Details</h3>
                {employeeData.pendingBankDetails?.status === 'pending' && (
                  <div className="mb-4 bg-yellow-50 text-yellow-700 text-xs p-2 rounded border border-yellow-200 flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p>You have a pending update request waiting for HR approval.</p>
                  </div>
                )}
                {employeeData.bankName ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#8f9192]">Bank Name</span><span className="font-bold text-[#1E293B]">{employeeData.bankName}</span></div>
                    <div className="flex justify-between"><span className="text-[#8f9192]">Account No</span><span className="font-bold text-[#1E293B]">{employeeData.accountNo}</span></div>
                    <div className="flex justify-between"><span className="text-[#8f9192]">IFSC Code</span><span className="font-bold text-[#1E293B] uppercase">{employeeData.ifscCode}</span></div>
                  </div>
                ) : (
                  <p className="text-sm text-[#8f9192]">No bank details provided.</p>
                )}
              </div>

              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm">
                <h3 className="font-bold text-[#1E293B] mb-4 flex items-center gap-2"><FileText size={18}/> Documents</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center bg-[#f0f3f5] p-2 rounded">
                    <span className="font-semibold text-[#1E293B]">PAN</span>
                    {employeeData.documents?.pan?.verified ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle2 size={14}/> Verified</span>
                    ) : employeeData.documents?.pan?.number ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-yellow-600"><AlertCircle size={14}/> Pending Verification</span>
                    ) : (
                      <span className="text-xs text-[#8f9192]">Not Provided</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center bg-[#f0f3f5] p-2 rounded">
                    <span className="font-semibold text-[#1E293B]">Aadhaar</span>
                    {employeeData.documents?.aadhaar?.verified ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle2 size={14}/> Verified</span>
                    ) : employeeData.documents?.aadhaar?.number ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-yellow-600"><AlertCircle size={14}/> Pending Verification</span>
                    ) : (
                      <span className="text-xs text-[#8f9192]">Not Provided</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* --- APPLY LEAVE MODAL --- */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B82F6]/40 backdrop-blur-sm">
          <div className="bg-[#fdfdfe] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#d6d9df] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1E293B]">Apply for Leave</h2>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-[#8f9192] hover:text-red-500 transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleApplyLeave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Leave Type *</label>
                <div className="relative">
                  <select 
                    required
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
                    className="w-full appearance-none px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all cursor-pointer"
                  >
                    <option>Annual Leave</option>
                    <option>Sick Leave</option>
                    <option>Casual Leave</option>
                    <option>Unpaid Leave</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Start Date *</label>
                  <input type="date" required value={leaveForm.startDate} onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">End Date *</label>
                  <input type="date" required value={leaveForm.endDate} onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Reason *</label>
                <textarea required rows="3" value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all resize-none placeholder:text-[#bdc2c7]" placeholder="Briefly explain your reason for leave..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-[#8f9192] border border-[#d6d9df] rounded-lg hover:bg-[#f0f3f5] transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 flex items-center gap-2 text-sm font-bold text-[#fdfdfe] bg-[#3B82F6] rounded-lg hover:bg-opacity-90 shadow-sm transition-all"><Send size={16}/> Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}