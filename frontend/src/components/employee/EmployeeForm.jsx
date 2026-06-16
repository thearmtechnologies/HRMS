import React, { useState, useEffect } from 'react';
import { Loader2, User, Briefcase, ChevronDown, Save } from 'lucide-react';

export default function EmployeeForm({ 
  mode = 'create', // 'create', 'edit', 'view'
  initialData = null,
  departments, 
  onSuccess,
  onClose
}) {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const [formData, setFormData] = useState({ 
    firstName: "", 
    lastName: "",
    email: "", 
    phone: "", 
    employeeId: "",
    role: "", 
    department: "",
    joinDate: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData && (isEditMode || isViewMode)) {
      // Split employeeName into first and last name if needed
      const nameParts = (initialData.employeeName || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      
      const deptId = initialData.department ? (initialData.department._id || initialData.department) : "";

      setFormData({
        firstName,
        lastName,
        email: initialData.email || "",
        phone: initialData.mobile || "",
        employeeId: initialData.employeeId || "",
        role: initialData.designation || "",
        department: deptId,
        joinDate: initialData.doj ? new Date(initialData.doj).toISOString().split('T')[0] : "",
      });
    } else {
      // Reset for create
      setFormData({ 
        firstName: "", 
        lastName: "",
        email: "", 
        phone: "", 
        employeeId: "",
        role: "", 
        department: "",
        joinDate: "",
      });
    }
    setError(null);
  }, [initialData, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    setIsSubmitting(true);
    setError(null);

    const payload = {
      employeeName: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      mobile: formData.phone,
      designation: formData.role,
      department: formData.department,
      site: "Mumbai HQ", // Default required by backend
      doj: formData.joinDate,
    };

    try {
      let res;
      if (isCreateMode) {
        res = await fetch("http://localhost:5000/api/employee", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
      } else if (isEditMode) {
        res = await fetch(`http://localhost:5000/api/employee/admin/${initialData._id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
      }

      const responseData = await res.json();

      if (res.ok) {
        // Pass the full response to parent so it can show the credentials modal
        onSuccess && onSuccess(responseData);
        onClose && onClose();
      } else {
        setError(responseData.error || `Failed to ${mode} employee`);
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="employee-form" onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="p-6 overflow-y-auto space-y-8">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Section 1: Personal Details */}
        <section>
          <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
            <User size={16} /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">First Name *</label>
              <input type="text" required disabled={isSubmitting || isViewMode}
                value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="e.g. John" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Last Name *</label>
              <input type="text" required disabled={isSubmitting || isViewMode}
                value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="e.g. Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Work Email *</label>
              <input type="email" required disabled={isSubmitting || isViewMode}
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="john.doe@ARM.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Phone Number *</label>
              <input type="tel" required disabled={isSubmitting || isViewMode}
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        </section>

        {/* Section 2: Employment Details */}
        <section>
          <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
            <Briefcase size={16} /> Employment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Employee ID (Auto-generated)</label>
              <input type="text" disabled
                value={formData.employeeId} 
                className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70 font-semibold" placeholder="Generated upon save" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Department *</label>
              <div className="relative">
                <select required disabled={isSubmitting || isViewMode}
                  value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full appearance-none px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all cursor-pointer disabled:opacity-70">
                  <option value="" disabled>Select Department</option>
                  {departments && departments.map(dept => <option key={dept._id} value={dept._id}>{dept.departmentName}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Job Title / Role *</label>
              <input type="text" required disabled={isSubmitting || isViewMode}
                value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="e.g. Senior Software Engineer" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Joining *</label>
              <input type="date" required disabled={isSubmitting || isViewMode}
                value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-70" />
            </div>
          </div>
        </section>

        {/* Note: Password is auto-generated by the backend. Credentials shown in success modal. */}
      </div>

      {/* Footer */}
      {!isViewMode && (
        <div className="px-6 py-4 border-t border-[#d6d9df] bg-[#f0f3f5] flex items-center justify-end gap-3 mt-auto">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-[#8f9192] border border-[#d6d9df] bg-[#fdfdfe] rounded-lg hover:bg-[#d6d9df] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-5 py-2.5 flex items-center gap-2 text-sm font-bold text-[#fdfdfe] bg-[#3B82F6] rounded-lg hover:bg-[#2563EB] shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSubmitting ? 'Saving...' : (isCreateMode ? 'Create Employee' : 'Save Changes')}
          </button>
        </div>
      )}
    </form>
  );
}
