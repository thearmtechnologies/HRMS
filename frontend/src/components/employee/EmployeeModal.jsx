import React from 'react';
import { X, User } from 'lucide-react';

export default function EmployeeModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children,
  icon: Icon = User
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B82F6]/40 backdrop-blur-sm">
      <div className="bg-[#fdfdfe] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#d6d9df] flex justify-between items-center bg-[#fdfdfe] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f0f3f5] rounded-lg text-[#1E293B]">
              <Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">{title}</h2>
              {description && <p className="text-xs text-[#8f9192]">{description}</p>}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#8f9192] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={24}/>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>

      </div>
    </div>
  );
}
