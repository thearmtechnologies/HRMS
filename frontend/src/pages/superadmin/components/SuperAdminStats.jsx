import React from 'react';
import { Building2, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

export default function SuperAdminStats({ stats = { total: 0, active: 0, suspended: 0 }, onCreateClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Companies */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
          <Building2 size={24} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Total Tenants</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
        </div>
      </div>

      {/* Active Companies */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Active Companies</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.active}</h3>
        </div>
      </div>

      {/* Suspended Companies */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Suspended</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.suspended}</h3>
        </div>
      </div>

      {/* Add Button Box */}
      <div className="bg-[#EEF2F6] rounded-xl border border-dashed border-gray-300 p-4 shadow-sm flex items-center justify-center">
        <button
          onClick={onCreateClick}
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none"
        >
          <Plus size={18} />
          Create Company
        </button>
      </div>
    </div>
  );
}
