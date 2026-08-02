import React from 'react';
import { Eye, Edit2, ShieldAlert, ShieldCheck, Calendar, Phone, Mail } from 'lucide-react';

export default function CompanyTable({ 
  companies = [], 
  onView, 
  onEdit, 
  onToggleStatus 
}) {

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="py-4 px-6">Company</th>
              <th className="py-4 px-6">Code</th>
              <th className="py-4 px-6">Contact Info</th>
              <th className="py-4 px-6">Created Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 text-sm text-gray-700">
            {companies.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-400 font-semibold bg-gray-50/50">
                  No registered companies match the current search filters.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company._id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Company Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {company.logoUrl ? (
                        <div className="h-10 w-10 border border-gray-200 rounded-lg p-1 bg-white flex items-center justify-center shrink-0">
                          <img src={company.logoUrl} alt="Logo" className="h-full w-full object-contain rounded" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-[#EEF2F6] text-[#4F46E5] border border-gray-100 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                          {company.companyCode}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 leading-tight">{company.companyName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {company._id.substring(18)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Company Code */}
                  <td className="py-4 px-6">
                    <span className="font-mono bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded border border-gray-200">
                      {company.companyCode}
                    </span>
                  </td>

                  {/* Contact Info */}
                  <td className="py-4 px-6 space-y-1">
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"><Mail size={12} className="text-gray-400 shrink-0"/>{company.companyEmail}</p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"><Phone size={12} className="text-gray-400 shrink-0"/>{company.companyPhone}</p>
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span>
                        {new Date(company.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      company.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                      company.status === 'Suspended' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        company.status === 'Active' ? 'bg-green-600' :
                        company.status === 'Suspended' ? 'bg-amber-500' : 'bg-gray-400'
                      }`}></span>
                      {company.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {/* View */}
                      <button
                        onClick={() => onView(company)}
                        title="View Details"
                        className="p-2 text-gray-400 hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded-lg transition-all"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(company)}
                        title="Edit Registry"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* Toggle Status: Suspend / Activate */}
                      {company.status === 'Active' ? (
                        <button
                          onClick={() => onToggleStatus(company, 'Suspended')}
                          title="Suspend Company"
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <ShieldAlert size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleStatus(company, 'Active')}
                          title="Activate Company"
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        >
                          <ShieldCheck size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
