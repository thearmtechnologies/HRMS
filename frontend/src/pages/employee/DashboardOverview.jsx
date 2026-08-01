import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Megaphone,
  Users,
  Briefcase,
  FileText,
  Bell,
  ChevronRight,
  Play,
  Square,
  Activity,
  Target,
  ArrowRight,
  LayoutDashboard,
  Wallet,
  Coffee,
  IdCard,
  Loader2
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import { checkIn as apiCheckIn, checkOut as apiCheckOut, getTodayAttendance } from "../../services/attendanceService";
import announcementService from "../../services/announcementService";

// Time calculation constants
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;

// --- MOCK / UNCREATED SECTIONS DATA (Commented out below in JSX as requested) ---
/*
const TASKS_DATA = [
  { id: 1, name: "Update Employee Module", priority: "High", due: "11:30 AM", status: "Completed" },
  { id: 2, name: "Review API Documentation", priority: "Medium", due: "02:00 PM", status: "Completed" },
  { id: 3, name: "Complete Dashboard UI", priority: "High", due: "04:30 PM", status: "Pending" },
  { id: 4, name: "Fix Login Bug", priority: "Critical", due: "05:00 PM", status: "Pending" }
];
const MEETINGS_DATA = [
  { name: "Sprint Planning", time: "11:00 AM", organizer: "John Smith" },
  { name: "Project Review", time: "03:00 PM", organizer: "Sarah Johnson" }
];
const DEADLINES_DATA = [
  { name: "HRMS Dashboard", project: "HRMS System", dueIn: "2 Days", urgency: "high" },
  { name: "Payroll Module", project: "HRMS System", dueIn: "5 Days", urgency: "medium" },
  { name: "Attendance System", project: "HRMS System", dueIn: "7 Days", urgency: "low" }
];
const ANNOUNCEMENTS_DATA = [
  { title: "New Leave Policy Published", date: "Today" },
  { title: "Team Meeting Friday 3 PM", date: "Yesterday" },
  { title: "Office Holiday on June 20", date: "08 Jun 2026" }
];
*/

