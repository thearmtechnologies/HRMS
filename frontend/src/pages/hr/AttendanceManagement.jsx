import React, { useState } from 'react';
import { 
  Search, Filter, Download, UserCheck, UserX, Clock, 
  AlertCircle, CheckCircle2, XCircle, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, MapPin, Monitor
} from 'lucide-react';

// --- MOCK DATA ---
const ATTENDANCE_STATS = {
  total: 452,
  present: 415,
  absent: 18,
  late: 12,
  onLeave: 7,
  pendingAdjustments: 5
};

const ATTENDANCE_LOGS = [
  { id: 1, name: 'Sarah Jenkins', role: 'UI/UX Designer', dept: 'Design', checkIn: '08:45 AM', checkOut: '05:30 PM', status: 'Present', type: 'Office', hours: '8h 45m', initial: 'SJ' },
  { id: 2, name: 'Marcus Doe', role: 'Frontend Dev', dept: 'Engineering', checkIn: '09:45 AM', checkOut: '--', status: 'Late', type: 'Remote', hours: 'Working', initial: 'MD' },
  { id: 3, name: 'Alice Smith', role: 'Sales Exec', dept: 'Sales', checkIn: '09:20 AM', checkOut: '--', status: 'Late', type: 'Office', hours: 'Working', initial: 'AS' },
  { id: 4, name: 'John Taylor', role: 'DevOps Engineer', dept: 'Engineering', checkIn: '--', checkOut: '--', status: 'Absent', type: '--', hours: '--', initial: 'JT' },
  { id: 5, name: 'Emma Wilson', role: 'HR Manager', dept: 'HR', checkIn: '08:55 AM', checkOut: '--', status: 'Present', type: 'Office', hours: 'Working', initial: 'EW' },
  { id: 6, name: 'Liam Brown', role: 'Backend Dev', dept: 'Engineering', checkIn: '09:00 AM', checkOut: '--', status: 'Present', type: 'Remote', hours: 'Working', initial: 'LB' },
];

const REGULARIZATION_REQUESTS = [
  { id: 101, name: 'David Clark', date: 'Oct 25, 2023', reason: 'Forgot to punch in', requestedTime: '09:00 AM', type: 'Check-In', initial: 'DC' },
  { id: 102, name: 'Sophia Lee', date: 'Oct 24, 2023', reason: 'Client meeting offsite', requestedTime: '05:00 PM', type: 'Check-Out', initial: 'SL' },
  { id: 103, name: 'Ethan Hunt', date: 'Oct 24, 2023', reason: 'Biometric issue', requestedTime: '09:15 AM', type: 'Check-In', initial: 'EH' },
];

// --- REUSABLE COMPONENTS ---
const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] p-5 flex flex-col justify-between shadow-sm hover:border-[#bdc2c7] transition-colors">
    <div className="flex items-start justify-between mb-2">
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={20} />
      </div>
      {subtitle && <span className="text-xs font-semibold text-[#8f9192] bg-[#f0f3f5] px-2 py-1 rounded-md">{subtitle}</span>}
    </div>
    <div>
      <p className="text-2xl font-bold text-[#3d766d]">{value}</p>
      <p className="text-sm font-semibold text-[#8f9192] uppercase tracking-wider mt-1">{title}</p>
    </div>
  </div>
);

