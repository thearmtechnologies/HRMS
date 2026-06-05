import React, { useState, useEffect } from 'react';
import { 
  Bell, Edit, Calendar, Clock, MapPin, Mail, Phone, Building2, 
  CheckCircle, AlertCircle, Briefcase, ChevronDown, 
  CalendarPlus, LogOut, X, Camera, Send
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_EMPLOYEE = {
  name: 'Marcus Doe',
  initials: 'MD',
  role: 'Frontend Developer',
  department: 'Engineering',
  employeeId: 'NEX-1043',
  email: 'marcus.d@ARM.com',
  phone: '+1 (555) 0102',
  location: 'New York Office',
  joinDate: 'June 01, 2021',
  photoUrl: null // Using initials if null
};

const STATS = {
  totalDaysWorked: 142,
  leavesTaken: 8,
  lateAttendance: 3,
  absent: 1,
  leaveBalance: 12
};

const NOTIFICATIONS = [
  { id: 1, text: 'Your Annual Leave request for Nov 12 has been approved.', time: '2h ago', type: 'success', isRead: false },
  { id: 2, text: 'You have been assigned to Project Alpha by Sarah Jenkins.', time: '5h ago', type: 'info', isRead: false },
  { id: 3, text: 'Project Beta priority has been set to HIGH.', time: '1d ago', type: 'warning', isRead: true },
];

export default function EmployeeProfile() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  // Forms state
  const [leaveForm, setLeaveForm] = useState({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });
  const [profileForm, setProfileForm] = useState({ phone: MOCK_EMPLOYEE.phone, location: MOCK_EMPLOYEE.location });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    // Logic to submit leave
    console.log('Leave applied:', leaveForm);
    setIsLeaveModalOpen(false);
    setLeaveForm({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });
  };

  const handleEditProfile = (e) => {
    e.preventDefault();
    // Logic to update profile
    console.log('Profile updated:', profileForm);
    setIsEditProfileOpen(false);
  };

  const unreadCount = NOTIFICATIONS.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192]">
      
      {/* 1. Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#fdfdfe] border-b border-[#d6d9df] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#3d766d] rounded-lg">
            <Building2 size={20} className="text-[#fdfdfe]" />
          </div>
          <span className="font-bold text-lg text-[#3d766d] hidden sm:block">ARM HRMS</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-[#3d766d]">{formatTime(currentTime)}</p>
            <p className="text-[10px] text-[#bdc2c7]">{formatDate(currentTime)}</p>
          </div>
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#8f9192] hover:text-[#3d766d] hover:bg-[#f0f3f5] rounded-full transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#fdfdfe]"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute right-0 top-12 w-80 bg-[#fdfdfe] rounded-xl shadow-xl border border-[#d6d9df] z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-[#d6d9df] flex items-center justify-between bg-[#f0f3f5]/50">
                    <h3 className="font-bold text-[#3d766d]">Notifications</h3>
                    <span className="text-xs font-semibold text-[#8f9192] bg-[#d6d9df] px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {NOTIFICATIONS.map(note => (
                      <div key={note.id} className={`p-4 border-b border-[#f0f3f5] hover:bg-[#f0f3f5]/50 transition-colors ${!note.isRead ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex gap-3 items-start">
                          <div className={`mt-0.5 p-1.5 rounded-full 
                            ${note.type === 'success' ? 'bg-green-100 text-green-600' : 
                              note.type === 'warning' ? 'bg-orange-100 text-orange-600' : 
                              'bg-blue-100 text-blue-600'}`}>
                            {note.type === 'success' ? <CheckCircle size={14} /> : note.type === 'warning' ? <AlertCircle size={14} /> : <Briefcase size={14} />}
                          </div>
                          <div>
                            <p className="text-sm text-[#3d766d] leading-snug">{note.text}</p>
                            <p className="text-xs text-[#bdc2c7] mt-1">{note.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full p-3 text-center text-sm font-semibold text-[#3d766d] hover:bg-[#f0f3f5] transition-colors">
                    Mark all as read
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="h-6 w-px bg-[#d6d9df]"></div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#3d766d] text-[#fdfdfe] flex items-center justify-center font-bold text-xs">
              {MOCK_EMPLOYEE.initials}
            </div>
            <span className="font-bold text-[#3d766d] text-sm hidden sm:block">{MOCK_EMPLOYEE.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Welcome & Action Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#fdfdfe] p-6 rounded-2xl border border-[#d6d9df] shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#3d766d]">Hello, {MOCK_EMPLOYEE.name}! 👋</h1>
            <p className="text-[#8f9192] mt-1">Ready for a great day at work? Don't forget to check in.</p>
          </div>
          
          {/* Check-In / Check-Out Action */}
          <div className="flex items-center gap-4 bg-[#f0f3f5] p-2 rounded-xl border border-[#d6d9df]">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-0.5">Current Time</p>
              <p className="text-lg font-bold text-[#3d766d] leading-none">{formatTime(currentTime)}</p>
            </div>
            <button 
              onClick={() => setIsCheckedIn(!isCheckedIn)}
              className={`px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center gap-2
                ${isCheckedIn 
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' 
                  : 'bg-[#3d766d] hover:bg-opacity-90 shadow-[#3d766d]/20'}`}
            >
              <Clock size={18} />
              {isCheckedIn ? 'Check Out' : 'Check In Now'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Profile View */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
              <div className="h-24 bg-[#3d766d] relative"></div>
              
              <div className="px-6 pb-6 relative">
                {/* Profile Photo */}
                <div className="absolute -top-12 left-6 w-24 h-24 bg-[#f0f3f5] rounded-full border-4 border-[#fdfdfe] flex items-center justify-center text-3xl font-bold text-[#3d766d] shadow-sm overflow-hidden">
                  {MOCK_EMPLOYEE.photoUrl ? (
                    <img src={MOCK_EMPLOYEE.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    MOCK_EMPLOYEE.initials
                  )}
                </div>
                
                <div className="flex justify-end mt-4 mb-2">
                  <button 
                    onClick={() => setIsEditProfileOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#3d766d] bg-[#f0f3f5] hover:bg-[#e2e6ea] px-3 py-1.5 rounded-lg transition-colors border border-[#d6d9df]"
                  >
                    <Edit size={14} /> Edit Profile
                  </button>
                </div>

                <div className="mt-2">
                  <h2 className="text-xl font-bold text-[#3d766d]">{MOCK_EMPLOYEE.name}</h2>
                  <p className="text-[#8f9192] font-medium">{MOCK_EMPLOYEE.role}</p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Briefcase size={18} className="text-[#bdc2c7] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8f9192] uppercase">Department & ID</p>
                      <p className="text-sm font-bold text-[#3d766d]">{MOCK_EMPLOYEE.department} • {MOCK_EMPLOYEE.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-[#bdc2c7] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8f9192] uppercase">Work Email</p>
                      <p className="text-sm font-bold text-[#3d766d]">{MOCK_EMPLOYEE.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-[#bdc2c7] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8f9192] uppercase">Phone Number</p>
                      <p className="text-sm font-bold text-[#3d766d]">{MOCK_EMPLOYEE.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#bdc2c7] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#8f9192] uppercase">Location</p>
                      <p className="text-sm font-bold text-[#3d766d]">{MOCK_EMPLOYEE.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions Row */}
            <div className="flex items-center justify-between bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm">
              <div>
                <h3 className="font-bold text-[#3d766d]">Need time off?</h3>
                <p className="text-xs text-[#8f9192] mt-0.5">You have {STATS.leaveBalance} days of annual leave remaining.</p>
              </div>
              <button 
                onClick={() => setIsLeaveModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#f0f3f5] text-[#3d766d] border border-[#d6d9df] rounded-lg font-bold hover:bg-[#3d766d] hover:text-[#fdfdfe] transition-all shadow-sm"
              >
                <CalendarPlus size={18} />
                Apply for Leave
              </button>
            </div>

            {/* Attendance Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#bdc2c7] transition-colors">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3"><CheckCircle size={24} /></div>
                <p className="text-2xl font-bold text-[#3d766d]">{STATS.totalDaysWorked}</p>
                <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">Days Worked</p>
              </div>
              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#bdc2c7] transition-colors">
                <div className="p-3 bg-green-50 text-green-600 rounded-full mb-3"><Calendar size={24} /></div>
                <p className="text-2xl font-bold text-[#3d766d]">{STATS.leavesTaken}</p>
                <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">Leaves Taken</p>
              </div>
              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#bdc2c7] transition-colors">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full mb-3"><Clock size={24} /></div>
                <p className="text-2xl font-bold text-[#3d766d]">{STATS.lateAttendance}</p>
                <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">Late Arrivals</p>
              </div>
              <div className="bg-[#fdfdfe] p-5 rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col items-center justify-center text-center hover:border-[#bdc2c7] transition-colors">
                <div className="p-3 bg-red-50 text-red-600 rounded-full mb-3"><AlertCircle size={24} /></div>
                <p className="text-2xl font-bold text-[#3d766d]">{STATS.absent}</p>
                <p className="text-xs font-semibold text-[#8f9192] uppercase mt-1">Absences</p>
              </div>
            </div>

            {/* Recent Leave History */}
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#d6d9df] flex items-center justify-between">
                <h3 className="font-bold text-[#3d766d]">Recent Leave History</h3>
                <button className="text-xs font-semibold text-[#8f9192] hover:text-[#3d766d]">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#f0f3f5] text-[#8f9192]">
                      <th className="px-5 py-3 font-semibold">Leave Type</th>
                      <th className="px-5 py-3 font-semibold">Date Range</th>
                      <th className="px-5 py-3 font-semibold">Days</th>
                      <th className="px-5 py-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d6d9df]">
                    <tr className="hover:bg-[#f0f3f5]/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#3d766d]">Annual Leave</td>
                      <td className="px-5 py-4 text-[#8f9192]">Nov 12, 2023 - Nov 14, 2023</td>
                      <td className="px-5 py-4 font-medium text-[#8f9192]">3</td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">Approved</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f0f3f5]/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#3d766d]">Sick Leave</td>
                      <td className="px-5 py-4 text-[#8f9192]">Oct 05, 2023</td>
                      <td className="px-5 py-4 font-medium text-[#8f9192]">1</td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">Approved</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- APPLY LEAVE MODAL --- */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3d766d]/40 backdrop-blur-sm">
          <div className="bg-[#fdfdfe] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#d6d9df] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#3d766d]">Apply for Leave</h2>
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
                    className="w-full appearance-none px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3d766d] focus:ring-2 focus:ring-[#3d766d]/20 outline-none transition-all cursor-pointer"
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
                  <input type="date" required value={leaveForm.startDate} onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3d766d] focus:ring-2 focus:ring-[#3d766d]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">End Date *</label>
                  <input type="date" required value={leaveForm.endDate} onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3d766d] focus:ring-2 focus:ring-[#3d766d]/20 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Reason *</label>
                <textarea required rows="3" value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3d766d] focus:ring-2 focus:ring-[#3d766d]/20 outline-none transition-all resize-none placeholder:text-[#bdc2c7]" placeholder="Briefly explain your reason for leave..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-[#8f9192] border border-[#d6d9df] rounded-lg hover:bg-[#f0f3f5] transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 flex items-center gap-2 text-sm font-bold text-[#fdfdfe] bg-[#3d766d] rounded-lg hover:bg-opacity-90 shadow-sm transition-all"><Send size={16}/> Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3d766d]/40 backdrop-blur-sm">
          <div className="bg-[#fdfdfe] w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#d6d9df] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#3d766d]">Edit Profile</h2>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-[#8f9192] hover:text-red-500 transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleEditProfile} className="p-6 space-y-5">
              
              {/* Photo Upload Mockup */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-20 h-20 bg-[#f0f3f5] rounded-full border-2 border-[#d6d9df] flex items-center justify-center mb-2">
                  <Camera size={24} className="text-[#bdc2c7]" />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-white text-xs font-bold">Upload</span>
                  </div>
                </div>
                <p className="text-xs text-[#8f9192]">Click to update photo</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Phone Number</label>
                <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3d766d] focus:ring-2 focus:ring-[#3d766d]/20 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Location / Address</label>
                <input type="text" value={profileForm.location} onChange={(e) => setProfileForm({...profileForm, location: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3d766d] focus:ring-2 focus:ring-[#3d766d]/20 outline-none transition-all" />
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-blue-700 leading-relaxed">To change your Name, Department, or Work Email, please contact the HR Administrator.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-[#8f9192] border border-[#d6d9df] rounded-lg hover:bg-[#f0f3f5] transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-[#fdfdfe] bg-[#3d766d] rounded-lg hover:bg-opacity-90 shadow-sm transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}