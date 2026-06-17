import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
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
  Coffee
} from "lucide-react";

// --- MOCK DATA ---
const TASKS_DATA = [
  { id: 1, name: "Update Employee Module", priority: "High", due: "11:30 AM", status: "Completed" },
  { id: 2, name: "Review API Documentation", priority: "Medium", due: "02:00 PM", status: "Completed" },
  { id: 3, name: "Complete Dashboard UI", priority: "High", due: "04:30 PM", status: "Pending" },
  { id: 4, name: "Fix Login Bug", priority: "Critical", due: "05:00 PM", status: "Pending" }
];

const PROJECTS_DATA = [
  { name: "HRMS System", progress: 75, color: "bg-[#3B82F6]" },
  { name: "CRM Portal", progress: 40, color: "bg-amber-500" },
  { name: "Inventory App", progress: 20, color: "bg-blue-500" }
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

const NOTIFICATIONS_DATA = [
  { text: "Manager approved leave request", time: "10 mins ago", unread: true },
  { text: "New task assigned: Complete Dashboard UI", time: "1 hour ago", unread: true },
  { text: "Project deadline updated for CRM Portal", time: "3 hours ago", unread: false },
  { text: "Salary slip for May 2026 is available", time: "1 day ago", unread: false }
];

export default function DashboardOverview() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState(TASKS_DATA);
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simple live clock for the welcome header
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: t.status === "Completed" ? "Pending" : "Completed" };
      }
      return t;
    }));
  };

  const getFormattedDate = () => {
    return currentTime.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* 1. WELCOME SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-[#fdfdfe] p-6 rounded-2xl border border-[#d6d9df] shadow-sm relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xl font-black shadow-md border-2 border-white shrink-0 overflow-hidden">
            {user?.profileImage ? (
               <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               user?.firstName?.substring(0, 2).toUpperCase() || 'User'
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Good Morning, {user?.firstName || 'User'} 👋</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm font-medium">
              <span className="text-[#1E293B] bg-[#3B82F6]/10 px-2.5 py-0.5 rounded-md">{user?.designation || user?.role || 'Employee'}</span>
              <span className="text-[#8f9192]">• {user?.department?.departmentName || user?.department || 'Department'}</span>
              <span className="text-[#8f9192] text-xs ml-1 border border-[#d6d9df] px-2 py-0.5 rounded">ID: {user?.employeeId || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="text-left md:text-right relative z-10">
          <p className="text-sm font-bold text-[#8f9192] uppercase tracking-wider mb-1">Today</p>
          <p className="text-lg font-bold text-slate-800">{getFormattedDate()}</p>
        </div>
      </div>

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
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCheckedIn ? 'bg-emerald-500' : 'bg-[#8f9192]'}`}></span>
                    </span>
                    <span className={`text-sm font-bold ${isCheckedIn ? 'text-emerald-600' : 'text-[#8f9192]'}`}>
                      {isCheckedIn ? 'Checked In' : 'Checked Out'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#8f9192] uppercase">Working Time</p>
                  <p className="text-2xl font-black text-[#1E293B] tabular-nums leading-none mt-1">6h 42m</p>
                </div>
              </div>

              <div className="bg-[#f0f3f5] rounded-xl p-3 mb-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#8f9192] block mb-0.5">Check In</span>
                  <span className="font-bold text-slate-800">09:05 AM</span>
                </div>
                <div className="w-px h-6 bg-[#d6d9df]"></div>
                <div>
                  <span className="text-[#8f9192] block mb-0.5">Shift</span>
                  <span className="font-bold text-slate-800">09:00 AM - 06:00 PM</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCheckedIn(!isCheckedIn)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    !isCheckedIn 
                      ? "bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 shadow-sm shadow-[#3B82F6]/20" 
                      : "bg-[#f0f3f5] text-[#8f9192] hover:text-slate-800 border border-[#d6d9df]"
                  }`}
                >
                  <Play size={16} fill="currentColor" /> Clock In
                </button>
                <button 
                  onClick={() => setIsCheckedIn(false)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isCheckedIn 
                      ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100" 
                      : "bg-[#f0f3f5] text-[#8f9192] hover:text-slate-800 border border-[#d6d9df]"
                  }`}
                >
                  <Square size={16} fill="currentColor" /> Clock Out
                </button>
              </div>
            </div>

            {/* Quick Statistics Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-4 hover:border-[#bdc2c7] transition-colors">
                <div className="text-[#1E293B] bg-[#3B82F6]/10 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                  <Activity size={16} />
                </div>
                <p className="text-xl font-black text-slate-800 mb-0.5">96%</p>
                <p className="text-xs font-semibold text-[#8f9192]">Attendance Rate</p>
              </div>
              <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-4 hover:border-[#bdc2c7] transition-colors">
                <div className="text-blue-600 bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                  <Coffee size={16} />
                </div>
                <p className="text-xl font-black text-slate-800 mb-0.5">12</p>
                <p className="text-xs font-semibold text-[#8f9192]">Available Leaves</p>
              </div>
              <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-4 hover:border-[#bdc2c7] transition-colors">
                <div className="text-purple-600 bg-purple-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                  <Briefcase size={16} />
                </div>
                <p className="text-xl font-black text-slate-800 mb-0.5">3</p>
                <p className="text-xs font-semibold text-[#8f9192]">Active Projects</p>
              </div>
              <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-4 hover:border-[#bdc2c7] transition-colors">
                <div className="text-amber-600 bg-amber-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2">
                  <Target size={16} />
                </div>
                <p className="text-xl font-black text-slate-800 mb-0.5">5</p>
                <p className="text-xs font-semibold text-[#8f9192]">Pending Tasks</p>
              </div>
            </div>
          </div>

          {/* 4. TODAY'S TASKS */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle size={18} className="text-[#1E293B]" /> Today's Priority Tasks
              </h2>
              <button className="text-xs font-bold text-[#1E293B] hover:underline">View All Tasks</button>
            </div>
            
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    task.status === "Completed" 
                      ? "bg-[#f0f3f5]/50 border-transparent opacity-75" 
                      : "bg-white border-[#d6d9df] hover:border-[#bdc2c7] shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                      task.status === "Completed" ? "bg-emerald-500 border-emerald-500" : "border-[#bdc2c7] bg-[#f0f3f5]"
                    }`}>
                      {task.status === "Completed" && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <span className={`text-sm font-semibold ${task.status === "Completed" ? "text-[#8f9192] line-through" : "text-slate-800"}`}>
                      {task.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === "Critical" ? "bg-rose-100 text-rose-700" :
                      task.priority === "High" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs font-semibold text-[#8f9192] flex items-center gap-1 w-16 justify-end">
                      <Clock size={12} /> {task.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. PROJECT SNAPSHOT & 10. PERFORMANCE SNAPSHOT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Project Snapshot */}
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-5">
                <Briefcase size={16} className="text-[#1E293B]" /> Project Snapshot
              </h2>
              <div className="space-y-4">
                {PROJECTS_DATA.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-800">{proj.name}</span>
                      <span className="text-xs font-bold text-[#8f9192]">{proj.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#f0f3f5] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${proj.color}`} style={{ width: `${proj.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-5 py-2 text-xs font-bold text-[#8f9192] bg-[#f0f3f5] rounded-lg hover:text-[#1E293B] hover:bg-[#d6d9df]/50 transition-colors">
                Open Projects
              </button>
            </div>

            {/* Performance Snapshot */}
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-5">
                <Target size={16} className="text-[#1E293B]" /> Performance Overview
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#f0f3f5]/70 rounded-xl border border-[#d6d9df]">
                  <div>
                    <p className="text-[10px] font-bold text-[#8f9192] uppercase">Tasks Completed</p>
                    <p className="text-xl font-black text-slate-800 leading-none mt-1">24</p>
                  </div>
                  <span className="text-xs text-[#8f9192] font-medium">This Month</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#f0f3f5]/70 rounded-xl border border-[#d6d9df]">
                    <p className="text-[10px] font-bold text-[#8f9192] uppercase">Completion Rate</p>
                    <p className="text-lg font-black text-emerald-600 leading-none mt-1">92%</p>
                  </div>
                  <div className="p-3 bg-[#f0f3f5]/70 rounded-xl border border-[#d6d9df]">
                    <p className="text-[10px] font-bold text-[#8f9192] uppercase">Contributed</p>
                    <p className="text-lg font-black text-slate-800 leading-none mt-1">3 <span className="text-xs font-medium text-[#8f9192]">Projects</span></p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (NARROWER) */}
        <div className="space-y-6">

          {/* 11. QUICK ACCESS PANEL */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-3 bg-[#f0f3f5] rounded-xl border border-transparent hover:border-[#bdc2c7] hover:bg-[#d6d9df]/30 transition-all text-[#8f9192] hover:text-[#1E293B] group">
                <Calendar size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Apply Leave</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-3 bg-[#f0f3f5] rounded-xl border border-transparent hover:border-[#bdc2c7] hover:bg-[#d6d9df]/30 transition-all text-[#8f9192] hover:text-[#1E293B] group">
                <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Attendance</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-3 bg-[#f0f3f5] rounded-xl border border-transparent hover:border-[#bdc2c7] hover:bg-[#d6d9df]/30 transition-all text-[#8f9192] hover:text-[#1E293B] group">
                <Wallet size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">View Payroll</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-3 bg-[#f0f3f5] rounded-xl border border-transparent hover:border-[#bdc2c7] hover:bg-[#d6d9df]/30 transition-all text-[#8f9192] hover:text-[#1E293B] group">
                <FileText size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Documents</span>
              </button>
            </div>
          </div>

          {/* 8. LEAVE SUMMARY */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={16} className="text-[#1E293B]" /> Leave Balance
              </h2>
              <ChevronRight size={16} className="text-[#8f9192] cursor-pointer hover:text-[#1E293B]" />
            </div>
            <div className="flex justify-between divide-x divide-[#d6d9df]">
              <div className="flex-1 text-center px-2">
                <p className="text-xl font-black text-slate-800">6</p>
                <p className="text-[10px] font-bold text-[#8f9192] uppercase mt-1">Casual</p>
              </div>
              <div className="flex-1 text-center px-2">
                <p className="text-xl font-black text-slate-800">4</p>
                <p className="text-[10px] font-bold text-[#8f9192] uppercase mt-1">Sick</p>
              </div>
              <div className="flex-1 text-center px-2">
                <p className="text-xl font-black text-slate-800">2</p>
                <p className="text-[10px] font-bold text-[#8f9192] uppercase mt-1">Earned</p>
              </div>
            </div>
          </div>

          {/* 5. UPCOMING DEADLINES */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-rose-600" /> Urgent Deadlines
            </h2>
            <div className="space-y-3">
              {DEADLINES_DATA.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-[#8f9192]">{item.project}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-rose-100 text-rose-700">
                    Due in {item.dueIn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 7. UPCOMING MEETINGS */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Users size={16} className="text-[#1E293B]" /> Today's Meetings
            </h2>
            <div className="space-y-3">
              {MEETINGS_DATA.map((meeting, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f3f5] border border-[#d6d9df] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-[#1E293B]">{meeting.time.split(" ")[0]}</span>
                    <span className="text-[8px] font-bold text-[#8f9192] uppercase">{meeting.time.split(" ")[1]}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{meeting.name}</p>
                    <p className="text-[10px] text-[#8f9192]">Organizer: {meeting.organizer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. RECENT ANNOUNCEMENTS */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Megaphone size={16} className="text-[#1E293B]" /> Announcements
            </h2>
            <div className="space-y-4">
              {ANNOUNCEMENTS_DATA.map((announcement, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-snug">{announcement.title}</p>
                    <p className="text-[10px] text-[#8f9192] mt-0.5">{announcement.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-[10px] font-bold text-[#1E293B] mt-4 flex items-center gap-1 hover:underline">
              View All Announcements <ArrowRight size={10} />
            </button>
          </div>

          {/* 12. NOTIFICATIONS WIDGET */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Bell size={16} className="text-[#1E293B]" /> Recent Activity
            </h2>
            <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#f0f3f5]">
              {NOTIFICATIONS_DATA.map((notif, idx) => (
                <div key={idx} className="flex gap-3 relative">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    notif.unread ? "bg-[#3B82F6] border-2 border-white shadow-sm" : "bg-[#d6d9df] border-2 border-white"
                  }`}></div>
                  <div>
                    <p className={`text-xs ${notif.unread ? 'font-bold text-slate-800' : 'font-medium text-[#8f9192]'}`}>
                      {notif.text}
                    </p>
                    <p className="text-[9px] text-[#bdc2c7] mt-0.5">{notif.time}</p>
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