import React, { useState, useEffect, useContext } from "react";
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  QrCode, 
  RefreshCcw, 
  ShieldCheck,
  Droplet,
  IdCard,
  Printer,
  Loader2
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import logo from "../../assets/logo.jpeg";

export default function VirtualID() {
  const { user } = useContext(AuthContext);
  const [isFlipped, setIsFlipped] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch(`http://localhost:5000/api/employee/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const emp = Array.isArray(data) ? data[0] : data;
        setEmployeeData(emp || null);
      }
    } catch (err) {
      console.error("Error fetching employee profile for Virtual ID:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format real or fallback employee details
  const empName = employeeData?.firstName 
    ? `${employeeData.firstName} ${employeeData.lastName || ''}`.trim() 
    : (user?.employeeName || user?.fullName || "Employee Profile");
  const designation = employeeData?.designation || user?.designation || "Staff Member";
  const department = employeeData?.department?.departmentName || employeeData?.department || user?.department?.departmentName || "General Operations";
  const empId = employeeData?.employeeCode || employeeData?.empId || user?.employeeCode || "EMP-ID";
  const bloodGroup = employeeData?.bloodGroup || "O+";
  const email = employeeData?.email || user?.email || "employee@armhrms.com";
  const phone = employeeData?.contactNumber || employeeData?.phone || user?.contactNumber || "+91 98765 43210";
  const emergencyContact = employeeData?.emergencyContact || phone;
  const address = employeeData?.address || "Level 4, Tech Park, Andheri East, Mumbai, Maharashtra 400069";
  
  const profileImage = employeeData?.url || user?.url || "https://i.pravatar.cc/300?img=11";
  
  const issueDate = employeeData?.joiningDate 
    ? new Date(employeeData.joiningDate).toLocaleDateString('en-GB') 
    : "10 Jun 2026";
  const validTill = "31 Dec 2030";

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#f7fafc] font-sans">
        <Loader2 className="w-8 h-8 text-[#1e40af] animate-spin mb-3" />
        <p className="text-sm font-semibold text-[#718096]">Generating Digital ID Card...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f7fafc] flex flex-col items-center justify-center p-3 sm:p-5 font-sans overflow-x-hidden">
      
      {/* Print Specific Styles for side-by-side export */}
      <style>{`
        @media print {
          body, html, #root {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-hidden {
            display: none !important;
          }
          .print-container {
            display: flex !important;
            flex-direction: row !important;
            justify-content: center !important;
            align-items: flex-start !important;
            gap: 24px !important;
            padding: 20px !important;
            width: 100% !important;
            height: auto !important;
            perspective: none !important;
          }
          .print-card-wrapper {
            transform: none !important;
            position: static !important;
            display: flex !important;
            flex-direction: row !important;
            gap: 24px !important;
            width: auto !important;
            height: auto !important;
            box-shadow: none !important;
          }
          .print-card-face {
            position: relative !important;
            transform: none !important;
            backface-visibility: visible !important;
            width: 300px !important;
            height: 460px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 16px !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            page-break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="text-center mb-4 sm:mb-6 print-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2d3748] mb-1 flex items-center justify-center gap-2 sm:gap-3">
          <IdCard className="text-[#1e40af]" size={28} />
          Digital ID Card
        </h1>
        <p className="text-xs sm:text-sm text-[#718096]">Your official verifiable company identification.</p>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-5 print-hidden">
        <button 
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-4 sm:px-5 py-2 bg-[#1e40af] text-white text-xs sm:text-sm font-bold rounded-lg shadow hover:bg-[#1e3a8a] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <RefreshCcw size={16} className={isFlipped ? "rotate-180 transition-transform duration-500" : "transition-transform duration-500"} />
          {isFlipped ? "Show Front Side" : "Flip to Back Side"}
        </button>

        <button 
          onClick={handlePrint}
          className="px-4 sm:px-5 py-2 bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-lg shadow hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          title="Print or Export Both Sides side-by-side as PDF"
        >
          <Printer size={16} />
          Print / Export ID (Both Sides)
        </button>
      </div>

      {/* 3D Scene Container */}
      <div 
        className="relative w-[290px] h-[450px] sm:w-[310px] sm:h-[475px] [perspective:1000px] group cursor-pointer print-container" 
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Card Wrapper that rotates on screen, turns into side-by-side flex row on print */}
        <div 
          className="w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] shadow-xl rounded-2xl print-card-wrapper"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          
          {/* ======================= FRONT OF CARD ======================= */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-2xl [backface-visibility:hidden] overflow-hidden border border-[#e2e8f0] flex flex-col print-card-face">
            
            {/* Top Brand Banner */}
            <div className="h-24 sm:h-28 bg-[#1e40af] relative flex flex-col items-center justify-start pt-4 sm:pt-5 shrink-0">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
              
              <div className="flex items-center gap-2 text-white z-10">
                <img src={logo} alt="ARM Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain rounded bg-white p-0.5 shadow-sm" />
                <span className="font-bold tracking-widest text-base sm:text-lg">ARM HRMS</span>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="relative flex justify-center -mt-12 sm:-mt-14 z-20 shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-white shadow-md">
                <img 
                  src={profileImage} 
                  alt={empName} 
                  className="w-full h-full rounded-full object-cover border border-[#e2e8f0]"
                  onError={(e) => { e.target.src = "https://i.pravatar.cc/300?img=11"; }}
                />
              </div>
            </div>

            {/* Employee Core Details */}
            <div className="text-center px-4 sm:px-6 mt-2.5 sm:mt-3 mb-3 sm:mb-4 shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#2d3748] leading-tight truncate">{empName}</h2>
              <p className="text-xs sm:text-sm font-semibold text-[#1e40af] mt-0.5 truncate">{designation}</p>
              <p className="text-[10px] sm:text-xs text-[#718096] uppercase tracking-wider mt-0.5 truncate">{department}</p>
            </div>

            {/* Data Grid */}
            <div className="px-5 sm:px-6 grid grid-cols-2 gap-y-3 gap-x-2 text-xs sm:text-sm mt-auto mb-4">
              <div>
                <p className="text-[9px] sm:text-[10px] text-[#718096] uppercase tracking-wider font-semibold">ID Number</p>
                <p className="font-bold text-[#2d3748] truncate">{empId}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-[#718096] uppercase tracking-wider font-semibold">Blood Group</p>
                <p className="font-bold text-red-600 flex items-center gap-1">
                  <Droplet size={11} className="fill-current shrink-0" /> {bloodGroup}
                </p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-[#718096] uppercase tracking-wider font-semibold">Issued On</p>
                <p className="font-semibold text-[#2d3748]">{issueDate}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-[#718096] uppercase tracking-wider font-semibold">Valid Till</p>
                <p className="font-semibold text-[#2d3748]">{validTill}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f7fafc] py-2.5 sm:py-3 text-center border-t border-[#e2e8f0] mt-auto shrink-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-[#718096] uppercase flex items-center justify-center gap-1">
                <ShieldCheck size={13} /> Official Company Identity
              </p>
            </div>
          </div>

          {/* ======================= BACK OF CARD ======================= */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden border border-[#e2e8f0] flex flex-col print-card-face">
            
            {/* Top Accent Line */}
            <div className="h-2 w-full bg-[#1e40af] shrink-0"></div>

            <div className="p-4 sm:p-5 flex flex-col h-full justify-between">
              
              {/* Instructions */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#2d3748] border-b border-[#e2e8f0] pb-1.5 mb-2 sm:mb-2.5">Terms & Conditions</h3>
                <ul className="text-[10px] sm:text-[11px] text-[#718096] list-disc pl-3.5 space-y-1 text-justify leading-snug">
                  <li>This card is the property of ARM HRMS.</li>
                  <li>Must be worn visibly while on premises.</li>
                  <li>Transferring or sharing is strictly prohibited.</li>
                  <li>If found, please return to the address below.</li>
                </ul>
              </div>

              {/* Emergency Contact */}
              <div className="bg-[#f7fafc] p-2.5 rounded-lg border border-[#e2e8f0] my-2 sm:my-2.5">
                <p className="text-[10px] sm:text-xs font-bold text-[#1e40af] mb-0.5">Emergency Contact</p>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#2d3748] font-semibold truncate">
                  <Phone size={13} className="text-[#718096] shrink-0" />
                  <span>{emergencyContact}</span>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-1.5 text-[10px] sm:text-[11px] text-[#718096] leading-snug">
                  <MapPin size={14} className="text-[#1e40af] shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{address}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#718096]">
                  <Mail size={13} className="text-[#1e40af] shrink-0" />
                  <p className="truncate">{email}</p>
                </div>
              </div>

              {/* QR Code & Signature Footer */}
              <div className="flex items-end justify-between pt-3 border-t border-[#e2e8f0] mt-auto">
                <div className="flex flex-col items-center">
                  <div className="p-1 border border-[#e2e8f0] rounded bg-[#f7fafc]">
                    <QrCode size={38} className="text-[#2d3748]" />
                  </div>
                  <span className="text-[7px] sm:text-[8px] text-[#718096] mt-0.5 font-medium">Scan to Verify</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-6 sm:h-7 flex items-center justify-center">
                    <span className="font-['Brush_Script_MT',cursive] text-xl sm:text-2xl text-[#2d3748]">Auth. Sign</span>
                  </div>
                  <div className="w-20 sm:w-22 border-t border-[#2d3748] mt-0.5"></div>
                  <span className="text-[8px] sm:text-[9px] text-[#718096] uppercase tracking-wider mt-0.5 font-semibold">Issuing Authority</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <p className="text-[11px] sm:text-xs text-[#718096] mt-3 print-hidden text-center">
        Tip: Click directly on the ID card to flip between front and back. Use <span className="font-semibold text-[#2d3748]">Print / Export ID</span> to download both sides as a PDF.
      </p>

    </div>
  );
}