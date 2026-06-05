import {
  Bell,
  Building2,
  CalendarCheck,
  ChevronDown,
  Clock,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreVertical,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import React, { useState } from "react";

export default function Dashboard({ onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
const RECENT_LEAVES = [
  { id: 1, name: 'Sarah Jenkins', role: 'Software Engineer', type: 'Sick Leave', date: 'Oct 24 - Oct 25', status: 'Pending' },
  { id: 2, name: 'Michael Chen', role: 'Product Manager', type: 'Annual Leave', date: 'Oct 28 - Nov 05', status: 'Approved' },
  { id: 3, name: 'Emma Watson', role: 'UI/UX Designer', type: 'Personal', date: 'Oct 22 - Oct 22', status: 'Rejected' },
  { id: 4, name: 'James Smith', role: 'DevOps Engineer', type: 'Annual Leave', date: 'Nov 10 - Nov 15', status: 'Approved' },
];  
  const MENU_ITEMS = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Employees", icon: Users },
    { name: "Attendance", icon: CalendarCheck },
    { name: "Leave Requests", icon: Clock },
    { name: "Payroll", icon: Wallet },
    { name: "Departments", icon: Building2 },
    { name: "Projects", icon: FolderKanban },
    { name: "Settings", icon: Settings },
  ];
  const STATS = [
    {
      title: "Total Employees",
      value: "248",
      icon: Users,
      trend: "+4 this month",
    },
    {
      title: "Present Today",
      value: "232",
      icon: ShieldCheck,
      trend: "93% attendance",
    },
    {
      title: "On Leave",
      value: "12",
      icon: Clock,
      trend: "3 pending requests",
    },
    {
      title: "Active Projects",
      value: "34",
      icon: FolderKanban,
      trend: "+2 new this week",
    },
  ];
  return (
    <div className="flex h-screen bg-[#f0f3f5] font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#3d766d]/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#fdfdfe] border-r border-[#d6d9df] flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#d6d9df]">
          <div className="p-1.5 bg-[#3d766d] rounded-lg">
            <Building2 size={24} className="text-[#fdfdfe]" />
          </div>
          <span className="text-xl font-bold text-[#3d766d]">ARM HRMS</span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveMenu(item.name);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#3d766d] text-[#fdfdfe] shadow-md shadow-[#3d766d]/10"
                    : "text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#3d766d]"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-[#d6d9df]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#3d766d] transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#fdfdfe] border-b border-[#d6d9df] flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#8f9192] hover:text-[#3d766d] hover:bg-[#f0f3f5] rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Search Bar */}
            <div className="hidden sm:flex relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#bdc2c7] group-focus-within:text-[#3d766d] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search employees, projects..."
                className="pl-10 pr-4 py-2 w-72 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#8f9192] focus:outline-none focus:bg-[#fdfdfe] focus:border-[#3d766d] focus:ring-2 focus:ring-[#3d766d]/20 transition-all placeholder:text-[#bdc2c7]"
              />
            </div>
          </div>

          {/* Header Right */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button className="relative p-2 text-[#8f9192] hover:text-[#3d766d] hover:bg-[#f0f3f5] rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#fdfdfe]"></span>
            </button>

            <div className="w-px h-6 bg-[#d6d9df] hidden sm:block"></div>

            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
              <div className="w-9 h-9 rounded-full bg-[#3d766d] flex items-center justify-center text-[#fdfdfe] font-bold shadow-sm">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-[#3d766d] leading-none mb-1">
                  Admin User
                </p>
                <p className="text-xs text-[#8f9192] leading-none">
                  HR Manager
                </p>
              </div>
              <ChevronDown
                size={16}
                className="text-[#8f9192] hidden sm:block"
              />
            </button>
          </div>
        </header>

        {/* Dashboard Content Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Page Greeting & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#3d766d]">
                Dashboard Overview
              </h1>
              <p className="text-[#8f9192] text-sm mt-1">
                Good morning! Here's what's happening today.
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-[#3d766d] hover:bg-opacity-90 text-[#fdfdfe] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-[#3d766d]/20">
              <Plus size={18} />
              Add Employee
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] p-5 shadow-sm flex items-center gap-4 hover:border-[#bdc2c7] transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#f0f3f5] flex items-center justify-center text-[#3d766d]">
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-[#8f9192] font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-[#3d766d]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#bdc2c7] mt-1">{stat.trend}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout for Main Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Leave Requests Table */}
            <div className="lg:col-span-2 bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-[#d6d9df] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#3d766d]">
                  Recent Leave Requests
                </h2>
                <button className="text-sm text-[#8f9192] hover:text-[#3d766d] font-medium transition-colors">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f0f3f5] text-[#8f9192] text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 font-semibold">Employee</th>
                      <th className="px-5 py-3 font-semibold">Leave Type</th>
                      <th className="px-5 py-3 font-semibold">Duration</th>
                      <th className="px-5 py-3 font-semibold text-center">
                        Status
                      </th>
                      <th className="px-5 py-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[#d6d9df]">
                    {RECENT_LEAVES.map((leave) => (
                      <tr
                        key={leave.id}
                        className="hover:bg-[#f0f3f5]/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#bdc2c7] text-[#fdfdfe] flex items-center justify-center font-bold text-xs">
                              {leave.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#3d766d]">
                                {leave.name}
                              </p>
                              <p className="text-xs text-[#8f9192]">
                                {leave.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#8f9192] font-medium">
                          {leave.type}
                        </td>
                        <td className="px-5 py-4 text-[#8f9192]">
                          {leave.date}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                            ${
                              leave.status === "Approved"
                                ? "bg-[#3d766d]/10 text-[#3d766d]"
                                : leave.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button className="text-[#bdc2c7] hover:text-[#3d766d] transition-colors p-1 rounded-md hover:bg-[#f0f3f5]">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Quick Actions & Alerts */}
            <div className="space-y-6 lg:space-y-8">
              {/* Quick Actions */}
              <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm p-5">
                <h2 className="text-lg font-bold text-[#3d766d] mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#d6d9df] hover:border-[#3d766d] hover:bg-[#f0f3f5] text-left transition-all group">
                    <div className="p-2 bg-[#f0f3f5] group-hover:bg-[#fdfdfe] rounded-md text-[#3d766d] transition-colors">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3d766d]">
                        Process Payroll
                      </p>
                      <p className="text-xs text-[#8f9192]">
                        Run monthly payroll batch
                      </p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#d6d9df] hover:border-[#3d766d] hover:bg-[#f0f3f5] text-left transition-all group">
                    <div className="p-2 bg-[#f0f3f5] group-hover:bg-[#fdfdfe] rounded-md text-[#3d766d] transition-colors">
                      <CalendarCheck size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3d766d]">
                        Approve Timesheets
                      </p>
                      <p className="text-xs text-[#8f9192]">
                        14 pending approvals
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* System Alerts */}
              <div className="bg-[#3d766d] rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-8 -translate-y-8"></div>
                <h2 className="text-lg font-bold text-[#fdfdfe] mb-2 relative z-10">
                  System Update
                </h2>
                <p className="text-sm text-[#d6d9df] mb-4 relative z-10 leading-relaxed">
                  The finance module will undergo scheduled maintenance tonight
                  at 11:00 PM EST.
                </p>
                <button className="text-xs font-bold text-[#3d766d] bg-[#fdfdfe] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors relative z-10 shadow-md">
                  Read More
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
