import React, { useContext, useState } from "react";
import Navbar from "./Navbar";
import { AuthContext } from "../../context/AuthContext";
import DashSidebar from "../dashboards/DashSidebar";

export default function SharedLayout({ children }) {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#f0f3f5] overflow-hidden">
      <DashSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
