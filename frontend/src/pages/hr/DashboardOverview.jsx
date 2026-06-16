import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, User, Plus, CheckSquare, Clock, CalendarPlus, 
  FileSpreadsheet, Megaphone, Users, UserCheck, UserX, Clock4, 
  CalendarOff, AlertCircle, Briefcase, ChevronRight, Cake, 
  Award, TrendingUp, Calendar, AlertTriangle, FileText
} from 'lucide-react';

// --- Reusable UI Components ---
const Card = ({ title, action, children, className = "" }) => (
  <div className={`bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden ${className}`}>
    {title && (
      <div className="px-5 py-4 border-b border-[#d6d9df] flex items-center justify-between bg-[#fdfdfe]">
        <h2 className="text-base font-bold text-[#1E293B]">{title}</h2>
        {action && <button className="text-xs font-semibold text-[#8f9192] hover:text-[#1E293B] transition-colors">{action}</button>}
      </div>
    )}
    <div className="p-5 flex-1">{children}</div>
  </div>
);

const StatCard = ({ title, value, subtitle, icon: Icon, trend }) => (
  <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] p-4 flex items-start justify-between shadow-sm hover:border-[#bdc2c7] transition-colors">
    <div>
      <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#1E293B]">{value}</p>
      {subtitle && <p className="text-xs text-[#bdc2c7] mt-1">{subtitle}</p>}
    </div>
    <div className={`p-2.5 rounded-lg ${trend === 'down' ? 'bg-red-50 text-red-500' : 'bg-[#f0f3f5] text-[#1E293B]'}`}>
      <Icon size={20} />
    </div>
  </div>
);

