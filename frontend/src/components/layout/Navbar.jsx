import React, { useContext, useState, useEffect, useRef } from "react";
import { Search, Menu, LayoutDashboard, User, IdCard, KeyRound, LogOut, ChevronDown } from "lucide-react";
import { Avatar } from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import NotificationBell from "./NotificationBell";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin-dashboard";
    if (user?.role === "hr") return "/hr-dashboard";
    return "/employee-dashboard";
  };

  const profileImgUrl = user?.profileImage || user?.url || user?.avatar || null;

  return (
    <nav className="shrink-0 h-16 bg-[#fdfdfe] border-b border-[#e2e8f0] flex items-center justify-between px-4 sm:px-6 lg:px-8 z-50 relative">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-[#718096] hover:text-[#2d3748] hover:bg-[#f0f3f5] rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar - Now visible on mobile with a smaller width */}
        <div className="flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#a0aec0] group-focus-within:text-[#1e40af] transition-colors" />
          </div>
          <input
            id="globalSearch"
            name="globalSearch"
            aria-label="Global Search"
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 w-40 sm:w-72 bg-[#f7fafc] border border-transparent rounded-lg text-sm text-[#4a5568] focus:outline-none focus:bg-[#fdfdfe] focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/20 transition-all placeholder:text-[#a0aec0]"
          />
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-3 sm:gap-5">
        <NotificationBell />

        <div className="w-px h-6 bg-[#e2e8f0] hidden sm:block"></div>

        {/* Custom High-Contrast Profile Dropdown */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#1e40af]/30 focus:outline-none transition-all duration-200"
            aria-label="User profile menu"
            aria-expanded={dropdownOpen}
          >
            {profileImgUrl ? (
              <img
                src={profileImgUrl}
                alt={user?.fullName || "Employee Profile"}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#e2e8f0] shadow-sm bg-gray-100"
              />
            ) : (
              <Avatar
                alt={user?.fullName || "User settings"}
                img={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=1e40af&color=fff`}
                rounded
              />
            )}
            <ChevronDown className={`w-4 h-4 text-[#718096] hidden sm:block transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#fdfdfe] text-[#2d3748] rounded-xl shadow-lg border border-[#e2e8f0] py-2 z-[100] transition-all animate-in fade-in zoom-in-95 duration-150">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f7fafc]/50">
                <span className="block text-sm font-bold text-[#2d3748] tracking-wide truncate">{user?.fullName || 'User'}</span>
                <span className="block text-xs font-medium text-[#718096] truncate mt-0.5">{user?.email || 'email@example.com'}</span>
                {user?.role && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] text-[10px] font-bold uppercase rounded tracking-wider">
                    {user.role.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleNavigate(getDashboardPath())}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#4a5568] hover:bg-[#f0f3f5] hover:text-[#1e40af] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#718096] group-hover:text-[#1e40af] shrink-0 transition-colors" />
                  <span>Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('/profile')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#4a5568] hover:bg-[#f0f3f5] hover:text-[#1e40af] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <User className="w-4 h-4 text-[#718096] group-hover:text-[#1e40af] shrink-0 transition-colors" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('/virtual-id')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#4a5568] hover:bg-[#f0f3f5] hover:text-[#1e40af] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <IdCard className="w-4 h-4 text-[#718096] group-hover:text-[#1e40af] shrink-0 transition-colors" />
                  <span>Virtual ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('/forgot-password')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#4a5568] hover:bg-[#f0f3f5] hover:text-[#1e40af] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <KeyRound className="w-4 h-4 text-[#718096] group-hover:text-[#1e40af] shrink-0 transition-colors" />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Logout Section */}
              <div className="border-t border-[#e2e8f0] pt-1 mt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#e53e3e] hover:bg-[#fff5f5] flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <LogOut className="w-4 h-4 text-[#fc8181] group-hover:text-[#e53e3e] shrink-0 transition-colors" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}