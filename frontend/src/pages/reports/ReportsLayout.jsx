import React from 'react';
import { Outlet } from 'react-router-dom';

const ReportsLayout = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 font-sans text-slate-700 animate-in fade-in duration-200">
      <Outlet />
    </div>
  );
};

export default ReportsLayout;
