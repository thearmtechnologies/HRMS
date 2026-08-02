import React from 'react';
import { X, Building2, Globe, Mail, Phone, Calendar, ShieldCheck, MapPin, Award } from 'lucide-react';

export default function CompanyDetailsDrawer({ isOpen, onClose, company, companyInfo }) {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Sliding Panel */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-gray-200 animate-in slide-in-from-right duration-250">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-150 flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#4F46E5]/10 text-[#4F46E5] rounded-xl flex items-center justify-center font-bold">
                {company.companyCode}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">{company.companyName}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  company.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                  company.status === 'Suspended' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {company.status}
                </span>
              </div>
            </div>

            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Identity Information Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Identity Details</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Company Code</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{company.companyCode}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Registered Email</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-1.5 break-all"><Mail size={14} className="text-gray-400 shrink-0"/>{company.companyEmail}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Registered Phone</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-1.5"><Phone size={14} className="text-gray-400"/>{company.companyPhone}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Created Date</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400"/>
                    {new Date(company.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Administrator Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Primary Administrator</h4>
              
              {company.primaryAdmin ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Admin Name</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{company.primaryAdmin.fullName || `${company.primaryAdmin.firstName} ${company.primaryAdmin.lastName}`}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Work Email</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-1.5 break-all">
                      <Mail size={14} className="text-gray-400 shrink-0"/>
                      {company.primaryAdmin.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Mobile Number</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 flex items-center gap-1.5">
                      <Phone size={14} className="text-gray-400"/>
                      {company.primaryAdmin.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Account Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold mt-1 uppercase ${
                      company.primaryAdmin.isActive 
                        ? 'bg-green-50 text-green-700 border border-green-150' 
                        : 'bg-red-50 text-red-700 border border-red-150'
                    }`}>
                      {company.primaryAdmin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">First Login Pending</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {company.primaryAdmin.isFirstLogin ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Last Login</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {company.primaryAdmin.lastLogin 
                        ? new Date(company.primaryAdmin.lastLogin).toLocaleString('en-GB') 
                        : 'Never logged in'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-center text-xs text-gray-400 font-semibold">
                  No Primary Administrator assigned.
                </div>
              )}
            </div>

            {/* Profile Settings Metadata */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-b-gray-100 pb-2">Company Configuration</h4>

              {companyInfo && companyInfo.isConfigured ? (
                <div className="space-y-4">
                  {/* Logo Display */}
                  {companyInfo.logoUrl && (
                    <div className="p-4 bg-[#F8FAFC] border border-gray-100 rounded-xl flex items-center gap-4">
                      <img src={companyInfo.logoUrl} alt="Branding Logo" className="h-12 w-auto max-w-[120px] object-contain rounded border border-gray-200 p-1 bg-white" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">{companyInfo.legalName || company.companyName}</p>
                        <p className="text-[10px] text-gray-400">Branded Logo Configured</p>
                      </div>
                    </div>
                  )}

                  {/* Config Details */}
                  <div className="space-y-3">
                    {companyInfo.legalName && (
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Legal Name</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{companyInfo.legalName}</p>
                      </div>
                    )}

                    {companyInfo.industry && (
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Industry / Domain</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{companyInfo.industry}</p>
                      </div>
                    )}

                    {companyInfo.website && (
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Website</p>
                        <a 
                          href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm font-semibold text-[#4F46E5] hover:underline mt-0.5 flex items-center gap-1.5"
                        >
                          <Globe size={14} />
                          {companyInfo.website}
                        </a>
                      </div>
                    )}

                    {/* Address block */}
                    {(companyInfo.addressLine1 || companyInfo.city) && (
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Headquarters Address</p>
                        <p className="text-sm text-gray-700 mt-1 flex items-start gap-2 bg-[#F8FAFC] border border-gray-100 p-3 rounded-xl">
                          <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <span>
                            {companyInfo.addressLine1}
                            {companyInfo.addressLine2 && <><br/>{companyInfo.addressLine2}</>}
                            <br/>
                            {companyInfo.city}, {companyInfo.state} - {companyInfo.zipCode}
                            <br/>
                            {companyInfo.country}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-center">
                  <Building2 size={24} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">Configuration Status</p>
                  <p className="text-xs text-gray-400 mt-1">Company Information has not been configured yet.</p>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-gray-150 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              Close Details
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
