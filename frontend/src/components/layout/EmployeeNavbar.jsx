import { Bell, ChevronDown, Search, Menu } from "lucide-react";
import React from "react";

export default function EmployeeNavbar({ onMenuClick }) {
  return (
    <nav className="shrink-0 h-16 bg-[#fdfdfe] border-b border-[#d6d9df] flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar - Now visible on mobile with a smaller width */}
        <div className="flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#bdc2c7] group-focus-within:text-[#1E293B] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 w-40 sm:w-72 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#8f9192] focus:outline-none focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all placeholder:text-[#bdc2c7]"
          />
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative p-2 text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#fdfdfe]"></span>
        </button>

        <div className="w-px h-6 bg-[#d6d9df] hidden sm:block"></div>

        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
          <div className="w-9 h-9 rounded-full bg-[#3B82F6] flex items-center justify-center text-[#fdfdfe] font-bold shadow-sm">
            E
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-[#1E293B] leading-none mb-1">
              Employee User
            </p>
            <p className="text-xs text-[#8f9192] leading-none">HR Manager</p>
          </div>
          <ChevronDown size={16} className="text-[#8f9192] hidden sm:block" />
        </button>
      </div>
    </nav>
  );
}
