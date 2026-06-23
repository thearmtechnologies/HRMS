import React, { useState, useEffect } from 'react';
import { Loader2, User, Briefcase, ChevronDown, Save, CreditCard, AlertCircle, FileText, CheckCircle2, IndianRupee } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState('personal'); // personal, employment, bank, emergency, documents

  const [formData, setFormData] = useState({ 
    firstName: "", lastName: "", email: "", personalEmail: "", mobile: "",
    gender: "", dob: "", maritalStatus: "", bloodGroup: "",
    address: "", city: "", state: "", pincode: "",
    employeeId: "", department: "", designation: "", role: "employee", workLocation: "", joinDate: "", status: "Active", employmentType: "Full-time", annualSalary: "", reportingManager: "",
    bankName: "", branch: "", accountNo: "", ifscCode: "",
    kinName: "", relationship: "", kinPhone: "", kinAddress: "",
    panNumber: "", panVerified: false, aadhaarNumber: "", aadhaarVerified: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);

  useEffect(() => {
    if (initialData && (isEditMode || isViewMode)) {
      const deptId = initialData.department ? (initialData.department._id || initialData.department) : "";

      // Lookup user for this employee to get role? The initialData might not have role directly unless populated or passed.
      // Assuming role is available or we default it.
      
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        personalEmail: initialData.personalEmail || "",
        mobile: initialData.mobile || "",
        gender: initialData.gender || "",
        dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : "",
        maritalStatus: initialData.maritalStatus || "",
        bloodGroup: initialData.bloodGroup || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        pincode: initialData.pincode || "",
        employeeId: initialData.employeeId || "",
        department: deptId,
        designation: initialData.designation || "",
        role: initialData.role || "employee", // user role needs handling if fetched
        workLocation: initialData.workLocation || "",
        joinDate: initialData.doj ? new Date(initialData.doj).toISOString().split('T')[0] : "",
        status: initialData.status || "Active",
        employmentType: initialData.employmentType || "Full-time",
        annualSalary: initialData.annualSalary || "",
        reportingManager: initialData.reportingManager || "",
        bankName: initialData.bankName || "",
        branch: initialData.branch || "",
        accountNo: initialData.accountNo || "",
        ifscCode: initialData.ifscCode || "",
        kinName: initialData.kinName || "",
        relationship: initialData.relationship || "",
        kinPhone: initialData.kinPhone || "",
        kinAddress: initialData.kinAddress || "",
        panNumber: initialData.documents?.pan?.number || "",
        panVerified: initialData.documents?.pan?.verified || false,
        aadhaarNumber: initialData.documents?.aadhaar?.number || "",
        aadhaarVerified: initialData.documents?.aadhaar?.verified || false,
      });
    } else {
      // Reset for create
      setFormData({ 
        firstName: "", lastName: "", email: "", personalEmail: "", mobile: "",
        gender: "", dob: "", maritalStatus: "", bloodGroup: "",
        address: "", city: "", state: "", pincode: "",
        employeeId: "", department: "", designation: "", role: "employee", workLocation: "", joinDate: "", status: "Active", employmentType: "Full-time", annualSalary: "", reportingManager: "",
        bankName: "", branch: "", accountNo: "", ifscCode: "",
        kinName: "", relationship: "", kinPhone: "", kinAddress: "",
        panNumber: "", panVerified: false, aadhaarNumber: "", aadhaarVerified: false
      });
    }
    setError(null);

    // Fetch salary info in view mode
    if (isViewMode && initialData?._id) {
      setSalaryLoading(true);
      fetch(`http://localhost:5000/api/pay/salary-fixed/employee/${initialData._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => setSalaryInfo(data))
        .catch(() => setSalaryInfo(null))
        .finally(() => setSalaryLoading(false));
    }
  }, [initialData, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let res;
      if (isCreateMode) {
        const payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email,
          designation: formData.designation,
          department: formData.department,
          workLocation: formData.workLocation,
          doj: formData.joinDate,
          role: formData.role
        };
        res = await fetch("http://localhost:5000/api/employee", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
      } else if (isEditMode) {
        const payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email,
          personalEmail: formData.personalEmail,
          mobile: formData.mobile,
          gender: formData.gender,
          dob: formData.dob || null,
          maritalStatus: formData.maritalStatus,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          department: formData.department,
          designation: formData.designation,
          workLocation: formData.workLocation,
          doj: formData.joinDate,
          status: formData.status,
          employmentType: formData.employmentType,
          annualSalary: formData.annualSalary || null,
          bankName: formData.bankName,
          branch: formData.branch,
          accountNo: formData.accountNo,
          ifscCode: formData.ifscCode,
          kinName: formData.kinName,
          relationship: formData.relationship,
          kinPhone: formData.kinPhone,
          kinAddress: formData.kinAddress,
          documents: {
            pan: { number: formData.panNumber, verified: formData.panVerified },
            aadhaar: { number: formData.aadhaarNumber, verified: formData.aadhaarVerified }
          }
        };
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

  const formatINR = (v) => {
    if (!v && v !== 0) return '—';
    return '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    ...(isViewMode ? [{ id: 'compensation', label: 'Compensation', icon: IndianRupee }] : []),
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <form id="employee-form" onSubmit={handleSubmit} className="flex flex-col h-full bg-[#fdfdfe]">
      
      {/* Tabs Header - Only show in edit/view mode */}
      {!isCreateMode && (
        <div className="flex border-b border-[#d6d9df] px-4 pt-2 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#8f9192] hover:text-[#1E293B]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="p-6 overflow-y-auto space-y-6 flex-1">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Tab Content: PERSONAL */}
        {(isCreateMode || activeTab === 'personal') && (
          <section className="space-y-4 animate-in fade-in duration-200">
            {isCreateMode && <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2"><User size={16} /> Personal Information</h3>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">First Name *</label>
                <input type="text" required disabled={isSubmitting || isViewMode} value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="e.g. John" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Last Name *</label>
                <input type="text" required disabled={isSubmitting || isViewMode} value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="e.g. Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Work Email *</label>
                <input type="email" required disabled={isSubmitting || isViewMode} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="john.doe@ARM.com" />
              </div>
              
              {!isCreateMode && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Personal Email</label>
                    <input type="email" disabled={isSubmitting || isViewMode} value={formData.personalEmail} onChange={(e) => setFormData({...formData, personalEmail: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Mobile Number</label>
                    <input type="tel" disabled={isSubmitting || isViewMode} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Birth</label>
                    <input type="date" disabled={isSubmitting || isViewMode} value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Gender</label>
                    <select disabled={isSubmitting || isViewMode} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Marital Status</label>
                    <select disabled={isSubmitting || isViewMode} value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Blood Group</label>
                    <select disabled={isSubmitting || isViewMode} value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {!isCreateMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Address</label>
                  <input type="text" disabled={isSubmitting || isViewMode} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">City</label>
                  <input type="text" disabled={isSubmitting || isViewMode} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">State</label>
                  <select disabled={isSubmitting || isViewMode} value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="">Select State</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Puducherry">Puducherry</option>
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Pincode</label>
                  <input type="text" disabled={isSubmitting || isViewMode} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tab Content: EMPLOYMENT */}
        {(isCreateMode || activeTab === 'employment') && (
          <section className="space-y-4 animate-in fade-in duration-200">
            {isCreateMode && <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 mt-8 border-b border-[#d6d9df] pb-2 flex items-center gap-2"><Briefcase size={16} /> Employment Details</h3>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!isCreateMode && (
                <div>
                  <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Employee ID</label>
                  <input type="text" disabled value={formData.employeeId} className="w-full px-4 py-2.5 bg-[#e2e6ea] border border-[#d6d9df] rounded-lg text-[#1E293B] font-bold" />
                </div>
              )}
              
              {isCreateMode && (
                <div>
                  <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">System Role *</label>
                  <select required disabled={isSubmitting || isViewMode} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="department_manager">Department Manager</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Department *</label>
                <div className="relative">
                  <select required disabled={isSubmitting || isViewMode} value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full appearance-none px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all cursor-pointer disabled:opacity-70">
                    <option value="" disabled>Select Department</option>
                    {departments && departments.map(dept => <option key={dept._id} value={dept._id}>{dept.departmentName}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Designation *</label>
                <input type="text" required disabled={isSubmitting || isViewMode} value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Work Location *</label>
                <input type="text" required disabled={isSubmitting || isViewMode} value={formData.workLocation} onChange={(e) => setFormData({...formData, workLocation: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] outline-none transition-all" placeholder="e.g. Mumbai HQ" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Joining *</label>
                <input type="date" required disabled={isSubmitting || isViewMode} value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] outline-none transition-all" />
              </div>

              {!isCreateMode && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Employment Type</label>
                    <select disabled={isSubmitting || isViewMode} value={formData.employmentType} onChange={(e) => setFormData({...formData, employmentType: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Status</label>
                    <select disabled={isSubmitting || isViewMode} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all font-bold text-[#3B82F6]">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Annual Salary</label>
                    <input type="number" disabled={isSubmitting || isViewMode} value={formData.annualSalary} onChange={(e) => setFormData({...formData, annualSalary: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" placeholder="₹" />
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Tab Content: COMPENSATION (View mode only) */}
        {isViewMode && activeTab === 'compensation' && (
          <section className="space-y-4 animate-in fade-in duration-200">
            {salaryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#3B82F6]" />
              </div>
            ) : salaryInfo ? (
              <>
                <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl p-5 text-white">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-80">Gross Monthly</p>
                      <p className="text-xl font-bold mt-1">{formatINR(salaryInfo.grossMonthly)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-80">In-Hand Monthly</p>
                      <p className="text-xl font-bold mt-1">{formatINR(salaryInfo.inHandMonthly)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-80">Annual CTC</p>
                      <p className="text-xl font-bold mt-1">{formatINR(salaryInfo.annualCTC)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Basic Salary', value: formatINR(salaryInfo.basicMonthly) },
                    { label: 'HRA', value: formatINR(salaryInfo.hraMonthly) },
                    { label: 'Medical Allowance', value: formatINR(salaryInfo.maMonthly) },
                    { label: 'Conveyance Allowance', value: formatINR(salaryInfo.caMonthly) },
                    { label: 'Special Allowance', value: formatINR(salaryInfo.saMonthly) },
                    { label: 'Employee PF', value: formatINR(salaryInfo.employeePFMonthly) },
                    { label: 'Employer PF', value: formatINR(salaryInfo.employerPFMonthly) },
                    { label: 'Professional Tax', value: formatINR(salaryInfo.professionalTax) },
                    { label: 'Overtime Rate/hr', value: formatINR(salaryInfo.overtimeRate) },
                    { label: 'Effective Date', value: salaryInfo.effectiveDate ? new Date(salaryInfo.effectiveDate).toLocaleDateString() : '—' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#f0f3f5] rounded-lg p-3">
                      <p className="text-xs font-semibold text-[#bdc2c7] uppercase">{item.label}</p>
                      <p className="text-sm font-bold text-[#1E293B] mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <IndianRupee size={40} className="mx-auto mb-3 text-[#bdc2c7] opacity-50" />
                <p className="font-medium text-[#8f9192]">No salary structure assigned</p>
                <p className="text-xs text-[#bdc2c7] mt-1">Assign a salary structure from the Employee Management page.</p>
              </div>
            )}
          </section>
        )}

        {/* Tab Content: BANK */}
        {!isCreateMode && activeTab === 'bank' && (
          <section className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Bank Name</label>
                <input type="text" disabled={isSubmitting || isViewMode} value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Branch</label>
                <input type="text" disabled={isSubmitting || isViewMode} value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Account Number</label>
                <input type="text" disabled={isSubmitting || isViewMode} value={formData.accountNo} onChange={(e) => setFormData({...formData, accountNo: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">IFSC Code</label>
                <input type="text" disabled={isSubmitting || isViewMode} value={formData.ifscCode} onChange={(e) => setFormData({...formData, ifscCode: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all uppercase" />
              </div>
            </div>
          </section>
        )}

        {/* Tab Content: EMERGENCY */}
        {!isCreateMode && activeTab === 'emergency' && (
          <section className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Name</label>
                <input type="text" disabled={isSubmitting || isViewMode} value={formData.kinName} onChange={(e) => setFormData({...formData, kinName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Relationship</label>
                <input type="text" disabled={isSubmitting || isViewMode} value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Phone</label>
                <input type="tel" disabled={isSubmitting || isViewMode} value={formData.kinPhone} onChange={(e) => setFormData({...formData, kinPhone: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Address</label>
                <input type="text" disabled={isSubmitting || isViewMode} value={formData.kinAddress} onChange={(e) => setFormData({...formData, kinAddress: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
            </div>
          </section>
        )}

        {/* Tab Content: DOCUMENTS */}
        {!isCreateMode && activeTab === 'documents' && (
          <section className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-bold text-[#1E293B]">PAN Number</label>
                  {formData.panVerified ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 size={14}/> Verified</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md"><AlertCircle size={14}/> Unverified</span>
                  )}
                </div>
                <input type="text" disabled={isSubmitting || isViewMode} value={formData.panNumber} onChange={(e) => setFormData({...formData, panNumber: e.target.value})} className="w-full px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all uppercase" placeholder="ABCDE1234F" />
                
                {isEditMode && (
                  <div className="mt-3 flex items-center gap-2">
                    <input type="checkbox" id="pan-verified" checked={formData.panVerified} onChange={(e) => setFormData({...formData, panVerified: e.target.checked})} className="rounded text-[#3B82F6]" />
                    <label htmlFor="pan-verified" className="text-sm font-semibold text-[#8f9192]">Mark as Verified</label>
                  </div>
                )}
              </div>

              <div className="bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-bold text-[#1E293B]">Aadhaar Number</label>
                  {formData.aadhaarVerified ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 size={14}/> Verified</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md"><AlertCircle size={14}/> Unverified</span>
                  )}
                </div>
                <input type="text" disabled={isSubmitting || isViewMode} value={formData.aadhaarNumber} onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})} className="w-full px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" placeholder="1234 5678 9012" />
                
                {isEditMode && (
                  <div className="mt-3 flex items-center gap-2">
                    <input type="checkbox" id="aadhaar-verified" checked={formData.aadhaarVerified} onChange={(e) => setFormData({...formData, aadhaarVerified: e.target.checked})} className="rounded text-[#3B82F6]" />
                    <label htmlFor="aadhaar-verified" className="text-sm font-semibold text-[#8f9192]">Mark as Verified</label>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      </div>

      {/* Footer */}
      {!isViewMode && (
        <div className="px-6 py-4 border-t border-[#d6d9df] bg-[#f0f3f5] flex items-center justify-end gap-3 shrink-0">
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
