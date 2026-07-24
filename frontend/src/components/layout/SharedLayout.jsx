import React, { useContext, useState } from "react";
import Navbar from "./Navbar";
import { AuthContext } from "../../context/AuthContext";
import DashSidebar from "../dashboards/DashSidebar";

export default function SharedLayout({ children }) {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-[#f0f3f5] overflow-hidden">
      
      {/* Navbar - Controls the mobile menu */}
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Main Container below Navbar */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar */}
        <DashSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* Scrollable Page Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}
