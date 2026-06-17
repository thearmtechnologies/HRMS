import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Loader2, User, CreditCard, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function CompleteProfile() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal'); // personal, bank, emergency, documents
  const [employeeData, setEmployeeData] = useState(null);
  
  const [formData, setFormData] = useState({
    personalEmail: "", mobile: "", gender: "", dob: "", maritalStatus: "", bloodGroup: "",
    address: "", city: "", state: "", pincode: "",
    bankName: "", branch: "", accountNo: "", ifscCode: "",
    kinName: "", relationship: "", kinPhone: "", kinAddress: "",
    panNumber: "", aadhaarNumber: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (user?.employeeId) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/employee?employeeId=${user.employeeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      // If endpoint returns array
      const emp = Array.isArray(data) ? data.find(e => e.employeeId === user.employeeId) : data;
      
      if (emp) {
        setEmployeeData(emp);
        setCompletionPercentage(emp.profileCompletion || 0);

        setFormData({
          personalEmail: emp.personalEmail || "",
          mobile: emp.mobile || "",
          gender: emp.gender || "",
          dob: emp.dob ? new Date(emp.dob).toISOString().split('T')[0] : "",
          maritalStatus: emp.maritalStatus || "",
          bloodGroup: emp.bloodGroup || "",
          address: emp.address || "",
          city: emp.city || "",
          state: emp.state || "",
          pincode: emp.pincode || "",
          bankName: emp.bankName || "",
          branch: emp.branch || "",
          accountNo: emp.accountNo || "",
          ifscCode: emp.ifscCode || "",
          kinName: emp.kinName || "",
          relationship: emp.relationship || "",
          kinPhone: emp.kinPhone || "",
          kinAddress: emp.kinAddress || "",
          panNumber: emp.documents?.pan?.number || "",
          aadhaarNumber: emp.documents?.aadhaar?.number || ""
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your employee record.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeData?._id) return;

    // --- Validation Logic ---
    const newErrors = [];
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.personalEmail && !emailRegex.test(formData.personalEmail.trim())) {
      newErrors.push("Invalid Personal Email format.");
    }
    if (formData.mobile && !phoneRegex.test(formData.mobile.trim())) {
      newErrors.push("Mobile Number must be 10 digits.");
    }
    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode.trim())) {
      newErrors.push("Pincode must be 6 digits.");
    }
    if (formData.accountNo && !/^[0-9]{9,18}$/.test(formData.accountNo.trim())) {
      newErrors.push("Account Number should be 9-18 digits.");
    }
    if (formData.ifscCode && !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(formData.ifscCode.trim())) {
      newErrors.push("Invalid IFSC Code format (e.g. SBIN0001234).");
    }
    if (formData.kinPhone && !phoneRegex.test(formData.kinPhone.trim())) {
      newErrors.push("Emergency Contact Phone must be 10 digits.");
    }
    if (formData.panNumber && !/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/.test(formData.panNumber.trim())) {
      newErrors.push("Invalid PAN Number format.");
    }
    const aadhaarClean = formData.aadhaarNumber?.replace(/\s/g, '');
    if (aadhaarClean && !/^[0-9]{12}$/.test(aadhaarClean)) {
      newErrors.push("Aadhaar Number must be 12 digits.");
    }

    if (newErrors.length > 0) {
      setError(newErrors.join(" "));
      return;
    }
    // --- End Validation Logic ---

    setIsSubmitting(true);
    setError(null);

    const payload = {
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
      kinName: formData.kinName,
      relationship: formData.relationship,
      kinPhone: formData.kinPhone,
      kinAddress: formData.kinAddress,
      bankDetails: {
        bankName: formData.bankName,
        branch: formData.branch,
        accountNo: formData.accountNo,
        ifscCode: formData.ifscCode,
      },
      documents: {
        pan: { number: formData.panNumber },
        aadhaar: { number: formData.aadhaarNumber }
      }
    };

    try {
      const res = await fetch(`http://localhost:5000/api/employee/self/${employeeData._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const updatedEmp = await res.json();

      if (res.ok) {
        setCompletionPercentage(updatedEmp.profileCompletion || 0);
        
        const currentTabIndex = tabs.findIndex(t => t.id === activeTab);
        if (currentTabIndex < tabs.length - 1) {
          // Move to next tab
          setActiveTab(tabs[currentTabIndex + 1].id);
        } else {
          // If it's the last tab, check if completed
          if (updatedEmp.profileCompleted) {
            navigate('/employee-dashboard');
          } else {
            const fieldLabels = {
              personalEmail: "Personal Email", mobile: "Mobile Number", gender: "Gender", dob: "Date of Birth", maritalStatus: "Marital Status", bloodGroup: "Blood Group",
              address: "Address", city: "City", state: "State", pincode: "Pincode",
              bankName: "Bank Name", branch: "Branch", accountNo: "Account Number", ifscCode: "IFSC Code",
              kinName: "Emergency Contact Name", relationship: "Emergency Contact Relationship", kinPhone: "Emergency Contact Phone", kinAddress: "Emergency Contact Address",
              panNumber: "PAN Number", aadhaarNumber: "Aadhaar Number"
            };
            const missing = Object.keys(fieldLabels).filter(k => !formData[k]);
            if (missing.length > 0) {
              setError(`Profile saved, but still incomplete. Missing fields: ${missing.map(m => fieldLabels[m]).join(', ')}.`);
            } else {
              setError("Profile saved, but some fields are pending approval or backend verification.");
            }
          }
        }
      } else {
        setError(updatedEmp.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!employeeData) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f0f3f5]"><Loader2 className="animate-spin text-[#3B82F6] h-8 w-8" /></div>;
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);
  const isLastTab = currentTabIndex === tabs.length - 1;

  return (
    <div className="min-h-screen bg-[#f0f3f5] p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-[#fdfdfe] rounded-2xl shadow-sm border border-[#d6d9df] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1E293B] p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Complete Your Profile</h1>
            <p className="text-[#bdc2c7] text-sm">Please provide the remaining details to set up your account.</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-[#bdc2c7] mb-2">Profile Completion</span>
            <div className="w-32 h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
            </div>
            <span className="text-xs font-bold text-white mt-1">{completionPercentage}% Completed</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex border-b border-[#d6d9df] px-4 pt-2 overflow-x-auto custom-scrollbar bg-white">
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

          <div className="p-6 overflow-y-auto space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold">
                {error}
              </div>
            )}

            {/* Tab Content: PERSONAL */}
            {activeTab === 'personal' && (
              <section className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Personal Email</label>
                    <input type="email" placeholder="example@email.com" disabled={isSubmitting} value={formData.personalEmail} onChange={(e) => setFormData({...formData, personalEmail: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Mobile Number</label>
                    <input type="tel" placeholder="9876543210" disabled={isSubmitting} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Birth</label>
                    <input type="date" disabled={isSubmitting} value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Gender</label>
                    <select disabled={isSubmitting} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Marital Status</label>
                    <select disabled={isSubmitting} value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
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
                    <select disabled={isSubmitting} value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
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
                  
                  <div className="md:col-span-2 mt-4">
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Address</label>
                    <input type="text" placeholder="123 Main St, Apt 4B" disabled={isSubmitting} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">City</label>
                    <input type="text" placeholder="Mumbai" disabled={isSubmitting} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">State</label>
                    <select disabled={isSubmitting} value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
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
                    <input type="text" placeholder="400001" disabled={isSubmitting} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                </div>
              </section>
            )}

            {/* Tab Content: BANK */}
            {activeTab === 'bank' && (
              <section className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4">
                  <strong>Note:</strong> Submitted bank details will be pending until HR approves them.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Bank Name</label>
                    <input type="text" placeholder="State Bank of India" disabled={isSubmitting} value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Branch</label>
                    <input type="text" placeholder="Andheri West" disabled={isSubmitting} value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Account Number</label>
                    <input type="text" placeholder="123456789012" disabled={isSubmitting} value={formData.accountNo} onChange={(e) => setFormData({...formData, accountNo: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">IFSC Code</label>
                    <input type="text" placeholder="SBIN0001234" disabled={isSubmitting} value={formData.ifscCode} onChange={(e) => setFormData({...formData, ifscCode: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all uppercase" />
                  </div>
                </div>
              </section>
            )}

            {/* Tab Content: EMERGENCY */}
            {activeTab === 'emergency' && (
              <section className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Name</label>
                    <input type="text" placeholder="John Doe" disabled={isSubmitting} value={formData.kinName} onChange={(e) => setFormData({...formData, kinName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Relationship</label>
                    <input type="text" placeholder="Father / Spouse" disabled={isSubmitting} value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Phone</label>
                    <input type="tel" placeholder="9876543210" disabled={isSubmitting} value={formData.kinPhone} onChange={(e) => setFormData({...formData, kinPhone: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Address</label>
                    <input type="text" placeholder="123 Main St, Apt 4B" disabled={isSubmitting} value={formData.kinAddress} onChange={(e) => setFormData({...formData, kinAddress: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                </div>
              </section>
            )}

            {/* Tab Content: DOCUMENTS */}
            {activeTab === 'documents' && (
              <section className="space-y-6 animate-in fade-in duration-200">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
                    <div className="flex justify-between items-center mb-3">
                      <label className="font-bold text-[#1E293B]">PAN Number</label>
                    </div>
                    <input type="text" disabled={isSubmitting || employeeData.documents?.pan?.verified} value={formData.panNumber} onChange={(e) => setFormData({...formData, panNumber: e.target.value})} className="w-full px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all uppercase" placeholder="ABCDE1234F" />
                    {employeeData.documents?.pan?.verified && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> Verified Document (Cannot edit)</p>}
                  </div>

                  <div className="bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
                    <div className="flex justify-between items-center mb-3">
                      <label className="font-bold text-[#1E293B]">Aadhaar Number</label>
                    </div>
                    <input type="text" disabled={isSubmitting || employeeData.documents?.aadhaar?.verified} value={formData.aadhaarNumber} onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})} className="w-full px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" placeholder="1234 5678 9012" />
                    {employeeData.documents?.aadhaar?.verified && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> Verified Document (Cannot edit)</p>}
                  </div>
                </div>
              </section>
            )}

          </div>

          <div className="px-6 py-4 border-t border-[#d6d9df] bg-[#f0f3f5] flex items-center justify-between shrink-0">
            <button 
              type="button" 
              onClick={() => {
                navigate('/employee-dashboard');
              }}
              className="text-sm font-semibold text-[#8f9192] hover:text-[#1E293B] transition-colors"
            >
              Skip for now
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 flex items-center gap-2 text-sm font-bold text-[#fdfdfe] bg-[#3B82F6] rounded-lg hover:bg-[#2563EB] shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {isSubmitting ? 'Saving...' : (isLastTab ? 'Save Details' : 'Save & Next')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
