import React, { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Building2, Download, Phone, Printer, AlertTriangle } from "lucide-react";
import { Modal, ModalHeader, ModalBody } from "flowbite-react";

export default function VirtualID() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  
  const idCardRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/employee/profile/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setEmployee(data);
        } else {
          setError(data.error || "Failed to load Virtual ID");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-[#8f9192]">Loading Virtual ID...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!employee) return <div className="p-8 text-center">No profile found.</div>;

  return (
    <div className="min-h-screen bg-[#f0f3f5] flex flex-col items-center p-6 print:bg-white print:p-0">
      <div className="mb-6 flex gap-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#fdfdfe] text-[#1E293B] border border-[#d6d9df] rounded-lg font-bold hover:bg-[#e2e6ea] transition-all shadow-sm"
        >
          <Printer size={18} /> Print Card
        </button>
        <button 
          onClick={() => setIsEmergencyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition-all shadow-sm"
        >
          <AlertTriangle size={18} /> Emergency Contact
        </button>
      </div>

      {/* Virtual ID Card Container */}
      <div 
        ref={idCardRef}
        className="w-[340px] bg-white rounded-2xl shadow-xl overflow-hidden border border-[#d6d9df] print:shadow-none print:border-2 print:border-gray-300"
      >
        {/* Header (Company Brand) */}
        <div className="bg-[#1E293B] p-4 text-center text-white">
          <div className="flex items-center justify-center gap-2 font-bold text-xl tracking-wide">
            <Building2 className="text-[#3B82F6]" /> ARM TECH
          </div>
        </div>

        {/* Photo and Status */}
        <div className="relative bg-gradient-to-b from-[#1E293B] to-white h-24 flex justify-center pt-4">
          <div className="absolute top-12 w-28 h-28 bg-[#f0f3f5] rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold text-[#1E293B] shadow-md overflow-hidden">
            {employee.url ? (
              <img src={employee.url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              employee.firstName?.charAt(0) + (employee.lastName?.charAt(0) || "")
            )}
          </div>
          <span className="absolute top-2 right-4 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500 text-white uppercase shadow-sm">
            {employee.status || "Active"}
          </span>
        </div>

        {/* Details */}
        <div className="pt-20 pb-6 px-6 text-center">
          <h2 className="text-xl font-bold text-[#1E293B] uppercase tracking-tight">
            {employee.firstName} {employee.lastName}
          </h2>
          <p className="text-[#3B82F6] font-bold text-sm mt-1 uppercase tracking-widest">{employee.designation}</p>
          <p className="text-[#8f9192] text-xs font-semibold mb-6 uppercase">{employee.department?.departmentName || employee.department || "No Department"}</p>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-left bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
            <div>
              <p className="text-[10px] font-bold text-[#bdc2c7] uppercase">Employee ID</p>
              <p className="text-sm font-bold text-[#1E293B]">{employee.employeeId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#bdc2c7] uppercase">Blood Group</p>
              <p className="text-sm font-bold text-red-500">{employee.bloodGroup || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#bdc2c7] uppercase">Joined Date</p>
              <p className="text-xs font-bold text-[#1E293B]">{employee.doj ? new Date(employee.doj).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#bdc2c7] uppercase">Location</p>
              <p className="text-xs font-bold text-[#1E293B]">{employee.site?.location || "Main Office"}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-6 flex flex-col items-center">
            <div className="p-2 bg-white border-2 border-[#f0f3f5] rounded-xl shadow-sm">
              <QRCodeSVG 
                value={`EMP:${employee.employeeId}|NAME:${employee.firstName} ${employee.lastName}|DEPT:${employee.department?.departmentName}`} 
                size={90} 
                level="M" 
              />
            </div>
            <p className="text-[10px] text-[#bdc2c7] mt-2 font-semibold">Scan for verification</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1E293B] p-2 text-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Property of ARM Technologies</p>
        </div>
      </div>

      {/* Emergency Modal */}
      <Modal show={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} size="sm">
        <ModalHeader>Emergency Contact</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
              <Phone className="text-red-500 mt-1 shrink-0" size={24} />
              <div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">In case of emergency</p>
                <p className="font-bold text-[#1E293B] text-lg">{employee.kinName || "Not Provided"}</p>
                <p className="text-sm text-[#8f9192] capitalize">{employee.relationship || "Unknown relationship"}</p>
                <p className="text-sm font-bold text-[#1E293B] mt-2">{employee.kinPhone || "No Phone Number"}</p>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

    </div>
  );
}
