import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../../components/dashboards/AdminSidebar";
import AdminProfile from "./AdminProfile";
import AdminNavbar from "../../components/layout/AdminNavbar";
import DashboardOverview from "./DashboardOverview ";
import Department from "./Department";
import ProjectManagement from "./ProjectManagement";
import EmployeeManagement from "./EmployeeManagement";

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
    <div className="flex h-screen w-full bg-[#f0f3f5] overflow-hidden">
      
      {/* 1. Sidebar - Now receives state via props */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Navbar - Controls the mobile menu */}
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* 3. Scrollable Page Content Area */}
        <div className="flex-1 overflow-y-auto">
          {tab === "profile" && <AdminProfile />}
          {tab === "dashboard" && <DashboardOverview />}
          {tab === "departments" && <Department />}
          {tab === "projects" && <ProjectManagement />}
          {tab === "employees" && <EmployeeManagement />}
        </div>

      </div>
      
    </div>
  );
}