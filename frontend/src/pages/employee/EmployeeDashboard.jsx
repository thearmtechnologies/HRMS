import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import DashSidebar from "../../components/dashboards/DashSidebar";
import EmployeeAttendance from "./EmployeeAttendance";
import EmployeeProject from "./EmployeeProject";
import ProjectDetail from "./ProjectDetail";
import DashboardOverview from "./DashboardOverview";
import EmployeeLeaveManagement from "./MyLeaves";
import EmployeePayslips from "./EmployeePayslips";
import HolidayManagement from "../shared/HolidayManagement";
import Announcements from "./Announcements";

export default function EmployeeDashboard() {
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
            {tab === "attendance" && <EmployeeAttendance />}
            {tab === "projects" && <EmployeeProject />}
            {tab === "project-detail" && <ProjectDetail />}
            {tab === "dashboard" && <DashboardOverview />}
            {tab === "my-leaves" && <EmployeeLeaveManagement />}
            {tab === "payroll" && <EmployeePayslips />}
            {tab === "holidays" && <HolidayManagement />}
            {tab === "announcements" && <Announcements />}
          {/* 
          {tab === "employees" && <EmployeeManagement />} */}
        </div>

      </div>
      
    </div>
  );
}