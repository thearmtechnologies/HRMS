import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminNavbar from './SuperAdminNavbar';

export default function SuperAdminLayout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('superAdminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Layout Area */}
      <div className="flex-grow pl-64 flex flex-col min-h-screen">
        {/* Navbar */}
        <SuperAdminNavbar />

        {/* Page Content area */}
        <main className="flex-grow pt-24 pb-12 px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
