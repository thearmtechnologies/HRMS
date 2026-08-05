import React from 'react';
import { FileSearch } from 'lucide-react';

export default function EmptyReportState({ title = "No reports generated yet", message = "Select criteria and generate a report to see the results here." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-dashed border-[#d6d9df] rounded-xl text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <FileSearch size={28} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{message}</p>
    </div>
  );
}
