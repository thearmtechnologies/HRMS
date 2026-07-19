import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Loader2, User, CreditCard, AlertCircle, FileText, CheckCircle2, UploadCloud, File, Download, Eye, AlertTriangle, Clock } from 'lucide-react';

export default function CompleteProfile() {
  const { user, login, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal'); // personal, bank, emergency, documents
  const [employeeData, setEmployeeData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
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

  const [uploadingDoc, setUploadingDoc] = useState({ pan: false, aadhaar: false });
  const [docUploadError, setDocUploadError] = useState({ pan: null, aadhaar: null });

  const handleDocumentUpload = async (docType, file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
      setDocUploadError(prev => ({ ...prev, [docType]: "Invalid file type. Only PDF, JPG, JPEG, and PNG allowed." }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocUploadError(prev => ({ ...prev, [docType]: "File size exceeds 10MB limit." }));
      return;
    }

    setUploadingDoc(prev => ({ ...prev, [docType]: true }));
    setDocUploadError(prev => ({ ...prev, [docType]: null }));

    try {
      const docFormData = new FormData();
      docFormData.append("document", file);
      
      const res = await fetch(`http://localhost:5000/api/employee/profile/me/documents/${docType}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: docFormData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to upload ${docType.toUpperCase()}`);
      }

      setEmployeeData(data.employee);
      setCompletionPercentage(data.employee.profileCompletion || completionPercentage);
    } catch (err) {
      console.error(err);
      setDocUploadError(prev => ({ ...prev, [docType]: err.message || "Upload failed. Please try again." }));
    } finally {
      setUploadingDoc(prev => ({ ...prev, [docType]: false }));
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/employee/profile/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      const emp = Array.isArray(data) ? data[0] : data;
      
      if (emp) {
        setEmployeeData(emp);
        setCompletionPercentage(emp.profileCompletion || 0);
        setImagePreview(emp.url || null);

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
    const employeeId = user?.employeeObjectId || employeeData?._id;
    if (!employeeId) {
      setError("Employee profile not found.");
      return;
    }

    // --- Validation Logic ---
    const newErrors = [];
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.mobile || !formData.mobile.trim()) {
      newErrors.push("Mobile Number is required for saving your profile.");
    } else if (!phoneRegex.test(formData.mobile.trim())) {
      newErrors.push("Mobile Number must be 10 digits.");
    }

    if (!formData.address || !formData.address.trim()) {
      newErrors.push("Address is required for saving your profile.");
    }

    if (formData.personalEmail && !emailRegex.test(formData.personalEmail.trim())) {
      newErrors.push("Invalid Personal Email format.");
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

    // If there is a profile image, upload it first
    if (profileImage) {
      try {
        const imageFormData = new FormData();
        imageFormData.append("image", profileImage);
        
        const imgRes = await fetch(`http://localhost:5000/api/employee/profile/me/image`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: imageFormData
        });
        
        if (!imgRes.ok) {
          const contentType = imgRes.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errData = await imgRes.json();
            throw new Error(errData.error || "Failed to upload image");
          } else {
            const errText = await imgRes.text();
            console.error("Backend returned non-JSON:", errText);
            throw new Error(`Failed to upload image. Server returned a ${imgRes.status} error.`);
          }
        } else {
          const imgData = await imgRes.json().catch(() => null);
          const newUrl = imgData?.employee?.url || imgData?.employee?.profileImage;
          if (newUrl && updateProfile) {
            updateProfile({ ...user, profileImage: newUrl });
            setImagePreview(newUrl);
          }
        }
        
        // Clear the selected file so we don't re-upload on subsequent tab saves
        setProfileImage(null);
      } catch (err) {
        console.error(err);
        let msg = err.message || "Failed to upload image";
        if (
          msg.includes("api_key") ||
          msg.includes("api_secret") ||
          msg.includes("cloud_name") ||
          msg.includes("Must supply") ||
          msg.includes("Invalid api_") ||
          msg.includes("401") ||
          msg.includes("500") ||
          msg.includes("Cloudinary")
        ) {
          msg = "We couldn't upload your profile photo right now due to a cloud storage configuration issue. Please try again later or contact HR/IT support.";
        }
        setError(msg);
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      personalEmail: formData.personalEmail || null,
      mobile: formData.mobile || null,
      gender: formData.gender || null,
      dob: formData.dob || null,
      maritalStatus: formData.maritalStatus || null,
      bloodGroup: formData.bloodGroup || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      pincode: formData.pincode || null,
      kinName: formData.kinName || null,
      relationship: formData.relationship || null,
      kinPhone: formData.kinPhone || null,
      kinAddress: formData.kinAddress || null,
      bankDetails: {
        bankName: formData.bankName || null,
        branch: formData.branch || null,
        accountNo: formData.accountNo || null,
        ifscCode: formData.ifscCode || null,
      },
      documents: {
        pan: { number: formData.panNumber || null },
        aadhaar: { number: formData.aadhaarNumber || null }
      }
    };

    try {
      const res = await fetch(`http://localhost:5000/api/employee/self/${employeeId}`, {
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
          // On the last tab, navigate to the employee dashboard without forcing completion
          navigate('/employee-dashboard');
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
    return <div className="min-h-full flex items-center justify-center bg-[#f0f3f5]"><Loader2 className="animate-spin text-[#3B82F6] h-8 w-8" /></div>;
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
    <div className="min-h-full bg-[#f0f3f5] p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-[#fdfdfe] rounded-2xl shadow-sm border border-[#d6d9df] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1E293B] p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Complete Your Profile</h1>
            <p className="text-[#bdc2c7] text-sm">You can complete the rest of the data afterwards at your convenience.</p>
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
                  <div className="md:col-span-2 mb-2">
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border border-[#d6d9df]">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-full h-full p-3 text-gray-400" />
                        )}
                      </div>
                      <input 
                        id="profileImageUpload"
                        name="profileImageUpload"
                        aria-label="Profile Image Upload"
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfileImage(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        disabled={isSubmitting}
                        className="text-sm text-[#1E293B] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#3B82F6]/10 file:text-[#3B82F6] hover:file:bg-[#3B82F6]/20 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="personalEmail" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Personal Email</label>
                    <input id="personalEmail" name="personalEmail" type="email" placeholder="example@email.com" disabled={isSubmitting} value={formData.personalEmail} onChange={(e) => setFormData({...formData, personalEmail: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                    <input id="mobile" name="mobile" type="tel" placeholder="9876543210" disabled={isSubmitting} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="dob" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Birth</label>
                    <input id="dob" name="dob" type="date" disabled={isSubmitting} value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Gender</label>
                    <select id="gender" name="gender" disabled={isSubmitting} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="maritalStatus" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Marital Status</label>
                    <select id="maritalStatus" name="maritalStatus" disabled={isSubmitting} value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bloodGroup" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Blood Group</label>
                    <select id="bloodGroup" name="bloodGroup" disabled={isSubmitting} value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
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
                    <label htmlFor="address" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Address <span className="text-red-500">*</span></label>
                    <input id="address" name="address" type="text" placeholder="123 Main St, Apt 4B" disabled={isSubmitting} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-[#8f9192] mb-1.5">City</label>
                    <input id="city" name="city" type="text" placeholder="Mumbai" disabled={isSubmitting} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-[#8f9192] mb-1.5">State</label>
                    <select id="state" name="state" disabled={isSubmitting} value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all">
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
                    <label htmlFor="pincode" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Pincode</label>
                    <input id="pincode" name="pincode" type="text" placeholder="400001" disabled={isSubmitting} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                </div>
              </section>
            )}

            {/* Tab Content: BANK */}
            {activeTab === 'bank' && (
              <section className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-[#8f9192] mb-2">💡 You can complete bank details afterwards whenever available.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="bankName" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Bank Name</label>
                    <input id="bankName" name="bankName" type="text" placeholder="State Bank of India" disabled={isSubmitting} value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="branch" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Branch</label>
                    <input id="branch" name="branch" type="text" placeholder="Andheri West" disabled={isSubmitting} value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="accountNo" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Account Number</label>
                    <input id="accountNo" name="accountNo" type="text" placeholder="123456789012" disabled={isSubmitting} value={formData.accountNo} onChange={(e) => setFormData({...formData, accountNo: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="ifscCode" className="block text-sm font-semibold text-[#8f9192] mb-1.5">IFSC Code</label>
                    <input id="ifscCode" name="ifscCode" type="text" placeholder="SBIN0001234" disabled={isSubmitting} value={formData.ifscCode} onChange={(e) => setFormData({...formData, ifscCode: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all uppercase" />
                  </div>
                </div>
              </section>
            )}

            {/* Tab Content: EMERGENCY */}
            {activeTab === 'emergency' && (
              <section className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-[#8f9192] mb-2">💡 You can complete emergency contact details afterwards whenever available.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="kinName" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Name</label>
                    <input id="kinName" name="kinName" type="text" placeholder="John Doe" disabled={isSubmitting} value={formData.kinName} onChange={(e) => setFormData({...formData, kinName: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="relationship" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Relationship</label>
                    <input id="relationship" name="relationship" type="text" placeholder="Father / Spouse" disabled={isSubmitting} value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="kinPhone" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Phone</label>
                    <input id="kinPhone" name="kinPhone" type="tel" placeholder="9876543210" disabled={isSubmitting} value={formData.kinPhone} onChange={(e) => setFormData({...formData, kinPhone: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="kinAddress" className="block text-sm font-semibold text-[#8f9192] mb-1.5">Contact Address</label>
                    <input id="kinAddress" name="kinAddress" type="text" placeholder="123 Main St, Apt 4B" disabled={isSubmitting} value={formData.kinAddress} onChange={(e) => setFormData({...formData, kinAddress: e.target.value})} className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] outline-none transition-all" />
                  </div>
                </div>
              </section>
            )}

            {/* Tab Content: DOCUMENTS */}
            {activeTab === 'documents' && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <p className="text-xs text-[#8f9192] mb-2">💡 You can upload or replace your documents afterwards whenever available.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PAN Card Upload Section */}
                  {(() => {
                    const isVerified = employeeData?.panStatus === 'verified' || employeeData?.documents?.pan?.verified;
                    const status = employeeData?.panStatus || (isVerified ? 'verified' : (employeeData?.documents?.pan?.fileUrl ? 'pending' : null));
                    const docInfo = employeeData?.documents?.pan;

                    return (
                      <div className="bg-[#fdfdfe] p-5 rounded-xl border border-[#d6d9df] shadow-sm flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-[#1E293B] flex items-center gap-2">
                                <FileText size={18} className="text-[#3B82F6]" /> PAN Card
                              </h3>
                              <p className="text-xs text-[#8f9192]">Upload official PAN document & number</p>
                            </div>
                            {status === 'verified' && (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Verified
                              </span>
                            )}
                            {status === 'pending' && (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                <Clock size={12} /> Pending Verification
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                <AlertTriangle size={12} /> Rejected
                              </span>
                            )}
                          </div>

                          <div className="mb-4">
                            <label htmlFor="panNumber" className="block text-xs font-bold text-[#8f9192] uppercase mb-1">PAN Number</label>
                            <input 
                              id="panNumber"
                              name="panNumber"
                              type="text" 
                              disabled={isSubmitting || isVerified} 
                              value={formData.panNumber} 
                              onChange={(e) => setFormData({...formData, panNumber: e.target.value})} 
                              className="w-full px-3.5 py-2 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-semibold outline-none transition-all uppercase disabled:opacity-60" 
                              placeholder="ABCDE1234F" 
                            />
                          </div>

                          {/* Uploaded File Details / Actions */}
                          {docInfo?.fileUrl ? (
                            <div className="bg-[#f0f3f5] p-3 rounded-lg border border-[#d6d9df] flex items-center justify-between">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <File className="text-[#3B82F6] shrink-0" size={24} />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[#1E293B] truncate">{docInfo.originalName || "pan_card_document"}</p>
                                  <p className="text-xs text-[#8f9192]">Uploaded {docInfo.uploadedAt ? new Date(docInfo.uploadedAt).toLocaleDateString() : 'Recently'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <a 
                                  href={docInfo.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Document"
                                >
                                  <Eye size={16} />
                                </a>
                                <a 
                                  href={docInfo.fileUrl} 
                                  download={docInfo.originalName || "pan_card"}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Download Document"
                                >
                                  <Download size={16} />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-xs text-gray-500">
                              No document file uploaded yet.
                            </div>
                          )}

                          {docUploadError.pan && (
                            <p className="text-xs text-red-600 mt-2 font-medium">{docUploadError.pan}</p>
                          )}
                        </div>

                        {/* Upload / Replace Controls */}
                        {!isVerified ? (
                          <div className="pt-2 border-t border-[#f0f3f5]">
                            <label htmlFor="panDocUpload" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f0f3f5] hover:bg-[#e4e7ec] text-[#1E293B] font-bold text-xs rounded-lg cursor-pointer border border-[#d6d9df] transition-all">
                              {uploadingDoc.pan ? (
                                <>
                                  <Loader2 size={15} className="animate-spin text-[#3B82F6]" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <UploadCloud size={16} className="text-[#3B82F6]" />
                                  {docInfo?.fileUrl ? "Replace Document File" : "Upload Document File"}
                                </>
                              )}
                              <input 
                                id="panDocUpload"
                                name="panDocUpload"
                                type="file" 
                                className="hidden" 
                                disabled={uploadingDoc.pan || isVerified} 
                                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                onChange={(e) => handleDocumentUpload('pan', e.target.files[0])} 
                              />
                            </label>
                            <p className="text-[10px] text-[#8f9192] text-center mt-1">Supports PDF, JPG, JPEG, PNG (Max 10MB)</p>
                          </div>
                        ) : (
                          <p className="text-xs text-green-600 font-semibold text-center pt-2 border-t border-[#f0f3f5] flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} /> Verified document cannot be replaced
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Aadhaar Card Upload Section */}
                  {(() => {
                    const isVerified = employeeData?.aadhaarStatus === 'verified' || employeeData?.documents?.aadhaar?.verified;
                    const status = employeeData?.aadhaarStatus || (isVerified ? 'verified' : (employeeData?.documents?.aadhaar?.fileUrl ? 'pending' : null));
                    const docInfo = employeeData?.documents?.aadhaar;

                    return (
                      <div className="bg-[#fdfdfe] p-5 rounded-xl border border-[#d6d9df] shadow-sm flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-[#1E293B] flex items-center gap-2">
                                <FileText size={18} className="text-[#3B82F6]" /> Aadhaar Card
                              </h3>
                              <p className="text-xs text-[#8f9192]">Upload official Aadhaar document & number</p>
                            </div>
                            {status === 'verified' && (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Verified
                              </span>
                            )}
                            {status === 'pending' && (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                <Clock size={12} /> Pending Verification
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                <AlertTriangle size={12} /> Rejected
                              </span>
                            )}
                          </div>

                          <div className="mb-4">
                            <label htmlFor="aadhaarNumber" className="block text-xs font-bold text-[#8f9192] uppercase mb-1">Aadhaar Number</label>
                            <input 
                              id="aadhaarNumber"
                              name="aadhaarNumber"
                              type="text" 
                              disabled={isSubmitting || isVerified} 
                              value={formData.aadhaarNumber} 
                              onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})} 
                              className="w-full px-3.5 py-2 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#1E293B] font-semibold outline-none transition-all disabled:opacity-60" 
                              placeholder="1234 5678 9012" 
                            />
                          </div>

                          {/* Uploaded File Details / Actions */}
                          {docInfo?.fileUrl ? (
                            <div className="bg-[#f0f3f5] p-3 rounded-lg border border-[#d6d9df] flex items-center justify-between">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <File className="text-[#3B82F6] shrink-0" size={24} />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[#1E293B] truncate">{docInfo.originalName || "aadhaar_card_document"}</p>
                                  <p className="text-xs text-[#8f9192]">Uploaded {docInfo.uploadedAt ? new Date(docInfo.uploadedAt).toLocaleDateString() : 'Recently'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <a 
                                  href={docInfo.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Document"
                                >
                                  <Eye size={16} />
                                </a>
                                <a 
                                  href={docInfo.fileUrl} 
                                  download={docInfo.originalName || "aadhaar_card"}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Download Document"
                                >
                                  <Download size={16} />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-xs text-gray-500">
                              No document file uploaded yet.
                            </div>
                          )}

                          {docUploadError.aadhaar && (
                            <p className="text-xs text-red-600 mt-2 font-medium">{docUploadError.aadhaar}</p>
                          )}
                        </div>

                        {/* Upload / Replace Controls */}
                        {!isVerified ? (
                          <div className="pt-2 border-t border-[#f0f3f5]">
                            <label htmlFor="aadhaarDocUpload" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f0f3f5] hover:bg-[#e4e7ec] text-[#1E293B] font-bold text-xs rounded-lg cursor-pointer border border-[#d6d9df] transition-all">
                              {uploadingDoc.aadhaar ? (
                                <>
                                  <Loader2 size={15} className="animate-spin text-[#3B82F6]" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <UploadCloud size={16} className="text-[#3B82F6]" />
                                  {docInfo?.fileUrl ? "Replace Document File" : "Upload Document File"}
                                </>
                              )}
                              <input 
                                id="aadhaarDocUpload"
                                name="aadhaarDocUpload"
                                type="file" 
                                className="hidden" 
                                disabled={uploadingDoc.aadhaar || isVerified} 
                                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                onChange={(e) => handleDocumentUpload('aadhaar', e.target.files[0])} 
                              />
                            </label>
                            <p className="text-[10px] text-[#8f9192] text-center mt-1">Supports PDF, JPG, JPEG, PNG (Max 10MB)</p>
                          </div>
                        ) : (
                          <p className="text-xs text-green-600 font-semibold text-center pt-2 border-t border-[#f0f3f5] flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} /> Verified document cannot be replaced
                          </p>
                        )}
                      </div>
                    );
                  })()}
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
