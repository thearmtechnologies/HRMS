import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ALL_MENU_ITEMS, getDashboardPath } from "../../config/sidebarConfig";

export default function DashSidebar({ isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const [tab, setTab] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) return tabFromUrl;
    
    const matchingItem = ALL_MENU_ITEMS.find(item => item.path === location.pathname);
    if (matchingItem) return matchingItem.id;
    
    return "dashboard";
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      const matchingItem = ALL_MENU_ITEMS.find(item => item.path === location.pathname);
      if (matchingItem) {
        setTab(matchingItem.id);
      } else if (
        location.pathname === '/admin-dashboard' || 
        location.pathname === '/hr-dashboard' || 
        location.pathname === '/employee-dashboard' ||
        location.pathname === '/'
      ) {
        setTab("dashboard");
      }
    }
  }, [location.search, location.pathname]);

  if (!user) return null;

  const role = user.role;
  const MENU_ITEMS = ALL_MENU_ITEMS.filter(item => {
    if (item.hideForRoles && item.hideForRoles.includes(role)) return false;
    if (!item.permissionModule) return true;
    const perm = user.permissions?.find(p => p.module === item.permissionModule);
    return perm && perm.view === true;
  });
  const dashboardPath = getDashboardPath(role);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-[#3B82F6]/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Placeholder to prevent layout shift */}
      <div className="hidden md:block w-20 shrink-0 bg-[#fdfdfe]" aria-hidden="true"></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 bottom-0 left-0 z-40 bg-[#fdfdfe] border-r border-[#d6d9df] flex flex-col group
          w-64 ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:w-20 hover:w-64 hover:shadow-[4px_0_24px_rgba(0,0,0,0.1)] md:translate-x-0 overflow-x-hidden
          ${isMounted ? 'transition-all duration-300 ease-in-out' : ''}
        `}
      >
        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-2 scrollbar-hide">
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
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-sm font-medium transition-colors relative overflow-hidden ${
                  isActive
                    ? "bg-[#DBEAFE]/50 text-[#1E293B]"
                    : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#1E293B]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#3B82F6] rounded-r-md"></div>
                )}

                <div className="flex items-center justify-center shrink-0 w-8">
                  <Icon
                    size={22}
                    className={`${
                      isActive ? "text-[#3B82F6]" : "text-[#94A3B8]"
                    } transition-colors`}
                  />
                </div>

                <span className={`whitespace-nowrap opacity-100 md:opacity-0 group-hover:opacity-100 ${isMounted ? 'transition-opacity duration-300 delay-75' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
