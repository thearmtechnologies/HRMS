import React, { useState } from 'react';
import { CheckCircle, Copy, Check, X, User, Mail, Key, Hash } from 'lucide-react';

export default function CredentialsModal({ isOpen, onClose, credentials }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !credentials) return null;

  const handleCopy = () => {
    const text = `Employee Credentials\n--------------------\nEmployee ID: ${credentials.employeeId}\nName: ${credentials.employeeName}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.tempPassword}\n\nPlease change your password on first login.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Employee Created!</h2>
              <p className="text-green-100 text-xs">Account credentials generated successfully</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Credentials Card */}
        <div className="p-6 space-y-4">
          <div className="bg-[#f0f3f5] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Hash size={16} className="text-[#8f9192] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[#8f9192] font-medium">Employee ID</p>
                <p className="text-sm font-bold text-[#1E293B] truncate">{credentials.employeeId}</p>
              </div>
            </div>
            <div className="border-t border-[#d6d9df]"></div>
            <div className="flex items-center gap-3">
              <User size={16} className="text-[#8f9192] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[#8f9192] font-medium">Employee Name</p>
                <p className="text-sm font-bold text-[#1E293B] truncate">{credentials.employeeName}</p>
              </div>
            </div>
            <div className="border-t border-[#d6d9df]"></div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-[#8f9192] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[#8f9192] font-medium">Email</p>
                <p className="text-sm font-bold text-[#1E293B] truncate">{credentials.email}</p>
              </div>
            </div>
            <div className="border-t border-[#d6d9df]"></div>
            <div className="flex items-center gap-3">
              <Key size={16} className="text-[#8f9192] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[#8f9192] font-medium">Temporary Password</p>
                <p className="text-sm font-bold text-[#1E293B] font-mono tracking-wide break-all">{credentials.tempPassword}</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <span className="text-amber-500 text-base mt-0.5">⚠️</span>
            <p className="text-xs text-amber-700 leading-relaxed">
              This password is shown <strong>only once</strong>. Please copy and share it securely with the employee. They will be required to change it on first login.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                copied
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-lg shadow-blue-500/20'
              }`}
            >
              {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Credentials</>}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-[#8f9192] bg-[#f0f3f5] hover:bg-[#d6d9df] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
