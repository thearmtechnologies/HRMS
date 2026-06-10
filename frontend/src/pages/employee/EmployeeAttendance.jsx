import React, { useState, useEffect } from "react";
import {
  Clock,
  CalendarDays,
  MapPin,
  Coffee,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  FileText,
  History,
  Briefcase,
  ChevronDown,
  Filter,
  Bell,
  Play,
  Square,
  ArrowUpRight,
  MoreVertical,
  Check
} from "lucide-react";

// --- MOCK DATA ---
const SUMMARY_STATS = [
  { title: "Days Present", value: "18", total: "22", subtitle: "This Month", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
  { title: "Days Absent", value: "1", total: "22", subtitle: "This Month", icon: XCircle, color: "text-rose-600", bg: "bg-rose-100" },
  { title: "Late Arrivals", value: "2", total: "", subtitle: "This Month", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-100" },
  { title: "Leave Balance", value: "14", total: "24", subtitle: "Total Remaining", icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
];

const HISTORY_DATA = [
  { date: "10 Jun 2026", day: "Wednesday", checkIn: "09:02 AM", checkOut: "06:15 PM", hours: "9h 13m", break: "45m", ot: "1h 13m", status: "Present", shift: "Morning", remarks: "Regular" },
  { date: "09 Jun 2026", day: "Tuesday", checkIn: "09:15 AM", checkOut: "06:00 PM", hours: "8h 45m", break: "1h 00m", ot: "0h", status: "Late", shift: "Morning", remarks: "Traffic" },
  { date: "08 Jun 2026", day: "Monday", checkIn: "08:55 AM", checkOut: "07:30 PM", hours: "10h 35m", break: "45m", ot: "2h 35m", status: "Present", shift: "Morning", remarks: "Project Release" },
  { date: "07 Jun 2026", day: "Sunday", checkIn: "-", checkOut: "-", hours: "-", break: "-", ot: "-", status: "Weekend", shift: "-", remarks: "-" },
  { date: "06 Jun 2026", day: "Saturday", checkIn: "-", checkOut: "-", hours: "-", break: "-", ot: "-", status: "Weekend", shift: "-", remarks: "-" },
  { date: "05 Jun 2026", day: "Friday", checkIn: "09:00 AM", checkOut: "06:05 PM", hours: "9h 05m", break: "50m", ot: "0h", status: "WFH", shift: "Morning", remarks: "Approved" },
];

const REGULARIZATION_REQUESTS = [
  { id: "REQ001", date: "04 Jun 2026", reason: "Missed Punch Out", status: "Pending", approver: "Sarah Johnson" },
  { id: "REQ002", date: "28 May 2026", reason: "System Error", status: "Approved", approver: "Sarah Johnson" },
];

const NOTIFICATIONS = [
  { id: 1, title: "Late Arrival Warning", time: "Yesterday, 09:16 AM", type: "warning" },
  { id: 2, title: "Overtime Approved (2.5h)", time: "08 Jun 2026", type: "success" },
  { id: 3, title: "Leave Approved (12 Jun)", time: "05 Jun 2026", type: "success" },
];

// Bar Chart Mock Data (Percentages for CSS heights)
const WEEKLY_HOURS = [
  { day: "Mon", hours: 10.5, pct: 90 },
  { day: "Tue", hours: 8.75, pct: 70 },
  { day: "Wed", hours: 9.2, pct: 75 },
  { day: "Thu", hours: 8.0, pct: 65 },
  { day: "Fri", hours: 9.0, pct: 72 },
];


export default function EmployeeAttendance() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);

  // Live clock simulation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const handleClockToggle = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      setIsOnBreak(false);
    } else {
      setIsClockedIn(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">My Attendance</h1>
          <p className="text-sm text-[#8f9192] mt-1">Track your daily attendance, working hours, and leaves.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#8f9192] rounded-lg hover:bg-[#f0f3f5] hover:text-[#1E293B] transition-colors text-sm font-medium shadow-sm">
            <Download size={16} />
            Timesheet
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#8f9192] rounded-lg hover:bg-[#f0f3f5] hover:text-[#1E293B] transition-colors text-sm font-medium shadow-sm">
            <Download size={16} />
            Export Excel
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#3B82F6] text-[#fdfdfe] rounded-lg hover:bg-[#3B82F6]/90 transition-colors text-sm font-medium shadow-sm shadow-[#3B82F6]/20">
            <CalendarDays size={16} />
            Apply Leave
          </button>
        </div>
      </div>

      {/* --- TOP GRID: CLOCK WIDGET & STATS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        
        {/* Clock In/Out Widget (Spans 1 col on XL, full width on smaller) */}
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden xl:col-span-1 lg:col-span-1">
          {/* Decorative background element */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-2xl"></div>
          
          <div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h2 className="text-sm font-bold text-[#8f9192] uppercase tracking-wider">Clock Action</h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isClockedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f0f3f5] text-[#8f9192]'}`}>
                {isClockedIn ? (isOnBreak ? 'On Break' : 'Clocked In') : 'Clocked Out'}
              </span>
            </div>
            <div className="text-center my-6 relative z-10">
              <div className="text-4xl font-black text-[#1E293B] tabular-nums tracking-tight mb-1">
                {formatTime(currentTime)}
              </div>
              <p className="text-sm text-[#8f9192] font-medium">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <button 
              onClick={handleClockToggle}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-sm ${
                isClockedIn 
                  ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100" 
                  : "bg-[#3B82F6] text-[#fdfdfe] hover:bg-[#3B82F6]/90 shadow-[#3B82F6]/20"
              }`}
            >
              {isClockedIn ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              {isClockedIn ? "Clock Out" : "Clock In"}
            </button>
            
            {isClockedIn && (
              <button 
                onClick={() => setIsOnBreak(!isOnBreak)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all text-sm ${
                  isOnBreak
                    ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
                    : "bg-[#f0f3f5] text-[#8f9192] border border-[#d6d9df] hover:text-[#1E293B] hover:border-[#bdc2c7]"
                }`}
              >
                <Coffee size={16} />
                {isOnBreak ? "End Break" : "Start Break"}
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-[#8f9192] mt-4 pt-4 border-t border-[#d6d9df]">
              <MapPin size={12} />
              <span>Office - Headquaters (Mumbai)</span>
            </div>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="lg:col-span-2 xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {SUMMARY_STATS.map((stat, idx) => (
            <div key={idx} className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm flex flex-col justify-center hover:border-[#bdc2c7] transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={22} />
                </div>
                {stat.total && (
                  <span className="text-xs font-bold text-[#8f9192] bg-[#f0f3f5] px-2 py-1 rounded-md">
                    / {stat.total}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 mb-1">{stat.value}</h3>
                <p className="text-sm font-semibold text-[#8f9192]">{stat.title}</p>
                <p className="text-xs text-[#bdc2c7] mt-1">{stat.subtitle}</p>
              </div>
            </div>
          ))}

          {/* Today's Overview (Spans 2 cols on wide screens) */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm sm:col-span-2 xl:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[#d6d9df]">
             <div className="px-4 first:pl-0">
               <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Check In</p>
               <p className="text-lg font-bold text-slate-800">09:02 AM</p>
             </div>
             <div className="px-4">
               <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Check Out</p>
               <p className="text-lg font-bold text-slate-800">--:--</p>
             </div>
             <div className="px-4">
               <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Total Hours</p>
               <p className="text-lg font-bold text-[#1E293B]">4h 38m</p>
             </div>
             <div className="px-4">
               <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Overtime</p>
               <p className="text-lg font-bold text-slate-800">0h 0m</p>
             </div>
          </div>
        </div>
      </div>

      {/* --- MAIN LAYOUT: LEFT CONTENT (Calendar, History) & RIGHT CONTENT (Charts, Info) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* History Table */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#d6d9df] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <History size={20} className="text-[#1E293B]" />
                Attendance History
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-[#d6d9df] rounded-lg text-sm text-[#8f9192] hover:bg-[#f0f3f5] transition-colors">
                  <Filter size={14} />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-[#d6d9df] rounded-lg text-sm text-[#8f9192] hover:bg-[#f0f3f5] transition-colors">
                  June 2026
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#f0f3f5] text-[#8f9192] text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Date</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Check In</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Check Out</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Hours</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Overtime</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {HISTORY_DATA.map((row, i) => (
                    <tr key={i} className="border-b border-[#d6d9df] hover:bg-[#f0f3f5]/50 transition-colors last:border-0">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{row.date}</div>
                        <div className="text-xs text-[#8f9192]">{row.day}</div>
                      </td>
                      <td className="p-4 font-medium">{row.checkIn}</td>
                      <td className="p-4 font-medium">{row.checkOut}</td>
                      <td className="p-4 font-bold text-slate-800">{row.hours}</td>
                      <td className="p-4 text-[#8f9192]">{row.ot}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                          row.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                          row.status === 'WFH' ? 'bg-purple-100 text-purple-700' :
                          'bg-[#f0f3f5] text-[#8f9192]'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-[#d6d9df] text-center">
              <button className="text-sm font-bold text-[#1E293B] hover:underline">View Full Month</button>
            </div>
          </div>

          {/* Regularization Requests */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
             <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-[#1E293B]" />
                Regularization Requests
              </h2>
              <button className="text-sm font-bold text-[#1E293B] hover:underline flex items-center gap-1">
                New Request <ArrowUpRight size={14} />
              </button>
            </div>
            
            <div className="space-y-3">
              {REGULARIZATION_REQUESTS.map((req, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#d6d9df] hover:border-[#bdc2c7] transition-colors gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-800">{req.date}</span>
                      <span className="text-xs text-[#8f9192] px-2 py-0.5 bg-[#f0f3f5] rounded-md">{req.id}</span>
                    </div>
                    <p className="text-sm text-[#8f9192]">Reason: {req.reason}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-[#8f9192]">Approver</p>
                      <p className="text-sm font-semibold">{req.approver}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                    <button className="p-1.5 text-[#8f9192] hover:text-slate-800 hover:bg-[#f0f3f5] rounded-lg">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Calendar (Visual Representation) */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays size={20} className="text-[#1E293B]" />
                June 2026
              </h2>
              <div className="flex items-center gap-4 text-xs font-semibold text-[#8f9192]">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Present</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Absent</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Holiday</div>
              </div>
            </div>
            
            {/* Simple CSS Grid Calendar Component */}
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-xs font-bold text-[#8f9192] py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {/* Dummy padding days */}
              <div className="p-2"></div>
              
              {/* Generate 30 days for June */}
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                // Assign mock statuses based on date
                let statusClass = "text-slate-800 hover:bg-[#f0f3f5]";
                let dotClass = "bg-transparent";
                
                if (day === 6 || day === 7 || day === 13 || day === 14 || day === 20 || day === 21 || day === 27 || day === 28) {
                   statusClass = "text-[#bdc2c7] bg-[#f0f3f5]/50"; // Weekends
                } else if (day === 4) {
                   statusClass = "text-slate-800 bg-rose-50 border border-rose-100";
                   dotClass = "bg-rose-500"; // Absent
                } else if (day === 12) {
                   statusClass = "text-slate-800 bg-blue-50 border border-blue-100";
                   dotClass = "bg-blue-500"; // Holiday
                } else if (day <= 10) {
                   statusClass = "text-slate-800 bg-emerald-50 border border-emerald-100 font-bold";
                   dotClass = "bg-emerald-500"; // Present (Past days)
                } else if (day === 11) {
                    statusClass = "text-[#fdfdfe] bg-[#3B82F6] font-bold shadow-md"; // Today
                }

                return (
                  <div key={day} className={`relative flex flex-col items-center justify-center h-12 rounded-xl border border-transparent transition-all cursor-pointer ${statusClass}`}>
                    <span className="text-sm z-10">{day}</span>
                    {dotClass !== "bg-transparent" && (
                      <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Narrower) */}
        <div className="space-y-6">
          
          {/* Shift Information */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Briefcase size={20} className="text-[#1E293B]" />
              Shift Information
            </h2>
            <div className="bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-800">Morning Shift</span>
                <span className="text-xs font-bold text-[#1E293B] bg-[#3B82F6]/10 px-2 py-1 rounded-md">Fixed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8f9192] mb-3">
                <Clock size={14} />
                09:00 AM - 06:00 PM
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#d6d9df]">
                <span className="text-xs font-semibold text-[#8f9192] bg-[#fdfdfe] border border-[#d6d9df] px-2 py-1 rounded-md">Weekly Off: Sat, Sun</span>
                <span className="text-xs font-semibold text-[#8f9192] bg-[#fdfdfe] border border-[#d6d9df] px-2 py-1 rounded-md">Break: 1 Hr</span>
              </div>
            </div>
          </div>

          {/* Working Hours Analytics (Custom CSS Chart) */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays size={20} className="text-[#1E293B]" />
                Weekly Hours
              </h2>
              <span className="text-sm font-bold text-[#1E293B]">44.5h Total</span>
            </div>
            
            {/* CSS Bar Chart */}
            <div className="h-40 flex items-end justify-between gap-2 pb-2">
              {WEEKLY_HOURS.map((day, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip on hover (simulated) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-slate-800 bg-[#f0f3f5] rounded px-1.5 py-0.5 mb-1">
                    {day.hours}h
                  </div>
                  {/* Bar */}
                  <div className="w-full bg-[#f0f3f5] rounded-t-lg relative overflow-hidden h-32">
                    <div 
                      className="absolute bottom-0 w-full bg-[#3B82F6] rounded-t-lg transition-all duration-500 ease-out hover:bg-[#3B82F6]/80"
                      style={{ height: `${day.pct}%` }}
                    ></div>
                  </div>
                  {/* Label */}
                  <span className="text-xs font-semibold text-[#8f9192] mt-2">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overtime & Balances */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-4">
                <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Monthly Overtime</p>
                <p className="text-2xl font-black text-slate-800 mb-1">12h 45m</p>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                   <Check size={12} /> 10h Approved
                </p>
             </div>
             <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-4">
                <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Casual Leaves</p>
                <p className="text-2xl font-black text-slate-800 mb-1">04</p>
                <p className="text-xs text-[#8f9192] font-semibold">out of 10 remaining</p>
             </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Bell size={20} className="text-[#1E293B]" />
              Recent Alerts
            </h2>
            <div className="space-y-4">
              {NOTIFICATIONS.map((notif) => (
                <div key={notif.id} className="flex gap-3">
                  <div className={`mt-0.5 rounded-full p-1.5 h-fit ${
                    notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {notif.type === 'warning' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{notif.title}</p>
                    <p className="text-xs text-[#8f9192] mt-0.5">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 py-2 border border-[#d6d9df] text-sm font-bold text-[#8f9192] rounded-xl hover:bg-[#f0f3f5] hover:text-[#1E293B] transition-colors">
              View All Notifications
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}