import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f3f5] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-50 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Access Denied</h2>
        <p className="text-[#8f9192] mb-8">You do not have permission to view this page or perform this action.</p>
        
        <button
          onClick={() => navigate(-1)}
          className="w-full py-2 px-4 bg-[#3B82F6] hover:bg-opacity-90 text-white font-bold rounded-lg transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
