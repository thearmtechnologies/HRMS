import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../../components/dashboards/DashSidebar";
import Navbar from "../../components/layout/Navbar";
import DashboardOverview from "./DashboardOverview ";
import Department from "./Department";
import ProjectManagement from "./ProjectManagement";
import ProjectDetail from "../employee/ProjectDetail";
import AttendanceManagement from "../hr/AttendanceManagement";
import EmployeeManagement from "../shared/EmployeeManagement";
import HRLeaveManagement from "../hr/LeaveRequests";
import PayrollManagement from "../finance/PayrollManagement";
import HolidayManagement from "../shared/HolidayManagement";
import TabPermissionGuard from "../../components/TabPermissionGuard";

import Settings from "./Settings";
import AnnouncementManagement from "./AnnouncementManagement";

export default function AdminDashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile menu state

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#f0f3f5] overflow-hidden">
      
      {/* Navbar - Controls the mobile menu */}
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Main Container below Navbar */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 1. Sidebar - Now receives state via props */}
        <DashSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* 2. Scrollable Page Content Area */}
        <div className="flex-1 overflow-y-auto">
          {tab === "dashboard" && <DashboardOverview />}
          {tab === "departments" && <TabPermissionGuard moduleName="departments"><Department /></TabPermissionGuard>}
          {tab === "projects" && <TabPermissionGuard moduleName="projects"><ProjectManagement /></TabPermissionGuard>}
          {tab === "project-detail" && <TabPermissionGuard moduleName="projects"><ProjectDetail /></TabPermissionGuard>}
          {tab === "team-attendance" && <TabPermissionGuard moduleName="team_attendance"><AttendanceManagement /></TabPermissionGuard>}
          {tab === "employees" && <TabPermissionGuard moduleName="employee_management"><EmployeeManagement /></TabPermissionGuard>}
          {tab === "leave-requests" && <TabPermissionGuard moduleName="leave_management"><HRLeaveManagement /></TabPermissionGuard>}
          {tab === "payroll" && <TabPermissionGuard moduleName="payroll"><PayrollManagement /></TabPermissionGuard>}
          {tab === "holidays" && <TabPermissionGuard moduleName="holiday_management"><HolidayManagement /></TabPermissionGuard>}
          {tab === "settings" && <TabPermissionGuard moduleName="settings"><Settings /></TabPermissionGuard>}
          {tab === "announcements" && <TabPermissionGuard moduleName="announcements"><AnnouncementManagement /></TabPermissionGuard>}
        </div>

      </div>
      
    </div>
  );
}