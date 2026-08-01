import React, { useState, useEffect, useRef } from 'react';

import { 
  Building2, Image as ImageIcon, UploadCloud, X, Save, CheckCircle2, AlertTriangle, Loader2, Info
} from 'lucide-react';

export default function CompanyInformationTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: '', legalName: '', shortName: '', companyCode: '', regNumber: '', 
    companyType: '', industry: '', foundedYear: '', description: '',
    mission: '', vision: '', coreValues: '',
    officialEmail: '', hrEmail: '', payrollEmail: '', supportEmail: '', phone: '', altPhone: '',
    website: '', linkedin: '', facebook: '', instagram: '', twitter: '',
    addressLine1: '', addressLine2: '', city: '', state: '', country: '', zipCode: '',
    panNumber: '', gstNumber: '', cinNumber: '', tanNumber: '', defaultCurrency: 'INR',
    status: 'Active'
  });

  const [metadata, setMetadata] = useState({
    isConfigured: false,
    updatedBy: null,
    updatedAt: null
  });

  const [files, setFiles] = useState({
    logo: null, icon: null, banner: null, stamp: null, signature: null
  });

  const [previewUrls, setPreviewUrls] = useState({
    logo: null, icon: null, banner: null, stamp: null, signature: null
  });

  const [removeFlags, setRemoveFlags] = useState({
    logo: false, icon: false, banner: false, stamp: false, signature: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/company-info', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const resData = await response.json();
      const data = resData.data;
      if (data) {
        setFormData(prev => ({ ...prev, ...data }));
        setMetadata({
          isConfigured: data.isConfigured,
          updatedBy: data.updatedBy,
          updatedAt: data.updatedAt
        });
        setPreviewUrls({
          logo: data.logoUrl,
          icon: data.iconUrl,
          banner: data.bannerUrl,
          stamp: data.stampUrl,
          signature: data.signatureUrl
        });
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
      showMessage('error', 'Failed to fetch company information');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required';
    
    ['officialEmail', 'hrEmail', 'payrollEmail', 'supportEmail'].forEach(field => {
      if (formData[field] && !emailRegex.test(formData[field])) {
        newErrors[field] = 'Invalid email format';
      }
    });

    ['phone', 'altPhone'].forEach(field => {
      if (formData[field] && !phoneRegex.test(formData[field])) {
        newErrors[field] = 'Invalid phone number';
      }
    });

    ['website', 'linkedin', 'facebook', 'instagram', 'twitter'].forEach(field => {
      if (formData[field] && !urlRegex.test(formData[field])) {
        newErrors[field] = 'Invalid URL format';
      }
    });

    if (formData.gstNumber && !gstRegex.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST format (e.g. 22AAAAA0000A1Z5)';
    }

    if (formData.panNumber && !panRegex.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format (e.g. ABCDE1234F)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showMessage('error', 'Please fix the validation errors before saving.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value);
      });

      Object.entries(files).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });

      Object.entries(removeFlags).forEach(([key, flag]) => {
        if (flag) fd.append(`remove_${key}`, 'true');
      });

      const response = await fetch('http://localhost:5000/api/company-info', {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`
          // Note: Content-Type is intentionally omitted for FormData
        },
        body: fd
      });
      
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to save company information');
      }

      const data = resData.data;
      setMetadata({
        isConfigured: data.isConfigured,
        updatedBy: data.updatedBy,
        updatedAt: data.updatedAt
      });
      
      // Reset files after successful upload
      setFiles({ logo: null, icon: null, banner: null, stamp: null, signature: null });
      setRemoveFlags({ logo: false, icon: false, banner: false, stamp: false, signature: false });
      
      showMessage('success', resData.message || 'Company information saved successfully');
    } catch (error) {
      console.error('Error saving company info:', error);
      showMessage('error', error.message || 'Failed to save company information');
    } finally {
      setSaving(false);
    }
  };

  const ImageUploadZone = ({ label, field, hint }) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file) => {
      if (file && file.type.startsWith('image/')) {
        setFiles(prev => ({ ...prev, [field]: file }));
        setPreviewUrls(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        setRemoveFlags(prev => ({ ...prev, [field]: false }));
      } else {
        showMessage('error', 'Please upload a valid image file');
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    };

    const handleRemove = () => {
      setFiles(prev => ({ ...prev, [field]: null }));
      setPreviewUrls(prev => ({ ...prev, [field]: null }));
      setRemoveFlags(prev => ({ ...prev, [field]: true }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[#1E293B]">{label}</label>
        {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
        <div 
          className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handleFile(e.target.files[0])} 
          />
          
          {previewUrls[field] ? (
            <div className="relative group w-full flex items-center justify-center">
              <img src={previewUrls[field]} alt={label} className="max-h-32 object-contain rounded" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded gap-2">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-white text-gray-800 text-xs px-2 py-1 rounded shadow"
                >
                  Replace
                </button>
                <button 
                  type="button" 
                  onClick={handleRemove} 
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-24"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={24} className="text-gray-400" />
              <div className="text-xs text-center text-gray-500">
                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const InputField = ({ label, name, type = 'text', placeholder, optional }) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-[#1E293B]">{label}</label>
        {optional && <span className="text-[10px] text-gray-400 uppercase">Optional</span>}
      </div>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/20 ${errors[name] ? 'border-red-400 bg-red-50' : 'border-[#d6d9df] bg-white'}`}
      />
      {errors[name] && <span className="text-xs text-red-500">{errors[name]}</span>}
    </div>
  );

  const TextAreaField = ({ label, name, placeholder, rows = 3 }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#1E293B]">{label}</label>
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-[#d6d9df] rounded-lg text-sm bg-white resize-none transition-all focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 relative pb-24">
      {/* Onboarding Config Status */}
      {!metadata.isConfigured && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Company Information Not Configured</h4>
            <p className="text-xs text-amber-700 mt-1">Please complete the organization profile. This data serves as the single source of truth for reports, payroll, offer letters, and ID cards.</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="border-b border-[#d6d9df] bg-gray-50 p-4">
            <h3 className="font-bold text-[#1E293B] text-base flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" /> Basic Information
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Company Name" name="companyName" placeholder="e.g. Acme Corp" />
            <InputField label="Legal Company Name" name="legalName" placeholder="e.g. Acme Corporation Pvt Ltd" />
            <InputField label="Company Short Name" name="shortName" placeholder="e.g. Acme" />
            <InputField label="Company Code" name="companyCode" placeholder="e.g. ACM" />
            <InputField label="Registration Number" name="regNumber" placeholder="CIN or Reg No" />
            <InputField label="Founded Year" name="foundedYear" placeholder="e.g. 2010" />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1E293B]">Company Type</label>
              <select 
                name="companyType" 
                value={formData.companyType} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#d6d9df] rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select Type</option>
                <option value="Private Limited">Private Limited</option>
                <option value="Public Limited">Public Limited</option>
                <option value="LLP">LLP</option>
                <option value="Partnership">Partnership</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <InputField label="Industry" name="industry" placeholder="e.g. Technology" />
            
            <div className="md:col-span-2">
              <TextAreaField label="Company Description" name="description" placeholder="Brief description of the organization..." />
            </div>
          </div>
        </div>

        {/* Company Profile */}
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="border-b border-[#d6d9df] bg-gray-50 p-4">
            <h3 className="font-bold text-[#1E293B] text-base flex items-center gap-2">
              <Info size={18} className="text-indigo-600" /> Company Profile
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <TextAreaField label="Mission Statement" name="mission" placeholder="Our mission is to..." rows={2} />
            </div>
            <div className="md:col-span-2">
              <TextAreaField label="Vision Statement" name="vision" placeholder="Our vision is to be..." rows={2} />
            </div>
            <div className="md:col-span-2">
              <TextAreaField label="Core Values" name="coreValues" placeholder="Innovation, Integrity, Excellence..." rows={2} />
            </div>
          </div>
        </div>

        {/* Company Branding */}
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="border-b border-[#d6d9df] bg-gray-50 p-4">
            <h3 className="font-bold text-[#1E293B] text-base flex items-center gap-2">
              <ImageIcon size={18} className="text-pink-600" /> Company Branding
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageUploadZone label="Company Logo" field="logo" hint="Used in reports, payslips, PDFs" />
            <ImageUploadZone label="Company Icon / Favicon" field="icon" hint="Used in dashboard and login page" />
            <ImageUploadZone label="Company Banner" field="banner" hint="Used in company profile (Optional)" />
            <ImageUploadZone label="Company Stamp" field="stamp" hint="Used for automated stamping on documents" />
            <ImageUploadZone label="Authorized Signature" field="signature" hint="Used in offer letters and payslips" />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="border-b border-[#d6d9df] bg-gray-50 p-4">
            <h3 className="font-bold text-[#1E293B] text-base">Contact Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Official Email" name="officialEmail" type="email" />
            <InputField label="HR Email" name="hrEmail" type="email" />
            <InputField label="Payroll Email" name="payrollEmail" type="email" />
            <InputField label="Support Email" name="supportEmail" type="email" />
            <InputField label="Company Phone" name="phone" />
            <InputField label="Alternate Phone" name="altPhone" optional />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="border-b border-[#d6d9df] bg-gray-50 p-4">
            <h3 className="font-bold text-[#1E293B] text-base">Social Links</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Website" name="website" placeholder="https://..." />
            <InputField label="LinkedIn" name="linkedin" placeholder="https://linkedin.com/company/..." optional />
            <InputField label="Facebook" name="facebook" placeholder="https://facebook.com/..." optional />
            <InputField label="Instagram" name="instagram" placeholder="https://instagram.com/..." optional />
            <InputField label="Twitter / X" name="twitter" placeholder="https://twitter.com/..." optional />
          </div>
        </div>

        {/* Company Address */}
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="border-b border-[#d6d9df] bg-gray-50 p-4">
            <h3 className="font-bold text-[#1E293B] text-base">Company Address</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Address Line 1" name="addressLine1" />
            <InputField label="Address Line 2" name="addressLine2" optional />
            <InputField label="City" name="city" />
            <InputField label="State" name="state" />
            <InputField label="Country" name="country" />
            <InputField label="ZIP / Postal Code" name="zipCode" />
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="border-b border-[#d6d9df] bg-gray-50 p-4 flex justify-between items-center">
            <h3 className="font-bold text-[#1E293B] text-base">Business Information</h3>
            <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold">OPTIONAL</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="PAN Number" name="panNumber" />
            <InputField label="GST Number" name="gstNumber" />
            <InputField label="CIN Number" name="cinNumber" />
            <InputField label="TAN Number" name="tanNumber" />
            <InputField label="Default Currency" name="defaultCurrency" placeholder="e.g. INR" />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1E293B]">Company Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#d6d9df] rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </form>

      {/* Sticky Save Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-40">
        <div className="flex flex-col text-xs text-gray-500">
          {metadata.updatedAt ? (
            <>
              <span>Last Updated: <span className="font-semibold text-gray-800">{new Date(metadata.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></span>
              <span>By: <span className="font-semibold text-gray-800">{metadata.updatedBy?.fullName || metadata.updatedBy?.firstName || 'Admin'}</span></span>
            </>
          ) : (
            <span className="text-amber-600 font-semibold">Not configured yet</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              {message.text}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
