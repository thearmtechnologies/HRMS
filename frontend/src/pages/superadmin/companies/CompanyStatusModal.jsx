import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export default function CompanyStatusModal({ isOpen, onClose, onConfirm, company, targetStatus }) {
  if (!isOpen || !company) return null;

  const isSuspendedAction = targetStatus === 'Suspended';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150">
          <h3 className="font-bold text-[#1E293B] text-base">Confirm Status Change</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isSuspendedAction ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
          }`}>
            {isSuspendedAction ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
          </div>

          <h4 className="text-lg font-bold text-gray-800 mb-2">
            {isSuspendedAction ? 'Suspend this company?' : 'Activate this company?'}
          </h4>

          <p className="text-sm text-gray-500 leading-relaxed mb-1">
            You are changing the status of <span className="font-bold text-gray-800">{company.companyName}</span> to <span className="font-bold">{targetStatus}</span>.
          </p>

          <p className="text-xs text-gray-400 leading-relaxed mt-2 p-3 bg-[#F8FAFC] rounded-lg border border-gray-100">
            {isSuspendedAction
              ? 'WARNING: Users of this company will no longer be able to log in until the company is activated again.'
              : 'All users of this company will regain access to their HRMS portal immediately.'
            }
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-gray-150 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-white font-bold rounded-lg text-sm transition-colors ${
              isSuspendedAction ? 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/10' : 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/10'
            }`}
          >
            Confirm Change
          </button>
        </div>

      </div>
    </div>
  );
}
