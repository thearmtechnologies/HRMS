import { Building2, LogOut } from "lucide-react";
import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ALL_MENU_ITEMS, getDashboardPath } from "../../config/sidebarConfig";

export default function DashSidebar({ isOpen, onClose }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else if (location.pathname === "/virtual-id") {
      setTab("virtual-id");
    }
  }, [location.search, location.pathname]);

  if (!user) return null;

  const role = user.role;
  const MENU_ITEMS = ALL_MENU_ITEMS.filter(item => item.roles.includes(role));
  const dashboardPath = getDashboardPath(role);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#3B82F6]/20 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#fdfdfe] border-r border-[#d6d9df] flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#d6d9df]">
          <div className="p-1.5 bg-[#3B82F6] rounded-lg">
            <Building2 size={24} className="text-[#fdfdfe]" />
          </div>
          <span className="text-xl font-bold text-[#1E293B]">ARM HRMS</span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.path 
                ? location.pathname === item.path
                : tab === item.id;

            return (
              <Link
                key={item.name}
                to={item.path || `${dashboardPath}?tab=${item.id}`}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-sm font-medium transition-all relative ${
                  isActive
                    ? "bg-[#DBEAFE]/50 text-[#1E293B]"
                    : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#1E293B]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#3B82F6] rounded-r-md"></div>
                )}

                <Icon
                  size={20}
                  className={`${
                    isActive ? "text-[#1E293B]" : "text-[#94A3B8]"
                  }`}
                />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-[#d6d9df]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#1E293B] transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
