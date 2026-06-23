import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import DashSidebar from "../../components/dashboards/DashSidebar";
import EmployeeAttendance from "./EmployeeAttendance";
import EmployeeProject from "./EmployeeProject";
import DashboardOverview from "./DashboardOverview";
import EmployeeLeaveManagement from "./LeaveManagement";
import EmployeePayslips from "./EmployeePayslips";

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
            {tab === "attendance" && <EmployeeAttendance />}
            {tab === "projects" && <EmployeeProject />}
            {tab === "dashboard" && <DashboardOverview />}
            {tab === "my-leaves" && <EmployeeLeaveManagement />}
            {tab === "payroll" && <EmployeePayslips />}
          {/* 
          {tab === "employees" && <EmployeeManagement />} */}
        </div>

      </div>
      
    </div>
  );
}