import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Building2, LayoutDashboard, LogOut } from 'lucide-react';

export default function SuperAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      path: '/super-admin/dashboard'
    }
  ];

  return (
    <aside className="w-64 bg-[#1E293B] text-white flex flex-col justify-between h-screen fixed top-0 left-0 z-30 shadow-xl border-r border-[#334155]">
      {/* Brand logo header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#334155] bg-[#0F172A]">
          <div className="bg-[#4F46E5] text-white p-2 rounded-lg">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ARM HRMS</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Super Console</p>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/20'
                    : 'text-gray-400 hover:bg-[#334155] hover:text-white'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#334155] bg-[#0F172A]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all border border-transparent hover:border-red-900/50"
        >
          <LogOut size={18} />
          Logout Console
        </button>
      </div>
    </aside>
  );
}
