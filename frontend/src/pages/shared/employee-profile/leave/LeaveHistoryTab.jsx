import React from 'react';

export default function LeaveHistoryTab({ employee }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-200">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl text-slate-400">🏗️</span>
      </div>
      <h3 className="text-lg font-bold text-[#1E293B]">Coming Soon</h3>
      <p className="text-[#8f9192] max-w-sm mt-2">
        This section is currently under development. Data for LeaveHistory will be available here in a future update.
      </p>
    </div>
  );
}
