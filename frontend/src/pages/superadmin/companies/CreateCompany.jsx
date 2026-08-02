import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, User, Mail, Phone, Lock, Check, Copy } from 'lucide-react';

export default function CreateCompany() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    companyEmail: '',
    companyPhone: '',
    status: 'Active',
    firstName: '',
    lastName: '',
    adminEmail: '',
    adminPhone: '',
    sendCredentials: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const codeRegex = /^[A-Z0-9_]+$/;

    // Company Info
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    
    const codeInput = formData.companyCode.trim().toUpperCase();
    if (!codeInput) {
      newErrors.companyCode = 'Company code is required';
    } else if (!codeRegex.test(codeInput)) {
      newErrors.companyCode = 'Only uppercase alphanumeric and underscores allowed';
    }

    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!emailRegex.test(formData.companyEmail.trim())) {
      newErrors.companyEmail = 'Invalid email format';
    }

    if (!formData.companyPhone.trim()) newErrors.companyPhone = 'Company phone is required';

    // Admin Info
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Work email is required';
    } else if (!emailRegex.test(formData.adminEmail.trim())) {
      newErrors.adminEmail = 'Invalid email format';
    }

    if (!formData.adminPhone.trim()) newErrors.adminPhone = 'Mobile number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const response = await fetch('http://localhost:5000/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
        },
        body: JSON.stringify({
          companyName: formData.companyName.trim(),
          companyCode: formData.companyCode.trim().toUpperCase(),
          companyEmail: formData.companyEmail.trim().toLowerCase(),
          companyPhone: formData.companyPhone.trim(),
          status: formData.status,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          adminEmail: formData.adminEmail.trim().toLowerCase(),
          adminPhone: formData.adminPhone.trim(),
          sendCredentials: formData.sendCredentials
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create company');
      }

      if (data.showPassword && data.temporaryPassword) {
        // Super Admin chose not to send credentials via email -> show copy dialog modal
        setGeneratedPassword(data.temporaryPassword);
        setShowPasswordModal(true);
      } else {
        // Welcoming email triggered -> redirect directly
        navigate('/super-admin/dashboard');
      }
    } catch (err) {
      setApiError(err.message || 'An error occurred during company registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `Admin Email: ${formData.adminEmail.trim().toLowerCase()}\nTemporary Password: ${generatedPassword}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/super-admin/dashboard')}
          className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-gray-700 rounded-xl hover:shadow-sm transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Register New Company</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Tenant Onboarding Wizard</p>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
          {apiError}
        </div>
      )}

      {/* Forms Grid */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section 1: Company Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
              <Building2 className="text-[#4F46E5]" size={20} />
              <h3 className="font-bold text-gray-800 text-base">Company Details</h3>
            </div>

            {/* Company Name */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 block">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. ARM Technologies"
                className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                  errors.companyName ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.companyName && <span className="text-xs text-red-500">{errors.companyName}</span>}
            </div>

            {/* Company Code */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 block">Company Code *</label>
              <input
                type="text"
                name="companyCode"
                value={formData.companyCode}
                onChange={handleChange}
                placeholder="e.g. ARM (Uppercase, alphanumeric & underscores only)"
                className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                  errors.companyCode ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.companyCode && <span className="text-xs text-red-500">{errors.companyCode}</span>}
            </div>

            {/* Grid for Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600 block">Company Email *</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="e.g. contact@arm.com"
                  className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                    errors.companyEmail ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.companyEmail && <span className="text-xs text-red-500">{errors.companyEmail}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600 block">Company Phone *</label>
                <input
                  type="text"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                    errors.companyPhone ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.companyPhone && <span className="text-xs text-red-500">{errors.companyPhone}</span>}
              </div>
            </div>

            {/* Status selection */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 block">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Section 2: Company Administrator */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
              <User className="text-[#4F46E5]" size={20} />
              <h3 className="font-bold text-gray-800 text-base">Company Administrator Details</h3>
            </div>

            {/* Grid for First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600 block">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. John"
                  className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                    errors.firstName ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600 block">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Doe"
                  className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                    errors.lastName ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.lastName && <span className="text-xs text-red-500">{errors.lastName}</span>}
              </div>
            </div>

            {/* Admin Work Email */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 block">Work Email *</label>
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="e.g. j.doe@company.com"
                className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                  errors.adminEmail ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.adminEmail && <span className="text-xs text-red-500">{errors.adminEmail}</span>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600 block">Mobile Number *</label>
              <input
                type="text"
                name="adminPhone"
                value={formData.adminPhone}
                onChange={handleChange}
                placeholder="e.g. +91 99988 77766"
                className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                  errors.adminPhone ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.adminPhone && <span className="text-xs text-red-500">{errors.adminPhone}</span>}
            </div>

            {/* Send Credentials Email */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  name="sendCredentials"
                  checked={formData.sendCredentials}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                />
                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                  Send login credentials to Company Administrator email
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action button row */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate('/super-admin/dashboard')}
            className="px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-sm transition-all"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Registering Tenant...'
            ) : (
              <>
                <Save size={16} />
                Register Company
              </>
            )}
          </button>
        </div>
      </form>

      {/* Credentials Copy Dialog Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/55 z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
            
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={26} />
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">Tenant Successfully Onboarded!</h3>
            
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Company registration is complete. Since automatic email delivery was disabled, please copy these generated credentials to share with the client administrator:
            </p>

            <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 text-left space-y-2 mb-6 font-mono text-sm relative">
              <div>
                <span className="text-gray-400 text-[11px] uppercase font-sans font-bold">Admin Email:</span>
                <p className="text-gray-800 font-semibold break-all">{formData.adminEmail.trim().toLowerCase()}</p>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div>
                <span className="text-gray-400 text-[11px] uppercase font-sans font-bold">Temporary Password:</span>
                <p className="text-gray-800 font-semibold flex items-center gap-2">
                  <Lock size={14} className="text-gray-400" />
                  {generatedPassword}
                </p>
              </div>

              {/* Copy inline button */}
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 border border-gray-200 hover:bg-white text-gray-400 hover:text-[#4F46E5] bg-gray-50 rounded-lg transition-colors shadow-sm"
                title="Copy details"
              >
                <Copy size={14} />
              </button>
            </div>

            {copied && (
              <span className="text-xs text-green-600 font-bold block mb-4 animate-pulse">
                Copied to clipboard!
              </span>
            )}

            <button
              onClick={() => {
                setShowPasswordModal(false);
                navigate('/super-admin/dashboard');
              }}
              className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl text-sm transition-all"
            >
              Done & Finish Setup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
