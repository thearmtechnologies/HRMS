import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  FolderKanban,
  Clock,
  Wallet,
  CalendarCheck,
  Plus,
  MoreVertical,
  LogOut
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function DashboardOverview() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState([
    { title: "Total Employees", value: "0", icon: Users, trend: "Loading..." },
    { title: "Present Today", value: "0", icon: ShieldCheck, trend: "Loading..." },
    { title: "Pending Leaves", value: "0", icon: Clock, trend: "Loading..." },
    { title: "Active Projects", value: "0", icon: FolderKanban, trend: "Loading..." },
  ]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [empRes, attRes, projRes, leaveRes] = await Promise.all([
        fetch('http://localhost:5000/api/employee', { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/attendance/all/daily?date=${today}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/leave/all', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const employees = empRes.ok ? await empRes.json() : [];
      const attendance = attRes.ok ? await attRes.json() : [];
      const projects = projRes.ok ? await projRes.json() : [];
      const leaves = leaveRes.ok ? await leaveRes.json() : [];

      const totalEmp = Array.isArray(employees) ? employees.length : 0;
      const presentToday = Array.isArray(attendance) ? attendance.filter(a => a.status === 'Present').length : 0;
      
      const projArray = Array.isArray(projects) ? projects : (projects.projects || []);
      const activeProj = projArray.filter(p => p.status === 'In Progress' || p.status === 'Planning' || p.status === 'On Hold').length;
      
      const leaveArray = Array.isArray(leaves) ? leaves : [];
      const pendingLeaves = leaveArray.filter(l => l.status === 'Pending').length;

      setStats([
        { title: "Total Employees", value: totalEmp.toString(), icon: Users, trend: "Active workers" },
        { title: "Present Today", value: presentToday.toString(), icon: ShieldCheck, trend: `${totalEmp > 0 ? Math.round((presentToday/totalEmp)*100) : 0}% attendance` },
        { title: "Pending Leaves", value: pendingLeaves.toString(), icon: Clock, trend: "Requires action" },
        { title: "Active Projects", value: activeProj.toString(), icon: FolderKanban, trend: "In progress" },
      ]);

      // Get 5 most recent leaves
      const sortedLeaves = leaveArray
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setRecentLeaves(sortedLeaves);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in">
      {/* Page Greeting & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">
            Dashboard Overview
          </h1>
          <p className="text-[#8f9192] text-sm mt-1">
            Good morning! Here's what's happening today.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin-dashboard?tab=employees')}
          className="flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-opacity-90 text-[#fdfdfe] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-[#3B82F6]/20"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] p-5 shadow-sm flex items-center gap-4 hover:border-[#bdc2c7] transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-[#f0f3f5] flex items-center justify-center text-[#1E293B]">
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-[#8f9192] font-medium">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-[#1E293B]">
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
            <h2 className="text-lg font-bold text-[#1E293B]">
              Recent Leave Requests
            </h2>
            <button 
              onClick={() => navigate('/admin-dashboard?tab=leave-requests')}
              className="text-sm text-[#8f9192] hover:text-[#1E293B] font-medium transition-colors"
            >
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
                  <th className="px-5 py-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#d6d9df]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-[#8f9192]">Loading...</td>
                  </tr>
                ) : recentLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-[#8f9192]">No recent leave requests.</td>
                  </tr>
                ) : (
                  recentLeaves.map((leave) => (
                    <tr
                      key={leave._id}
                      className="hover:bg-[#f0f3f5]/50 transition-colors cursor-pointer"
                      onClick={() => navigate('/admin-dashboard?tab=leave-requests')}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#bdc2c7] text-[#fdfdfe] flex items-center justify-center font-bold text-xs">
                            {leave.employee?.firstName?.charAt(0) || "E"}
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B]">
                              {leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : "Unknown"}
                            </p>
                            <p className="text-xs text-[#8f9192]">
                              {leave.employee?.designation || "Employee"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#8f9192] font-medium">
                        {leave.leaveType}
                      </td>
                      <td className="px-5 py-4 text-[#8f9192]">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                          ${
                            leave.status === "Approved"
                              ? "bg-[#3B82F6]/10 text-[#1E293B]"
                              : leave.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions & Alerts */}
        <div className="space-y-6 lg:space-y-8">
          {/* Quick Actions */}
          <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-lg font-bold text-[#1E293B] mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin-dashboard?tab=payroll')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#d6d9df] hover:border-[#3B82F6] hover:bg-[#f0f3f5] text-left transition-all group"
              >
                <div className="p-2 bg-[#f0f3f5] group-hover:bg-[#fdfdfe] rounded-md text-[#1E293B] transition-colors">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">
                    Process Payroll
                  </p>
                  <p className="text-xs text-[#8f9192]">
                    Run monthly payroll batch
                  </p>
                </div>
              </button>
              <button 
                onClick={() => navigate('/admin-dashboard?tab=team-attendance')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#d6d9df] hover:border-[#3B82F6] hover:bg-[#f0f3f5] text-left transition-all group"
              >
                <div className="p-2 bg-[#f0f3f5] group-hover:bg-[#fdfdfe] rounded-md text-[#1E293B] transition-colors">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">
                    Manage Attendance
                  </p>
                  <p className="text-xs text-[#8f9192]">
                    Review and regularize records
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-[#3B82F6] rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-8 -translate-y-8"></div>
            <h2 className="text-lg font-bold text-[#fdfdfe] mb-2 relative z-10">
              System Dashboard
            </h2>
            <p className="text-sm text-[#d6d9df] mb-4 relative z-10 leading-relaxed">
              All systems are running normally. Make sure to review any pending leave requests and approve timesheets.
            </p>
            <button 
              onClick={() => navigate('/admin-dashboard?tab=settings')}
              className="text-xs font-bold text-[#1E293B] bg-[#fdfdfe] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors relative z-10 shadow-md"
            >
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
