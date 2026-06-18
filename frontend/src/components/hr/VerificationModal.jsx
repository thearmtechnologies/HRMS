import React, { useState } from "react";
import { X } from "lucide-react";

// Inlined Status Badge Component to keep everything self-contained
const VerificationStatusBadge = ({ status }) => {
  const styles = {
    verified: "bg-green-50 text-green-600 border-green-200",
    pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
  };
  const defaultStyle = "bg-[#f0f3f5] text-[#8f9192] border-[#d6d9df]";
  const currentStyle = styles[status?.toLowerCase()] || defaultStyle;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${currentStyle} capitalize`}>
      {status || "Unknown"}
    </span>
  );
};

export default function VerificationModal({
  isOpen,
  onClose,
  employee,
  onVerify,
  onReject,
}) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !employee) return null;

  const handleVerify = (documentType) => {
    setError("");
    if (onVerify) onVerify(employee._id, documentType);
  };

  const handleReject = (documentType) => {
    if (!remarks.trim()) {
      setError("Remarks are required to reject a document. Please provide a reason.");
      return;
    }
    setError("");
    if (onReject) onReject(employee._id, documentType, remarks);
    setRemarks(""); // Clear remarks after rejecting
  };

  const renderDocumentSection = (title, documentType, currentStatus, details) => (
    <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5 mb-5">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#d6d9df]">
        <h4 className="text-lg font-semibold text-[#1E293B]">{title}</h4>
        <VerificationStatusBadge status={currentStatus} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-2">
        {details.map((detail, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider">
              {detail.label}
            </span>
            <span className="text-sm font-bold text-[#1E293B]">
              {detail.value || "N/A"}
            </span>
          </div>
        ))}
      </div>

      {currentStatus === "pending" && (
        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-[#d6d9df]">
          <button 
            className="bg-green-500 text-white font-bold rounded-lg px-5 py-2.5 hover:bg-green-600 shadow-sm transition-all text-sm flex-1 sm:flex-none"
            onClick={() => handleVerify(documentType)}
          >
            Verify {title}
          </button>
          <button 
            className="bg-red-500 text-white font-bold rounded-lg px-5 py-2.5 hover:bg-red-600 shadow-sm transition-all text-sm flex-1 sm:flex-none"
            onClick={() => handleReject(documentType)}
          >
            Reject {title}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1E293B]/40 backdrop-blur-sm font-sans">
      
      {/* Modal Container */}
      <div className="bg-[#fdfdfe] rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d6d9df] bg-[#fdfdfe] shrink-0">
          <h2 className="text-xl font-bold text-[#1E293B]">Verify Employee Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 bg-[#f0f3f5] overflow-y-auto flex-1">
          
          {/* Employee Info Card */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-3">Employee Information</h3>
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider">Employee ID</span>
                <span className="text-sm font-bold text-[#1E293B]">{employee.employeeId || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider">Full Name</span>
                <span className="text-sm font-bold text-[#1E293B]">{employee.firstName} {employee.lastName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider">Department</span>
                <span className="text-sm font-bold text-[#1E293B]">{employee.department?.departmentName || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider">Designation</span>
                <span className="text-sm font-bold text-[#1E293B]">{employee.designation || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Global Remarks Field for Rejection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-3">Verification Remarks</h3>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="remarks" className="text-sm font-semibold text-[#8f9192]">
                Remarks (Required for rejection)
              </label>
              <textarea
                id="remarks"
                placeholder="Enter reason for rejection or additional notes..."
                rows={3}
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  if (error) setError("");
                }}
                className={`w-full bg-[#f0f3f5] border ${error ? 'border-red-500' : 'border-[#d6d9df]'} rounded-lg px-4 py-2.5 text-[#1E293B] outline-none transition-all placeholder:text-[#bdc2c7] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 resize-none shadow-sm`}
              />
              {error && <span className="text-xs font-bold text-red-500 mt-1">{error}</span>}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Submitted Documents</h3>

          {renderDocumentSection(
            "PAN Details",
            "pan",
            employee.panStatus,
            [{ label: "PAN Number", value: employee.documents?.pan?.number }]
          )}

          {renderDocumentSection(
            "Aadhaar Details",
            "aadhaar",
            employee.aadhaarStatus,
            [{ label: "Aadhaar Number", value: employee.documents?.aadhaar?.number }]
          )}

          {renderDocumentSection(
            "Bank Details",
            "bank",
            employee.bankStatus,
            [
              { label: "Bank Name", value: employee.bankName },
              { label: "Account Number", value: employee.accountNo },
              { label: "IFSC Code", value: employee.ifscCode },
              { label: "Branch", value: employee.branch }
            ]
          )}

        </div>
        
        {/* Footer */}
        <div className="bg-[#fdfdfe] border-t border-[#d6d9df] px-6 py-4 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="bg-[#f0f3f5] text-[#1E293B] font-bold border border-[#d6d9df] rounded-lg px-6 py-2.5 hover:bg-[#e2e6ea] transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}