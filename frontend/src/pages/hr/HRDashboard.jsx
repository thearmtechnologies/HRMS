import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import DashSidebar from "../../components/dashboards/DashSidebar";
import DashboardOverview from "./DashboardOverview";
import EmployeeAttendance from "../employee/EmployeeAttendance";
import AttendanceManagement from "./AttendanceManagement";
import EmployeeManagement from "../shared/EmployeeManagement";
import ApprovalDashboard from "./ApprovalDashboard";
import HRLeaveManagement from "./LeaveManagement";
import PayrollManagement from "../finance/PayrollManagement";
import HolidayManagement from "../shared/HolidayManagement";
import TabPermissionGuard from "../../components/TabPermissionGuard";

export default function HRDashboard() {
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
    <div className="flex h-screen w-full bg-[#f0f3f5] overflow-hidden">
      
      {/* 1. Sidebar - Now receives state via props */}
      <DashSidebar  
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Navbar - Controls the mobile menu */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* 3. Scrollable Page Content Area */}
        <div className="flex-1 overflow-y-auto">
          {tab === "dashboard" && <DashboardOverview />}
          {tab === "attendance" && <EmployeeAttendance />}
          {tab === "team-attendance" && <TabPermissionGuard moduleName="attendance"><AttendanceManagement /></TabPermissionGuard>}
          {tab === "employees" && <TabPermissionGuard moduleName="employee_management"><EmployeeManagement /></TabPermissionGuard>}
          {tab === "approvals" && <ApprovalDashboard />}
          {tab === "leave-requests" && <TabPermissionGuard moduleName="leave_management"><HRLeaveManagement /></TabPermissionGuard>}
          {tab === "payroll" && <TabPermissionGuard moduleName="payroll"><PayrollManagement /></TabPermissionGuard>}
          {tab === "holidays" && <TabPermissionGuard moduleName="holiday_management"><HolidayManagement /></TabPermissionGuard>}
        </div>

      </div>
      
    </div>
  );
}