const StatusPill = ({ status }) => {
  let styles = "";
  switch(status) {
    case 'Present': styles = "bg-green-50 text-green-700 border-green-200"; break;
    case 'Late': styles = "bg-yellow-50 text-yellow-700 border-yellow-200"; break;
    case 'Absent': styles = "bg-red-50 text-red-700 border-red-200"; break;
    default: styles = "bg-[#f0f3f5] text-[#8f9192] border-[#d6d9df]";
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${styles}`}>
      {status}
    </span>
  );
};

export default function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState('All');
  
  // Filter logs based on selected tab
  const filteredLogs = ATTENDANCE_LOGS.filter(log => {
    if (activeTab === 'All') return true;
    return log.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* 1. Page Header */}
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3d766d]">Attendance Management</h1>
          <p className="text-[#8f9192] mt-1">Monitor daily attendance, track working hours, and manage adjustments.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector */}
          <div className="flex items-center bg-[#fdfdfe] border border-[#d6d9df] rounded-lg p-1 shadow-sm">
            <button className="p-1.5 hover:bg-[#f0f3f5] rounded text-[#8f9192] transition-colors"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-2 px-3 py-1 font-semibold text-[#3d766d]">
              <CalendarIcon size={16} />
              <span>Oct 25, 2023</span>
            </div>
            <button className="p-1.5 hover:bg-[#f0f3f5] rounded text-[#8f9192] transition-colors"><ChevronRight size={18} /></button>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] text-[#3d766d] text-sm font-semibold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* 2. Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Staff" value={ATTENDANCE_STATS.total} icon={Monitor} colorClass="bg-[#f0f3f5] text-[#3d766d]" />
          <StatCard title="Present" value={ATTENDANCE_STATS.present} subtitle="91.8%" icon={UserCheck} colorClass="bg-green-50 text-green-600" />
          <StatCard title="Late" value={ATTENDANCE_STATS.late} icon={Clock} colorClass="bg-yellow-50 text-yellow-600" />
          <StatCard title="Absent" value={ATTENDANCE_STATS.absent} icon={UserX} colorClass="bg-red-50 text-red-600" />
          <StatCard title="On Leave" value={ATTENDANCE_STATS.onLeave} icon={CalendarIcon} colorClass="bg-[#f0f3f5] text-[#8f9192]" />
          <StatCard title="Requests" value={ATTENDANCE_STATS.pendingAdjustments} icon={AlertCircle} colorClass="bg-orange-50 text-orange-500" />
        </div>

        {/* 3. Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Detailed Attendance Logs (Spans 2 columns on XL screens) */}
          <div className="xl:col-span-2 bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden">
            
            {/* Table Header & Controls */}
            <div className="p-5 border-b border-[#d6d9df] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#3d766d]">Today's Logs</h2>
                <span className="bg-[#f0f3f5] text-[#8f9192] text-xs font-bold px-2 py-1 rounded-full">{ATTENDANCE_LOGS.length} Records</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7]" />
                  <input 
                    type="text" 
                    placeholder="Search employee..." 
                    className="pl-9 pr-4 py-2 w-48 sm:w-64 bg-[#f0f3f5] border border-transparent rounded-lg text-sm focus:bg-[#fdfdfe] focus:border-[#3d766d] focus:outline-none transition-all"
                  />
                </div>
                <button className="p-2 border border-[#d6d9df] text-[#8f9192] hover:text-[#3d766d] hover:bg-[#f0f3f5] rounded-lg transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 border-b border-[#d6d9df] flex gap-6 overflow-x-auto hide-scrollbar">
              {['All', 'Present', 'Late', 'Absent'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab 
                    ? 'border-[#3d766d] text-[#3d766d]' 
                    : 'border-transparent text-[#8f9192] hover:text-[#3d766d]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-[#f0f3f5] text-[#8f9192]">
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Employee</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Status</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Check-In</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Check-Out</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Work Mode</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs text-right">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6d9df]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#bdc2c7] text-[#fdfdfe] flex items-center justify-center font-bold text-sm shadow-sm">
                            {log.initial}
                          </div>
                          <div>
                            <p className="font-bold text-[#3d766d]">{log.name}</p>
                            <p className="text-xs text-[#8f9192]">{log.dept}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={log.status} />
                      </td>
                      <td className="px-5 py-4 font-medium text-[#8f9192]">
                        {log.checkIn}
                      </td>
                      <td className="px-5 py-4 font-medium text-[#8f9192]">
                        {log.checkOut}
                      </td>
                      <td className="px-5 py-4">
                        {log.type === 'Office' && <span className="flex items-center gap-1.5 text-xs font-medium text-[#8f9192]"><MapPin size={14}/> Office</span>}
                        {log.type === 'Remote' && <span className="flex items-center gap-1.5 text-xs font-medium text-[#8f9192]"><Monitor size={14}/> Remote</span>}
                        {log.type === '--' && <span className="text-[#bdc2c7]">--</span>}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-[#3d766d]">
                        {log.hours}
                      </td>
                    </tr>
                  ))}
                  
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-10 text-center text-[#bdc2c7]">
                        No attendance records found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Pending Regularizations / Adjustments */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#d6d9df] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#3d766d]">Pending Requests</h2>
                <span className="w-5 h-5 flex items-center justify-center bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                  {REGULARIZATION_REQUESTS.length}
                </span>
              </div>
              <button className="text-xs font-semibold text-[#3d766d] hover:underline">View All</button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto">
              <p className="text-xs text-[#8f9192] mb-2">Employees requesting manual attendance adjustments.</p>
              
              {REGULARIZATION_REQUESTS.map((req) => (
                <div key={req.id} className="p-4 border border-[#d6d9df] rounded-xl bg-[#f0f3f5]/50 hover:bg-[#f0f3f5] hover:border-[#bdc2c7] transition-all">
                  
                  {/* User Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3d766d]/10 text-[#3d766d] flex items-center justify-center font-bold text-xs border border-[#3d766d]/20">
                        {req.initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#3d766d]">{req.name}</p>
                        <p className="text-xs text-[#8f9192]">{req.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="bg-[#fdfdfe] border border-[#d6d9df] p-3 rounded-lg mb-3 shadow-sm">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#8f9192] font-semibold">Type:</span>
                      <span className="text-[#3d766d] font-bold">{req.type}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#8f9192] font-semibold">Requested Time:</span>
                      <span className="text-[#3d766d] font-bold">{req.requestedTime}</span>
                    </div>
                    <div className="text-xs mt-2 pt-2 border-t border-[#f0f3f5]">
                      <span className="text-[#8f9192] italic">"{req.reason}"</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}