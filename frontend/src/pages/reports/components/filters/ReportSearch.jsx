import React from 'react';
import { Search } from 'lucide-react';

export default function ReportSearch({ placeholder = "Search reports...", value, onChange }) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-[#d6d9df] rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-700 transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  );
}
