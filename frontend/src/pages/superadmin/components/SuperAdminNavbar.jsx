import React from 'react';
import { User } from 'lucide-react';

export default function SuperAdminNavbar() {
  const superAdmin = JSON.parse(localStorage.getItem('superAdminUser') || '{}');

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm fixed top-0 right-0 left-64 z-20">
      <div>
        <h2 className="text-lg font-bold text-[#1E293B]">Overview & Management</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-[#1E293B]">{superAdmin.firstName} {superAdmin.lastName}</p>
          <p className="text-[10px] text-[#4F46E5] font-bold uppercase tracking-wider">Super Administrator</p>
        </div>
        <div className="h-10 w-10 bg-[#EEF2F6] text-[#4F46E5] rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
          <User size={20} />
        </div>
      </div>
    </header>
  );
}
