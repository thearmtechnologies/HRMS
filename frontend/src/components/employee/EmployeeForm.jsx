import React, { useState, useEffect } from 'react';
import { Loader2, User, Briefcase, ChevronDown, Save, CreditCard, AlertCircle, FileText, CheckCircle2, IndianRupee, ShieldCheck } from 'lucide-react';
import { payrollConfigService } from '../../services/payrollConfigService';
import EmployeeSalaryAdvances from './EmployeeSalaryAdvances';

const PERMISSION_CONFIG = {
  dashboard: { label: 'Dashboard', actions: ['view'] },
  employee_management: { label: 'Employee Management', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  verification_center: { label: 'Verification Center', actions: ['view', 'approve'] },
  attendance: { label: 'Attendance', actions: ['view', 'regularize'] },
  team_attendance: { label: 'Team Attendance', actions: ['view', 'export'] },
  leave_management: { label: 'Leave Management', actions: ['view', 'approve'] },
  payroll: { label: 'Payroll', actions: ['view', 'create', 'edit', 'generate', 'approve', 'mark_paid', 'export'] },
  departments: { label: 'Departments', actions: ['view', 'create', 'edit', 'delete'] },
  projects: { label: 'Projects', actions: ['view', 'create', 'assign', 'edit', 'archive'] },
  reports: { label: 'Reports', actions: ['view', 'export'] },
  settings: { label: 'Settings', actions: ['view', 'edit'] },
  holiday_management: { label: 'Holiday Management', actions: ['view', 'create', 'edit', 'delete'] },
  shift_management: { label: 'Shift Management', actions: ['view', 'create', 'edit', 'delete'] },
  site_management: { label: 'Site Management', actions: ['view', 'create', 'edit', 'delete'] },
  notes: { label: 'Notes', actions: ['view', 'create', 'edit', 'delete'] },
  virtual_id: { label: 'Virtual ID', actions: ['view'] },
  employee_profile: { label: 'Employee Profile', actions: ['view', 'edit'] }
};

export default function EmployeeForm({ 
  mode = 'create', // 'create', 'edit', 'view'
  initialData = null,
  departments, 
  availableShifts = [],
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
    panNumber: "", panVerified: false, aadhaarNumber: "", aadhaarVerified: false,
    shift: "", payrollTemplate: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [componentsDict, setComponentsDict] = useState({});
  const [permissionOverrides, setPermissionOverrides] = useState(null);
  const [hasOverrides, setHasOverrides] = useState(false);

  useEffect(() => {
    if (initialData && (isEditMode || isViewMode)) {
      const deptId = initialData.department ? (initialData.department._id || initialData.department) : "";

      // Lookup user for this employee to get role? The initialData might not have role directly unless populated or passed.
      // Assuming role is available or we default it.
      
      setFormData({
        shift: initialData.shift ? (initialData.shift._id || initialData.shift) : "",
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
        role: initialData.user?.role || initialData.role || "employee",
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
        payrollTemplate: "" // We don't populate this directly in edit mode for now, as salary assignment is separate
      });

      if (initialData.user?.permissionOverrides && initialData.user.permissionOverrides.length > 0) {
        setPermissionOverrides(initialData.user.permissionOverrides);
        setHasOverrides(true);
      } else {
        setPermissionOverrides([]);
        setHasOverrides(false);
      }
    } else {
      // Reset for create
      setFormData({ 
        firstName: "", lastName: "", email: "", personalEmail: "", mobile: "",
        gender: "", dob: "", maritalStatus: "", bloodGroup: "",
        address: "", city: "", state: "", pincode: "",
        employeeId: "", department: "", designation: "", role: "employee", workLocation: "", joinDate: "", status: "Active", employmentType: "Full-time", annualSalary: "", reportingManager: "",
        bankName: "", branch: "", accountNo: "", ifscCode: "",
        kinName: "", relationship: "", kinPhone: "", kinAddress: "",
        panNumber: "", panVerified: false, aadhaarNumber: "", aadhaarVerified: false, payrollTemplate: ""
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

    // Fetch active designations
    fetch('http://localhost:5000/api/settings/designations/active', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setDesignations(data))
      .catch(err => console.error("Error fetching designations:", err));

    // Fetch roles
    fetch('http://localhost:5000/api/settings/roles', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setRoles(data))
      .catch(err => console.error("Error fetching roles:", err));

    // Fetch payroll templates and components using the service
    payrollConfigService.getAllTemplates()
      .then(data => setTemplates(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])))
      .catch(err => console.error("Error fetching templates:", err));

    payrollConfigService.getAllComponents()
      .then(data => {
        const comps = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        const dict = {};
        comps.forEach(c => dict[c._id] = c);
        setComponentsDict(dict);
      })
      .catch(err => console.error("Error fetching components:", err));
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
          role: formData.role,
          shift: formData.shift || null
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
          shift: formData.shift || null,
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

      if (res.ok && isCreateMode && formData.payrollTemplate) {
        const template = templates.find(t => t._id === formData.payrollTemplate);
        if (template && responseData.employee?._id) {
          const assignedComponents = (template.components || []).map(ref => {
            // ref is just the component ObjectId string
            const cDetails = componentsDict[ref];
            return {
              component: ref,
              value: cDetails ? cDetails.defaultValue : 0
            };
          });

          // Create salary assignment
          await fetch(`http://localhost:5000/api/pay/salary-fixed/employee/${responseData.employee._id}`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              employeeId: responseData.employee._id,
              templateId: template._id,
              assignedComponents,
              effectiveDate: formData.joinDate || new Date().toISOString().split('T')[0],
              overtimeRate: 0
            })
          });
        }
      }

      if (res.ok && isEditMode) {
        // Handle Permissions Update
        const permPayload = hasOverrides ? permissionOverrides : null;
        await fetch(`http://localhost:5000/api/employee/${initialData._id}/permissions`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ permissions: permPayload })
        });
      }

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

  const getRoleDefaults = () => {
    const activeRole = roles.find(r => r.name === formData.role);
    return activeRole ? activeRole.permissions : [];
  };

  const handlePermissionToggle = (moduleName, action, roleDefaultValue) => {
    if (isViewMode) return;
    
    let currentOverrides = permissionOverrides ? [...permissionOverrides] : [];
    let moduleOverride = currentOverrides.find(p => p.module === moduleName);
    
    if (!moduleOverride) {
      // First time overriding this module, start with role defaults
      const rolePerm = getRoleDefaults().find(p => p.module === moduleName);
      moduleOverride = { module: moduleName, view: false, create: false, edit: false, delete: false, approve: false, export: false, regularize: false, generate: false, mark_paid: false, assign: false, archive: false };
      if (rolePerm) {
        Object.assign(moduleOverride, rolePerm);
      }
      currentOverrides.push(moduleOverride);
    }
    
    // Toggle the value
    const currentValue = moduleOverride[action];
    moduleOverride[action] = !currentValue;
    
    setPermissionOverrides(currentOverrides);
    setHasOverrides(true);
  };

  const resetToRoleDefaults = () => {
    if (isViewMode) return;
    setPermissionOverrides([]);
    setHasOverrides(false);
  };

  const getPermissionValueAndState = (moduleName, action) => {
    const roleDefaults = getRoleDefaults();
    const rolePerm = roleDefaults.find(p => p.module === moduleName);
    const roleValue = rolePerm ? rolePerm[action] : false;
    
    if (hasOverrides && permissionOverrides) {
      const overridePerm = permissionOverrides.find(p => p.module === moduleName);
      if (overridePerm) {
        const overrideValue = overridePerm[action];
        return {
          value: overrideValue,
          isOverride: overrideValue !== roleValue,
          isInherited: overrideValue === roleValue
        };
      }
    }
    
    return {
      value: roleValue,
      isOverride: false,
      isInherited: true
    };
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
    { id: 'documents', label: 'Documents', icon: FileText },
    ...((isEditMode || isViewMode) ? [{ id: 'permissions', label: 'Permissions', icon: ShieldCheck }] : [])
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
                <label htmlFor="empFirstName" className="block text-sm font-semibold text-[#8f9192] mb-1.5">First Name *</label>
                <input id="empFirstName" name="firstName" type="text" required disabled={isSubmitting || isViewMode} value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="e.g. John" />
              </div>
              <div>
                <label htmlFor="empLastName" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Last Name *</label>
                <input id="empLastName" name="lastName" type="text" required disabled={isSubmitting || isViewMode} value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="e.g. Doe" />
              </div>
              <div>
                <label htmlFor="empWorkEmail" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Work Email *</label>
                <input id="empWorkEmail" name="email" type="email" required disabled={isSubmitting || isViewMode} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7] disabled:opacity-70" placeholder="john.doe@ARM.com" />
              </div>
              
              {!isCreateMode && (
                <>
                  <div>
                    <label htmlFor="empPersonalEmail" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Personal Email</label>
                    <input id="empPersonalEmail" name="personalEmail" type="email" disabled={isSubmitting || isViewMode} value={formData.personalEmail} onChange={(e) => setFormData({...formData, personalEmail: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="empMobile" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Mobile Number</label>
                    <input id="empMobile" name="mobile" type="tel" disabled={isSubmitting || isViewMode} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="empDob" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Birth</label>
                    <input id="empDob" name="dob" type="date" disabled={isSubmitting || isViewMode} value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="empGender" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Gender</label>
                    <select id="empGender" name="gender" disabled={isSubmitting || isViewMode} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="empMaritalStatus" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Marital Status</label>
                    <select id="empMaritalStatus" name="maritalStatus" disabled={isSubmitting || isViewMode} value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="empBloodGroup" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Blood Group</label>
                    <select id="empBloodGroup" name="bloodGroup" disabled={isSubmitting || isViewMode} value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
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
                  <label htmlFor="empAddress" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Address</label>
                  <input id="empAddress" name="address" type="text" disabled={isSubmitting || isViewMode} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                </div>
                <div>
                  <label htmlFor="empCity" className="block text-sm font-semibold text-[#8f9192] mb-1.5">City</label>
                  <input id="empCity" name="city" type="text" disabled={isSubmitting || isViewMode} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                </div>
                <div>
                  <label htmlFor="empState" className="block text-sm font-semibold text-[#8f9192] mb-1.5">State</label>
                  <select id="empState" name="state" disabled={isSubmitting || isViewMode} value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
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
                  <label htmlFor="empPincode" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Pincode</label>
                  <input id="empPincode" name="pincode" type="text" disabled={isSubmitting || isViewMode} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
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
                  <label htmlFor="empIdField" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Employee ID</label>
                  <input id="empIdField" name="employeeId" type="text" disabled value={formData.employeeId} className="w-full px-4 py-2.5 bg-[#e2e6ea] border border-[#d6d9df] rounded-lg text-[#1E293B] font-bold" />
                </div>
              )}
              
              {isCreateMode && (
                <div>
                  <label htmlFor="empSystemRole" className="block text-sm font-semibold text-[#8f9192] mb-1.5">System Role *</label>
                  <select id="empSystemRole" name="role" required disabled={isSubmitting || isViewMode} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="empDepartment" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Department *</label>
                <div className="relative">
                  <select id="empDepartment" name="department" required disabled={isSubmitting || isViewMode} value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full appearance-none px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all cursor-pointer disabled:opacity-70">
                    <option value="" disabled>Select Department</option>
                    {departments && departments.map(dept => <option key={dept._id} value={dept._id}>{dept.departmentName}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="empDesignation" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Designation *</label>
                <div className="relative">
                  <select id="empDesignation" name="designation" required disabled={isSubmitting || isViewMode} value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="w-full appearance-none px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all cursor-pointer disabled:opacity-70">
                    <option value="" disabled>Select Designation</option>
                    {designations.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    {/* Fallback for old designations not in DB */}
                    {formData.designation && !designations.some(d => d.name === formData.designation) && (
                      <option value={formData.designation}>{formData.designation} (Legacy)</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="empWorkLocation" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Work Location *</label>
                <input id="empWorkLocation" name="workLocation" type="text" required disabled={isSubmitting || isViewMode} value={formData.workLocation} onChange={(e) => setFormData({...formData, workLocation: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] outline-none transition-all" placeholder="e.g. Mumbai HQ" />
              </div>

              <div>
                <label htmlFor="empShift" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Working Shift</label>
                <div className="relative">
                  <select id="empShift" name="shift" disabled={isSubmitting || isViewMode} value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} className="w-full appearance-none px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all cursor-pointer disabled:opacity-70">
                    <option value="">Default Company Shift</option>
                    {availableShifts && availableShifts.map(shift => <option key={shift._id} value={shift._id}>{shift.name} ({shift.startTime} - {shift.endTime})</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="empJoinDate" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Joining *</label>
                <input id="empJoinDate" name="joinDate" type="date" required disabled={isSubmitting || isViewMode} value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] outline-none transition-all" />
              </div>

              {!isCreateMode && (
                <>
                  <div>
                    <label htmlFor="empEmploymentType" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Employment Type</label>
                    <select id="empEmploymentType" name="employmentType" disabled={isSubmitting || isViewMode} value={formData.employmentType} onChange={(e) => setFormData({...formData, employmentType: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="empStatus" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Status</label>
                    <select id="empStatus" name="status" disabled={isSubmitting || isViewMode} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all font-bold text-[#3B82F6]">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </>
              )}

              {isCreateMode && (
                <div className="md:col-span-2">
                  <label htmlFor="payrollTemplate" className="block text-sm font-semibold text-[#1E293B] mb-1.5 flex items-center gap-2">
                    <IndianRupee size={16} className="text-[#3B82F6]" />
                    Assign Payroll Template
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Select a predefined salary structure. Values can be adjusted later from the employee profile.</p>
                  <div className="relative">
                    <select 
                      id="payrollTemplate" 
                      name="payrollTemplate" 
                      disabled={isSubmitting} 
                      value={formData.payrollTemplate} 
                      onChange={(e) => setFormData({...formData, payrollTemplate: e.target.value})} 
                      className="w-full appearance-none px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="">No Salary Assigned (Configure Later)</option>
                      {templates.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
                  </div>
                </div>
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
                <label htmlFor="empBankName" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Bank Name</label>
                <input id="empBankName" name="bankName" type="text" disabled={isSubmitting || isViewMode} value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="empBranch" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Branch</label>
                <input id="empBranch" name="branch" type="text" disabled={isSubmitting || isViewMode} value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="empAccountNo" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Account Number</label>
                <input id="empAccountNo" name="accountNo" type="text" disabled={isSubmitting || isViewMode} value={formData.accountNo} onChange={(e) => setFormData({...formData, accountNo: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="empIfscCode" className="block text-sm font-semibold text-[#8f9192] mb-1.5">IFSC Code</label>
                <input id="empIfscCode" name="ifscCode" type="text" disabled={isSubmitting || isViewMode} value={formData.ifscCode} onChange={(e) => setFormData({...formData, ifscCode: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all uppercase" />
              </div>
            </div>

            <EmployeeSalaryAdvances employeeId={initialData?._id} />
          </section>
        )}

        {/* Tab Content: EMERGENCY */}
        {!isCreateMode && activeTab === 'emergency' && (
          <section className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="empKinName" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Name</label>
                <input id="empKinName" name="kinName" type="text" disabled={isSubmitting || isViewMode} value={formData.kinName} onChange={(e) => setFormData({...formData, kinName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="empRelationship" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Relationship</label>
                <input id="empRelationship" name="relationship" type="text" disabled={isSubmitting || isViewMode} value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="empKinPhone" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Phone</label>
                <input id="empKinPhone" name="kinPhone" type="tel" disabled={isSubmitting || isViewMode} value={formData.kinPhone} onChange={(e) => setFormData({...formData, kinPhone: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="empKinAddress" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Address</label>
                <input id="empKinAddress" name="kinAddress" type="text" disabled={isSubmitting || isViewMode} value={formData.kinAddress} onChange={(e) => setFormData({...formData, kinAddress: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
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
                  <label htmlFor="empPanNumber" className="font-bold text-[#1E293B]">PAN Number</label>
                  {formData.panVerified ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 size={14}/> Verified</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md"><AlertCircle size={14}/> Unverified</span>
                  )}
                </div>
                <input id="empPanNumber" name="panNumber" type="text" disabled={isSubmitting || isViewMode} value={formData.panNumber} onChange={(e) => setFormData({...formData, panNumber: e.target.value})} className="w-full px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all uppercase" placeholder="ABCDE1234F" />
                
                {isEditMode && (
                  <div className="mt-3 flex items-center gap-2">
                    <input type="checkbox" id="pan-verified" name="panVerified" checked={formData.panVerified} onChange={(e) => setFormData({...formData, panVerified: e.target.checked})} className="rounded text-[#3B82F6]" />
                    <label htmlFor="pan-verified" className="text-sm font-semibold text-[#8f9192]">Mark as Verified</label>
                  </div>
                )}
              </div>

              <div className="bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="empAadhaarNumber" className="font-bold text-[#1E293B]">Aadhaar Number</label>
                  {formData.aadhaarVerified ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 size={14}/> Verified</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md"><AlertCircle size={14}/> Unverified</span>
                  )}
                </div>
                <input id="empAadhaarNumber" name="aadhaarNumber" type="text" disabled={isSubmitting || isViewMode} value={formData.aadhaarNumber} onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})} className="w-full px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" placeholder="1234 5678 9012" />
                
                {isEditMode && (
                  <div className="mt-3 flex items-center gap-2">
                    <input type="checkbox" id="aadhaar-verified" name="aadhaarVerified" checked={formData.aadhaarVerified} onChange={(e) => setFormData({...formData, aadhaarVerified: e.target.checked})} className="rounded text-[#3B82F6]" />
                    <label htmlFor="aadhaar-verified" className="text-sm font-semibold text-[#8f9192]">Mark as Verified</label>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      </div>

      {/* Tab Content: PERMISSIONS */}
      {(isEditMode || isViewMode) && activeTab === 'permissions' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
            <div>
              <h3 className="text-[#1E293B] font-bold text-lg flex items-center gap-2">
                <ShieldCheck className="text-[#3B82F6]" size={20} />
                User Permission Overrides
              </h3>
              <p className="text-[#64748B] text-sm mt-1">
                Customize access specifically for this employee. Overrides replace the base role permissions.
              </p>
            </div>
            {!isViewMode && (
              <button 
                type="button"
                onClick={resetToRoleDefaults}
                disabled={!hasOverrides}
                className="px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#1E293B] text-sm font-bold rounded-lg shadow-sm hover:bg-[#F5F7FB] transition-all disabled:opacity-50"
              >
                Reset to Role Defaults
              </button>
            )}
          </div>

          <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f3f5] border-b border-[#d6d9df]">
                    <th className="p-4 font-bold text-[#1E293B] w-1/4">Module</th>
                    <th className="p-4 font-bold text-[#1E293B]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6d9df]">
                  {Object.entries(PERMISSION_CONFIG).map(([moduleKey, config]) => (
                    <tr key={moduleKey} className="hover:bg-[#F5F7FB] transition-colors">
                      <td className="p-4 font-semibold text-[#1E293B] align-top">{config.label}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-4">
                          {config.actions.map(action => {
                            const { value, isOverride, isInherited } = getPermissionValueAndState(moduleKey, action);
                            return (
                              <label htmlFor={`perm_override_${moduleKey}_${action}`} key={action} className={`flex items-center gap-2 p-2 rounded-lg border ${isOverride ? 'bg-[#FFFBEB] border-[#FCD34D]' : 'bg-[#fdfdfe] border-[#d6d9df]'} cursor-pointer hover:shadow-sm transition-all relative`}>
                                <input 
                                  id={`perm_override_${moduleKey}_${action}`}
                                  name={`perm_override_${moduleKey}_${action}`}
                                  type="checkbox" 
                                  checked={value}
                                  disabled={isViewMode}
                                  onChange={() => handlePermissionToggle(moduleKey, action, isInherited ? value : undefined)}
                                  className={`w-4 h-4 rounded ${isOverride ? 'text-[#D97706]' : 'text-[#3B82F6]'} border-[#cbd5e1] focus:ring-0`}
                                />
                                <span className="text-sm font-semibold text-[#1E293B] capitalize">{action.replace('_', ' ')}</span>
                                
                                {isOverride && (
                                  <span className="absolute -top-2 -right-2 text-[9px] font-bold bg-[#F59E0B] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    Override
                                  </span>
                                )}
                                {!isOverride && value && (
                                  <span className="absolute -top-2 -right-2 text-[9px] font-bold bg-[#10B981] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    Inherited
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}


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