export default function DashboardOverview() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Functional States
  const [attendance, setAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [leaveBalances, setLeaveBalances] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. Fetch Today's Attendance
    try {
      setLoadingAttendance(true);
      const res = await getTodayAttendance();
      if (res) {
         setAttendance(res.attendance || null);
         if (res.todayHoliday) {
            const paidStr = res.todayHoliday.isPaid !== false ? "Paid Holiday" : "Unpaid";
            const checkInStr = res.todayHoliday.allowCheckIn ? "Yes" : "No";
            setAnnouncements(prev => [
              { title: `Today's Holiday: ${res.todayHoliday.name} - ${paidStr} - Check-in Allowed: ${checkInStr}`, date: new Date().toLocaleDateString(), type: "Company" },
              ...prev
            ]);
         }
      } else {
         setAttendance(null);
      }
    } catch (err) {
      console.error("Error loading today attendance:", err);
    } finally {
      setLoadingAttendance(false);
    }

    // 2. Fetch Leave Balances
    try {
      const resLeaves = await fetch("http://localhost:5000/api/leave/my-balances", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resLeaves.ok) {
        const leavesData = await resLeaves.json();
        setLeaveBalances(leavesData);
      }
    } catch (err) {
      console.error("Error loading leave balances:", err);
    }

    // 3. Fetch Projects
    try {
      const resProjects = await fetch("http://localhost:5000/api/projects/my-projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resProjects.ok) {
        const projData = await resProjects.json();
        setProjects(Array.isArray(projData) ? projData : []);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    }

    // 4. Fetch Notifications
    try {
      const resNotif = await fetch("http://localhost:5000/api/notifications/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resNotif.ok) {
        const notifData = await resNotif.json();
        setNotifications(Array.isArray(notifData) ? notifData : []);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }

    // 5. Fetch Announcements
    try {
      const annData = await announcementService.getMyAnnouncements();
      setAnnouncements(Array.isArray(annData) ? annData : []);
    } catch (err) {
      console.error("Error loading announcements:", err);
    }
  };

  const handleClockIn = async () => {
    try {
      setClockActionLoading(true);
      setErrorMsg("");
      const res = await apiCheckIn({ notes: "Checked in from dashboard" });
      if (res) {
        const attData = await getTodayAttendance();
        setAttendance(attData || null);
      }
    } catch (err) {
      console.error("Clock In Error:", err);
      setErrorMsg(err.message || "Failed to clock in");
    } finally {
      setClockActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setClockActionLoading(true);
      setErrorMsg("");
      const res = await apiCheckOut({ notes: "Checked out from dashboard" });
      if (res) {
        const attData = await getTodayAttendance();
        setAttendance(attData || null);
      }
    } catch (err) {
      console.error("Clock Out Error:", err);
      setErrorMsg(err.message || "Failed to clock out");
    } finally {
      setClockActionLoading(false);
    }
  };

  const getFormattedDate = () => {
    return currentTime.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTimeStr = (dateVal) => {
    if (!dateVal) return "--:--";
    return new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Compute live working hours
  const computeWorkingTime = () => {
    if (!attendance?.checkInTime) return "0h 00m";
    const start = new Date(attendance.checkInTime);
    const end = attendance.checkOutTime ? new Date(attendance.checkOutTime) : currentTime;
    if (end < start) return "0h 00m";
    const diffMs = end - start;
    const totalMins = Math.floor(diffMs / MS_PER_MINUTE);
    const hours = Math.floor(totalMins / MINUTES_PER_HOUR);
    const mins = totalMins % MINUTES_PER_HOUR;
    return `${hours}h ${mins < 10 ? '0' : ''}${mins}m`;
  };

  const isCheckedIn = Boolean(attendance?.checkInTime && !attendance?.checkOutTime);
  const hasCheckedOut = Boolean(attendance?.checkOutTime);

  // Stats calculation
  const totalLeavesAvailable = leaveBalances 
    ? (leaveBalances.casualLeave?.available || 0) + (leaveBalances.sickLeave?.available || 0) + (leaveBalances.earnedLeave?.available || 0)
    : 12;
  const activeProjectsCount = projects.filter(p => p.status !== 'Completed').length || projects.length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f0f3f5] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* 1. WELCOME SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-[#fdfdfe] p-6 rounded-2xl border border-[#d6d9df] shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xl font-black shadow-md border-2 border-white shrink-0 overflow-hidden">
            {user?.profileImage || user?.url ? (
              <img src={user.profileImage || user.url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.firstName?.substring(0, 2).toUpperCase() || 'User'
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Good Morning, {user?.firstName || 'User'} 👋</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm font-medium">
              <span className="text-[#1E293B] bg-[#3B82F6]/10 px-2.5 py-0.5 rounded-md">{user?.designation || user?.role || 'Employee'}</span>
              <span className="text-[#8f9192]">• {user?.department?.departmentName || user?.department || 'General Operations'}</span>
              <span className="text-[#8f9192] text-xs ml-1 border border-[#d6d9df] px-2 py-0.5 rounded">ID: {user?.employeeId || user?.employeeCode || 'EMP'}</span>
            </div>
          </div>
        </div>
        <div className="text-left md:text-right relative z-10">
          <p className="text-sm font-bold text-[#8f9192] uppercase tracking-wider mb-1">Today</p>
          <p className="text-lg font-bold text-slate-800">{getFormattedDate()}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="font-bold underline ml-3">Dismiss</button>
        </div>
      )}

      {/* MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN (WIDER) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. TODAY'S STATUS & 3. QUICK STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Today's Status Card */}
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Clock size={16} className="text-[#1E293B]" /> Today's Status
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {isCheckedIn && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCheckedIn ? 'bg-emerald-500' : hasCheckedOut ? 'bg-blue-500' : 'bg-[#8f9192]'}`}></span>
                    </span>
                    <span className={`text-sm font-bold ${isCheckedIn ? 'text-emerald-600' : hasCheckedOut ? 'text-blue-600' : 'text-[#8f9192]'}`}>
                      {isCheckedIn ? 'Checked In' : hasCheckedOut ? 'Checked Out (Done)' : 'Not Checked In'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#8f9192] uppercase">Working Time</p>
                  <p className="text-2xl font-black text-[#1E293B] tabular-nums leading-none mt-1">{computeWorkingTime()}</p>
                </div>
              </div>

              <div className="bg-[#f0f3f5] rounded-xl p-3 mb-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#8f9192] block mb-0.5">Check In</span>
                  <span className="font-bold text-slate-800">{formatTimeStr(attendance?.checkInTime)}</span>
                </div>
                <div className="w-px h-6 bg-[#d6d9df]"></div>
                <div>
                  <span className="text-[#8f9192] block mb-0.5">Check Out</span>
                  <span className="font-bold text-slate-800">{formatTimeStr(attendance?.checkOutTime)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleClockIn}
                  disabled={clockActionLoading || isCheckedIn || hasCheckedOut}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    !isCheckedIn && !hasCheckedOut
                      ? "bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 shadow-sm shadow-[#3B82F6]/20 active:scale-95" 
                      : "bg-[#f0f3f5] text-[#8f9192] border border-[#d6d9df] cursor-not-allowed opacity-60"
                  }`}
                >
                  {clockActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                  {isCheckedIn ? "Clocked In" : "Clock In"}
                </button>
                <button 
                  onClick={handleClockOut}
                  disabled={clockActionLoading || !isCheckedIn || hasCheckedOut}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isCheckedIn && !hasCheckedOut
                      ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 active:scale-95" 
                      : "bg-[#f0f3f5] text-[#8f9192] border border-[#d6d9df] cursor-not-allowed opacity-60"
                  }`}
                >
                  {clockActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} fill="currentColor" />}
                  {hasCheckedOut ? "Clocked Out" : "Clock Out"}
                </button>
              </div>
            </div>

            {/* Quick Statistics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
              <StatCard
                title="Attendance Status"
                value={isCheckedIn ? "Active" : hasCheckedOut ? "Completed" : "Pending"}
                icon={Activity}
                colorClass="bg-blue-50 text-blue-600"
                onClick={() => navigate("/employee-dashboard?tab=attendance")}
              />
              <StatCard
                title="Available Leaves"
                value={totalLeavesAvailable}
                icon={Coffee}
                colorClass="bg-blue-50 text-blue-600"
                onClick={() => navigate("/employee-dashboard?tab=my-leaves")}
              />
              <StatCard
                title="Active Projects"
                value={activeProjectsCount}
                icon={Briefcase}
                colorClass="bg-purple-50 text-purple-600"
                onClick={() => navigate("/employee-dashboard?tab=projects")}
              />
              <StatCard
                title="New Alerts"
                value={unreadNotificationsCount}
                icon={Bell}
                colorClass="bg-amber-50 text-amber-600"
              />
            </div>
          </div>

          {/* =========================================================================
              COMMENTED OUT: UNCREATED SECTIONS AS REQUESTED BY USER
              (Today's Priority Tasks, Performance Overview, Urgent Deadlines, 
               Today's Meetings, Announcements are commented out below so they won't show)
             ========================================================================= */}
          {/*
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle size={18} className="text-[#1E293B]" /> Today's Priority Tasks
            </h2>
            <div className="space-y-3 mt-4">
              {TASKS_DATA.map(task => (
                <div key={task.id} className="p-3 bg-white border border-[#d6d9df] rounded-xl">{task.name}</div>
              ))}
            </div>
          </div>
          */}

          {/* PROJECT SNAPSHOT (Connected to real projects created by user) */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase size={16} className="text-[#1E293B]" /> My Active Projects
              </h2>
              <button 
                onClick={() => navigate("/employee-dashboard?tab=projects")}
                className="text-xs font-bold text-[#1E293B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-6 bg-[#f0f3f5]/50 rounded-xl border border-dashed border-[#d6d9df]">
                <p className="text-xs font-semibold text-[#8f9192]">No assigned projects currently active.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 4).map((proj, idx) => (
                  <div 
                    key={proj._id || idx}
                    onClick={() => navigate("/employee-dashboard?tab=projects")}
                    className="p-3 bg-[#f0f3f5]/40 rounded-xl border border-[#d6d9df] hover:border-[#bdc2c7] transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate pr-2">{proj.name || proj.projectTitle || 'Project'}</span>
                      <span className="text-xs font-bold text-[#3B82F6]">{proj.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#d6d9df]/60 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${proj.progress || 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COMMENTED OUT: Performance Overview Section */}
          {/*
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-5">
              <Target size={16} className="text-[#1E293B]" /> Performance Overview
            </h2>
          </div>
          */}

        </div>

        {/* RIGHT COLUMN (NARROWER) */}
        <div className="space-y-6">

          {/* QUICK ACCESS PANEL (All buttons navigate to real tabs created by user) */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate("/employee-dashboard?tab=my-leaves")}
                className="flex flex-col items-center justify-center gap-2 p-3.5 bg-[#f0f3f5] rounded-xl border border-transparent hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all text-[#8f9192] hover:text-[#1E293B] group cursor-pointer active:scale-95"
              >
                <Calendar size={20} className="group-hover:scale-110 transition-transform text-[#3B82F6]" />
                <span className="text-[11px] font-bold text-slate-800">Apply Leave</span>
              </button>

              <button 
                onClick={() => navigate("/employee-dashboard?tab=attendance")}
                className="flex flex-col items-center justify-center gap-2 p-3.5 bg-[#f0f3f5] rounded-xl border border-transparent hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all text-[#8f9192] hover:text-[#1E293B] group cursor-pointer active:scale-95"
              >
                <CheckCircle size={20} className="group-hover:scale-110 transition-transform text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-800">Attendance</span>
              </button>

              <button 
                onClick={() => navigate("/employee-dashboard?tab=payroll")}
                className="flex flex-col items-center justify-center gap-2 p-3.5 bg-[#f0f3f5] rounded-xl border border-transparent hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all text-[#8f9192] hover:text-[#1E293B] group cursor-pointer active:scale-95"
              >
                <Wallet size={20} className="group-hover:scale-110 transition-transform text-amber-600" />
                <span className="text-[11px] font-bold text-slate-800">Payslips</span>
              </button>

              <button 
                onClick={() => navigate("/virtual-id")}
                className="flex flex-col items-center justify-center gap-2 p-3.5 bg-[#f0f3f5] rounded-xl border border-transparent hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all text-[#8f9192] hover:text-[#1E293B] group cursor-pointer active:scale-95"
              >
                <IdCard size={20} className="group-hover:scale-110 transition-transform text-purple-600" />
                <span className="text-[11px] font-bold text-slate-800">Digital ID</span>
              </button>
            </div>
          </div>

          {/* LEAVE BALANCE SUMMARY (Connected to live leave balances) */}
          <div 
            onClick={() => navigate("/employee-dashboard?tab=my-leaves")}
            className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5 cursor-pointer hover:border-[#bdc2c7] transition-all group"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={16} className="text-[#1E293B]" /> Leave Balance
              </h2>
              <ChevronRight size={16} className="text-[#8f9192] group-hover:text-[#1E293B] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex justify-between divide-x divide-[#d6d9df] pt-1">
              <div className="flex-1 text-center px-2">
                <p className="text-xl font-black text-slate-800">{leaveBalances?.casualLeave?.available ?? 12}</p>
                <p className="text-[10px] font-bold text-[#8f9192] uppercase mt-1">Casual</p>
              </div>
              <div className="flex-1 text-center px-2">
                <p className="text-xl font-black text-slate-800">{leaveBalances?.sickLeave?.available ?? 8}</p>
                <p className="text-[10px] font-bold text-[#8f9192] uppercase mt-1">Sick</p>
              </div>
              <div className="flex-1 text-center px-2">
                <p className="text-xl font-black text-slate-800">{leaveBalances?.earnedLeave?.available ?? 15}</p>
                <p className="text-[10px] font-bold text-[#8f9192] uppercase mt-1">Earned</p>
              </div>
            </div>
          </div>

          {/* COMMENTED OUT: Urgent Deadlines, Today's Meetings */}
          {/*
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-rose-600" /> Urgent Deadlines
            </h2>
          </div>
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Users size={16} className="text-[#1E293B]" /> Today's Meetings
            </h2>
          </div>
          */}

          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Megaphone size={16} className="text-[#1E293B]" /> Announcements
              </h2>
              <button 
                onClick={() => navigate("/employee-dashboard?tab=announcements")}
                className="text-xs font-bold text-[#1E293B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            {announcements.length === 0 ? (
              <div className="text-center py-6 bg-[#f0f3f5]/50 rounded-xl border border-dashed border-[#d6d9df]">
                <p className="text-xs font-semibold text-[#8f9192]">No announcements available.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann, idx) => (
                  <div key={ann._id || idx} className="p-3 bg-[#f0f3f5]/40 border border-[#d6d9df] rounded-xl flex flex-col cursor-pointer hover:border-[#bdc2c7] transition-all" onClick={() => navigate("/employee-dashboard?tab=announcements")}>
                    <span className="text-xs font-bold text-slate-800 mb-1 line-clamp-1">{ann.title}</span>
                    <div className="flex justify-between items-center text-[10px] text-[#8f9192]">
                      <span className={`px-1.5 py-0.5 rounded-full ${ann.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{ann.type}</span>
                      <span>{new Date(ann.publishedAt || ann.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY / NOTIFICATIONS WIDGET */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Bell size={16} className="text-[#1E293B]" /> Recent Notifications
            </h2>
            {notifications.length === 0 ? (
              <div className="text-center py-6 bg-[#f0f3f5]/50 rounded-xl border border-dashed border-[#d6d9df]">
                <p className="text-xs font-semibold text-[#8f9192]">No recent notifications.</p>
              </div>
            ) : (
              <div className="space-y-3.5 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#f0f3f5]">
                {notifications.slice(0, 5).map((notif, idx) => (
                  <div key={notif._id || idx} className="flex gap-3 relative">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      !notif.read ? "bg-[#3B82F6] border-2 border-white shadow-sm" : "bg-[#d6d9df] border-2 border-white"
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs truncate ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-[#8f9192]'}`}>
                        {notif.title || notif.message || notif.text || 'Notification'}
                      </p>
                      <p className="text-[9px] text-[#bdc2c7] mt-0.5">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : notif.time || 'Recently'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}