export default function DashboardOverview() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 2. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Welcome back, HR! 👋</h1>
          <p className="text-[#8f9192] mt-1">Here is what's happening at ARM Corp today, {formatDate(currentTime)}.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#1E293B] text-sm font-semibold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all">Generate Report</button>
        </div>
      </div>

      {/* 3. Quick Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value="452" subtitle="+12 this month" icon={Users} />
        <StatCard title="Present Today" value="415" subtitle="91.8% Attendance" icon={UserCheck} />
        <StatCard title="Absent Today" value="18" subtitle="Requires review" icon={UserX} trend="down" />
        <StatCard title="Late Arrivals" value="12" subtitle="Avg 15m late" icon={Clock4} trend="down" />
        <StatCard title="On Leave" value="7" subtitle="Approved leaves" icon={CalendarOff} />
        <StatCard title="Pending Leaves" value="14" subtitle="Needs action" icon={AlertCircle} trend="down" />
        <StatCard title="New Joinees" value="5" subtitle="Joining this week" icon={Plus} />
        <StatCard title="Open Positions" value="8" subtitle="Active hiring" icon={Briefcase} />
      </div>

      {/* 4. Quick Action Buttons */}
      <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] p-2 flex overflow-x-auto shadow-sm hide-scrollbar">
        <div className="flex gap-2 min-w-max w-full justify-between">
          {[
            { label: 'Add Employee', icon: Plus },
            { label: 'Approve Leaves', icon: CheckSquare },
            { label: 'Mark Attendance', icon: Clock },
            { label: 'Add Holiday', icon: CalendarPlus },
            { label: 'Process Payroll', icon: FileSpreadsheet },
            { label: 'Announcement', icon: Megaphone }
          ].map((action, i) => (
            <button key={i} className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#f0f3f5] text-[#8f9192] hover:text-[#1E293B] transition-all group">
              <div className="p-3 bg-[#f0f3f5] group-hover:bg-[#3B82F6] group-hover:text-[#fdfdfe] rounded-full transition-colors">
                <action.icon size={18} />
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. Attendance Overview Chart (Left) */}
        <Card title="Today's Attendance Overview">
          <div className="flex flex-col items-center justify-center h-full pb-4">
            {/* CSS Donut Chart Mockup */}
            <div className="relative w-40 h-40 rounded-full bg-[#f0f3f5] flex items-center justify-center overflow-hidden mb-6" style={{ background: 'conic-gradient(#3B82F6 0% 85%, #d6d9df 85% 95%, #ef4444 95% 100%)' }}>
              <div className="absolute w-32 h-32 bg-[#fdfdfe] rounded-full flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#1E293B]">91%</span>
                <span className="text-xs text-[#8f9192]">Present</span>
              </div>
            </div>
            <div className="w-full flex justify-between px-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#3B82F6]"></div> Present (415)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#d6d9df]"></div> Leave (7)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500"></div> Absent (18)</div>
            </div>
          </div>
        </Card>

        {/* 6. Monthly Attendance Trend & 7. Dept Distribution (Middle & Right) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Attendance Trend (Last 7 Days)">
            <div className="flex items-end gap-2 h-48 pt-4">
              {[88, 92, 95, 91, 89, 94, 98].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-[#f0f3f5] rounded-t-sm h-full flex items-end">
                    <div className="w-full bg-[#3B82F6] rounded-t-sm transition-all hover:opacity-80" style={{ height: `${val}%` }}></div>
                  </div>
                  <span className="text-[10px] text-[#bdc2c7]">Day {i+1}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Department Distribution">
            <div className="space-y-4 pt-2">
              {[
                { name: 'Engineering', count: 145, pct: 60 },
                { name: 'Sales & Marketing', count: 85, pct: 40 },
                { name: 'Operations', count: 62, pct: 30 },
                { name: 'HR & Finance', count: 28, pct: 15 }
              ].map((dept, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#8f9192]">{dept.name}</span>
                    <span className="text-[#bdc2c7]">{dept.count} Emp</span>
                  </div>
                  <div className="w-full h-2 bg-[#f0f3f5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B82F6]" style={{ width: `${dept.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 9. Late Comers Table */}
        <Card title="Late Arrivals Today" action="View All">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#bdc2c7] border-b border-[#d6d9df]">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Check-In</th>
                  <th className="pb-3 font-medium text-right">Late By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3f5]">
                {[
                  { name: 'Marcus Doe', dept: 'Engineering', time: '09:45 AM', late: '45 mins' },
                  { name: 'Alice Smith', dept: 'Sales', time: '09:20 AM', late: '20 mins' },
                  { name: 'John Taylor', dept: 'Design', time: '09:15 AM', late: '15 mins' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#f0f3f5]/50">
                    <td className="py-3 font-semibold text-[#1E293B]">{row.name}</td>
                    <td className="py-3">{row.dept}</td>
                    <td className="py-3">{row.time}</td>
                    <td className="py-3 text-right text-red-500 font-medium">{row.late}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 11. Pending Leave Requests */}
        <Card title="Pending Leave Requests" action="Manage All">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#bdc2c7] border-b border-[#d6d9df]">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Date Range</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3f5]">
                {[
                  { name: 'Emma Wilson', type: 'Sick Leave', date: 'Oct 24 - 25' },
                  { name: 'Liam Brown', type: 'Annual', date: 'Nov 01 - 05' },
                  { name: 'Sophia Lee', type: 'Casual', date: 'Oct 28 (Half)' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#f0f3f5]/50">
                    <td className="py-3 font-semibold text-[#1E293B]">{row.name}</td>
                    <td className="py-3">{row.type}</td>
                    <td className="py-3 text-xs">{row.date}</td>
                    <td className="py-3 text-right space-x-2">
                      <button className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold hover:bg-green-100">Approve</button>
                      <button className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Dense Widgets Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 12. New Joinees */}
        <Card title="New Joinees This Month" action="View All">
          <div className="space-y-4">
            {[
              { name: 'Olivia Martin', role: 'Frontend Dev', date: 'Oct 12, 2023', initial: 'O' },
              { name: 'Ethan Hunt', role: 'Sales Exec', date: 'Oct 15, 2023', initial: 'E' }
            ].map((person, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#bdc2c7] text-[#fdfdfe] flex items-center justify-center font-bold">{person.initial}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1E293B]">{person.name}</p>
                  <p className="text-xs text-[#8f9192]">{person.role}</p>
                </div>
                <p className="text-xs text-[#bdc2c7]">{person.date}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 13 & 14. Birthdays & Anniversaries */}
        <Card title="Celebrations" action="Send Wishes">
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-[#f0f3f5] p-3 rounded-lg">
              <div className="p-2 bg-[#fdfdfe] rounded-md text-pink-500 shadow-sm"><Cake size={18} /></div>
              <div>
                <p className="text-sm font-bold text-[#1E293B]">David Clark's Birthday</p>
                <p className="text-xs text-[#8f9192]">Today, Product Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#f0f3f5] p-3 rounded-lg">
              <div className="p-2 bg-[#fdfdfe] rounded-md text-yellow-500 shadow-sm"><Award size={18} /></div>
              <div>
                <p className="text-sm font-bold text-[#1E293B]">Sarah Jenkins</p>
                <p className="text-xs text-[#8f9192]">Tomorrow, 5th Work Anniversary</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 15. Recruitment Summary */}
        <Card title="Recruitment Pipeline">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="bg-[#f0f3f5] p-3 rounded-lg flex flex-col justify-center">
              <span className="text-2xl font-bold text-[#1E293B]">12</span>
              <span className="text-xs text-[#8f9192]">Interviews Scheduled</span>
            </div>
            <div className="bg-[#f0f3f5] p-3 rounded-lg flex flex-col justify-center">
              <span className="text-2xl font-bold text-[#1E293B]">45</span>
              <span className="text-xs text-[#8f9192]">In Pipeline</span>
            </div>
            <div className="bg-[#f0f3f5] p-3 rounded-lg flex flex-col justify-center col-span-2">
              <span className="text-lg font-bold text-[#1E293B]">3 Offers Sent</span>
              <span className="text-xs text-[#8f9192]">Awaiting candidate signatures</span>
            </div>
          </div>
        </Card>

        {/* 17. Shift Summary & 18. Payroll Summary */}
        <Card title="Operations Summary">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#8f9192] uppercase mb-2 border-b border-[#d6d9df] pb-1">Today's Shifts</p>
              <div className="flex justify-between text-sm"><span>Morning (9AM-5PM)</span><span className="font-bold text-[#1E293B]">245 Emp</span></div>
              <div className="flex justify-between text-sm"><span>Evening (2PM-10PM)</span><span className="font-bold text-[#1E293B]">150 Emp</span></div>
              <div className="flex justify-between text-sm"><span>Night (10PM-6AM)</span><span className="font-bold text-[#1E293B]">57 Emp</span></div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8f9192] uppercase mb-2 border-b border-[#d6d9df] pb-1 mt-4">Payroll Status</p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-full bg-[#d6d9df] h-2 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-[#3B82F6]"></div></div>
                <span className="font-bold text-[#1E293B]">75%</span>
              </div>
              <p className="text-xs text-[#bdc2c7] mt-1">Processed for Oct 2023. Release on 31st.</p>
            </div>
          </div>
        </Card>

        {/* 19. Document Expiry & 21. Alerts */}
        <Card title="Alerts & Expiries">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">12 Contract Expiries</p>
                <p className="text-xs opacity-80">Contracts ending in next 30 days.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[#f0f3f5] rounded-lg">
              <FileText size={18} className="shrink-0 mt-0.5 text-[#8f9192]" />
              <div>
                <p className="text-sm font-bold text-[#1E293B]">5 KYC Documents Pending</p>
                <p className="text-xs text-[#8f9192]">Aadhar/PAN updates required.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[#f0f3f5] rounded-lg">
              <Clock size={18} className="shrink-0 mt-0.5 text-[#8f9192]" />
              <div>
                <p className="text-sm font-bold text-[#1E293B]">Device Offline</p>
                <p className="text-xs text-[#8f9192]">Main Entrance biometrics unreachable.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 20. Recent Activities & 22. Announcements */}
        <Card title="Activity Feed" action="View Log">
          <div className="relative pl-4 border-l-2 border-[#d6d9df] space-y-5">
            <div className="relative">
              <div className="absolute left-[-21px] w-3 h-3 bg-[#3B82F6] rounded-full border-2 border-[#fdfdfe]"></div>
              <p className="text-sm text-[#1E293B]"><span className="font-bold">System</span> generated October Payroll drafts.</p>
              <p className="text-xs text-[#bdc2c7] mt-0.5">10 mins ago</p>
            </div>
            <div className="relative">
              <div className="absolute left-[-21px] w-3 h-3 bg-[#8f9192] rounded-full border-2 border-[#fdfdfe]"></div>
              <p className="text-sm text-[#8f9192]"><span className="font-bold">HR Dept</span> published a new Announcement: "Diwali Bonus Guidelines".</p>
              <p className="text-xs text-[#bdc2c7] mt-0.5">1 hour ago</p>
            </div>
            <div className="relative">
              <div className="absolute left-[-21px] w-3 h-3 bg-[#8f9192] rounded-full border-2 border-[#fdfdfe]"></div>
              <p className="text-sm text-[#8f9192]"><span className="font-bold">Manager Approval</span>: 4 leave requests approved by Engineering Lead.</p>
              <p className="text-xs text-[#bdc2c7] mt-0.5">2 hours ago</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 25. Footer */}
      <footer className="mt-8 py-6 text-center text-xs text-[#bdc2c7]">
        <p>© 2023 ARM HRMS Platform. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="#" className="hover:text-[#1E293B] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#1E293B] transition-colors">Support Center</a>
          <a href="#" className="hover:text-[#1E293B] transition-colors">System Status</a>
        </div>
      </footer>
    </div>
  );
}
