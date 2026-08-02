import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export default function CompanyFormModal({ isOpen, onClose, onSave, company }) {
  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    companyEmail: '',
    companyPhone: '',
    status: 'Active'
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        companyCode: company.companyCode || '',
        companyEmail: company.companyEmail || '',
        companyPhone: company.companyPhone || '',
        status: company.status || 'Active'
      });
    } else {
      setFormData({
        companyName: '',
        companyCode: '',
        companyEmail: '',
        companyPhone: '',
        status: 'Active'
      });
    }
    setErrors({});
  }, [company, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const codeRegex = /^[A-Z0-9_]+$/;

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    const codeInput = formData.companyCode.trim().toUpperCase();
    if (!codeInput) {
      newErrors.companyCode = 'Company code is required';
    } else if (!codeRegex.test(codeInput)) {
      newErrors.companyCode = 'Only uppercase alphanumeric and underscores allowed';
    }

    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!emailRegex.test(formData.companyEmail.trim())) {
      newErrors.companyEmail = 'Please provide a valid email format';
    }

    if (!formData.companyPhone.trim()) {
      newErrors.companyPhone = 'Company phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      companyName: formData.companyName.trim(),
      companyCode: formData.companyCode.trim().toUpperCase(),
      companyEmail: formData.companyEmail.trim().toLowerCase(),
      companyPhone: formData.companyPhone.trim(),
      status: formData.status
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150">
          <h3 className="font-bold text-[#1E293B] text-base">
            {company ? 'Edit Company Registry' : 'Register New Company'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            
            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. ARM Technologies"
                className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                  errors.companyName ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.companyName && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/>{errors.companyName}</span>}
            </div>

            {/* Code */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600">Company Code *</label>
              <input
                type="text"
                name="companyCode"
                value={formData.companyCode}
                onChange={handleChange}
                placeholder="e.g. ARM (No spaces, alphanumeric/underscores only)"
                className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                  errors.companyCode ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.companyCode && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/>{errors.companyCode}</span>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600">Company Email *</label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="e.g. admin@arm.com"
                className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                  errors.companyEmail ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.companyEmail && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/>{errors.companyEmail}</span>}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600">Company Phone *</label>
              <input
                type="text"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] ${
                  errors.companyPhone ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.companyPhone && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/>{errors.companyPhone}</span>}
            </div>

            {/* Status (Only show Active/Inactive) */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600">Initial Status</label>
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

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-gray-150 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-lg text-sm transition-all flex items-center gap-1.5 shadow-md shadow-[#4F46E5]/10"
            >
              <Save size={16} />
              Save Registry
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
