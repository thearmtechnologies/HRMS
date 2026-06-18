import React, { useContext } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Avatar } from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin-dashboard";
    if (user?.role === "hr") return "/hr-dashboard";
    return "/employee-dashboard";
  };

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

        <div className="w-px h-6 bg-[#1246ad] hidden sm:block"></div>

        <div className="flex md:order-2">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=3B82F6&color=fff`}
                rounded
              />
            }
          >
            <DropdownHeader>
              <span className="block text-sm font-bold text-[#1E293B]">{user?.fullName || 'User'}</span>
              <span className="block truncate text-sm font-medium text-[#8f9192]">{user?.email || 'email@example.com'}</span>
            </DropdownHeader>
            <DropdownItem onClick={() => handleNavigate(getDashboardPath())}>Dashboard</DropdownItem>
            <DropdownItem onClick={() => handleNavigate('/profile')}>My Profile</DropdownItem>
            <DropdownItem onClick={() => handleNavigate('/virtual-id')}>Virtual ID</DropdownItem>
            <DropdownItem onClick={() => handleNavigate('/change-password')}>Change Password</DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={handleSignOut} className="text-red-600 font-semibold">Sign out</DropdownItem>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}
