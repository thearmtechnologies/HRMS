import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function DocumentsTab({ employee }) {
  if (!employee) return null;
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
          <div className="flex justify-between items-center mb-3">
            <label className="font-bold text-[#1E293B]">PAN Number</label>
            {employee.documents?.pan?.verified ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 size={14}/> Verified</span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md"><AlertCircle size={14}/> Unverified</span>
            )}
          </div>
          <div className="w-full px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium uppercase">{employee.documents?.pan?.number || '—'}</div>
        </div>

        <div className="bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
          <div className="flex justify-between items-center mb-3">
            <label className="font-bold text-[#1E293B]">Aadhaar Number</label>
            {employee.documents?.aadhaar?.verified ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 size={14}/> Verified</span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md"><AlertCircle size={14}/> Unverified</span>
            )}
          </div>
          <div className="w-full px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-[#1E293B] font-medium">{employee.documents?.aadhaar?.number || '—'}</div>
        </div>
      </div>
    </div>
  );
}
