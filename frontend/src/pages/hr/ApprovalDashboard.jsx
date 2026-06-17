import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, FileText, CreditCard, AlertCircle } from 'lucide-react';

export default function ApprovalDashboard() {
  const [approvals, setApprovals] = useState({ pendingBank: [], pendingPAN: [], pendingAadhaar: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/employee/pending-approvals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApprovals(data);
      } else {
        setError(data.error || 'Failed to fetch pending approvals');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBankApproval = async (employeeId, action) => {
    try {
      setActionLoading(`${employeeId}-bank`);
      const res = await fetch(`http://localhost:5000/api/employee/${employeeId}/approve-bank`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) fetchApprovals();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDocumentVerification = async (employeeId, documentType, verified) => {
    try {
      setActionLoading(`${employeeId}-${documentType}`);
      const res = await fetch(`http://localhost:5000/api/employee/${employeeId}/verify-document`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ documentType, verified })
      });
      if (res.ok) fetchApprovals();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-[#3B82F6] h-8 w-8" /></div>;
  }

  const totalPending = approvals.pendingBank.length + approvals.pendingPAN.length + approvals.pendingAadhaar.length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in duration-200">
      
      <div className="bg-[#fdfdfe] p-6 rounded-2xl border border-[#d6d9df] shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Approval Dashboard</h1>
          <p className="text-[#8f9192] mt-1">Review and approve employee detail updates and verify documents.</p>
        </div>
        <div className="text-center bg-yellow-50 px-5 py-3 rounded-xl border border-yellow-200">
          <p className="text-3xl font-bold text-yellow-600 leading-none">{totalPending}</p>
          <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide mt-1">Pending Actions</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-semibold flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {totalPending === 0 && !loading && !error && (
        <div className="bg-[#fdfdfe] p-12 rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#1E293B] mb-2">All Caught Up!</h2>
          <p className="text-[#8f9192]">There are no pending approvals or unverified documents at the moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bank Approvals Section */}
        {approvals.pendingBank.length > 0 && (
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
            <div className="p-5 bg-[#f0f3f5] border-b border-[#d6d9df] flex items-center gap-2">
              <CreditCard className="text-[#1E293B]" size={20} />
              <h2 className="font-bold text-[#1E293B]">Pending Bank Details</h2>
              <span className="ml-auto bg-[#3B82F6] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{approvals.pendingBank.length}</span>
            </div>
            <div className="divide-y divide-[#d6d9df]">
              {approvals.pendingBank.map(emp => (
                <div key={emp._id} className="p-5 flex flex-col sm:flex-row gap-4 justify-between hover:bg-[#f0f3f5]/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-[#1E293B]">{emp.fullName || `${emp.firstName} ${emp.lastName}`} <span className="text-sm font-normal text-[#8f9192]">({emp.employeeId})</span></h3>
                    <div className="mt-2 text-sm text-[#8f9192] space-y-1">
                      <p><span className="font-semibold text-[#1E293B]">Bank:</span> {emp.pendingBankDetails.bankName}</p>
                      <p><span className="font-semibold text-[#1E293B]">Branch:</span> {emp.pendingBankDetails.branch}</p>
                      <p><span className="font-semibold text-[#1E293B]">A/C No:</span> {emp.pendingBankDetails.accountNo}</p>
                      <p><span className="font-semibold text-[#1E293B]">IFSC:</span> {emp.pendingBankDetails.ifscCode}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 justify-center shrink-0">
                    <button 
                      onClick={() => handleBankApproval(emp._id, 'approve')}
                      disabled={actionLoading === `${emp._id}-bank`}
                      className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {actionLoading === `${emp._id}-bank` ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Approve
                    </button>
                    <button 
                      onClick={() => handleBankApproval(emp._id, 'reject')}
                      disabled={actionLoading === `${emp._id}-bank`}
                      className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Approvals Section */}
        {(approvals.pendingPAN.length > 0 || approvals.pendingAadhaar.length > 0) && (
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
             <div className="p-5 bg-[#f0f3f5] border-b border-[#d6d9df] flex items-center gap-2">
              <FileText className="text-[#1E293B]" size={20} />
              <h2 className="font-bold text-[#1E293B]">Pending Document Verifications</h2>
              <span className="ml-auto bg-[#3B82F6] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{approvals.pendingPAN.length + approvals.pendingAadhaar.length}</span>
            </div>
            <div className="divide-y divide-[#d6d9df]">
              
              {/* PAN Iteration */}
              {approvals.pendingPAN.map(emp => (
                <div key={`pan-${emp._id}`} className="p-5 flex flex-col sm:flex-row gap-4 justify-between hover:bg-[#f0f3f5]/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">PAN</span>
                    </div>
                    <h3 className="font-bold text-[#1E293B]">{emp.fullName || `${emp.firstName} ${emp.lastName}`} <span className="text-sm font-normal text-[#8f9192]">({emp.employeeId})</span></h3>
                    <div className="mt-2 text-sm">
                      <p><span className="font-semibold text-[#8f9192]">Number:</span> <span className="font-bold text-[#1E293B] uppercase">{emp.documents.pan.number}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center shrink-0">
                    <button 
                      onClick={() => handleDocumentVerification(emp._id, 'pan', true)}
                      disabled={actionLoading === `${emp._id}-pan`}
                      className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors w-full"
                    >
                      {actionLoading === `${emp._id}-pan` ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Verify Document
                    </button>
                  </div>
                </div>
              ))}

              {/* Aadhaar Iteration */}
              {approvals.pendingAadhaar.map(emp => (
                <div key={`aadhaar-${emp._id}`} className="p-5 flex flex-col sm:flex-row gap-4 justify-between hover:bg-[#f0f3f5]/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Aadhaar</span>
                    </div>
                    <h3 className="font-bold text-[#1E293B]">{emp.fullName || `${emp.firstName} ${emp.lastName}`} <span className="text-sm font-normal text-[#8f9192]">({emp.employeeId})</span></h3>
                    <div className="mt-2 text-sm">
                      <p><span className="font-semibold text-[#8f9192]">Number:</span> <span className="font-bold text-[#1E293B]">{emp.documents.aadhaar.number}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center shrink-0">
                    <button 
                      onClick={() => handleDocumentVerification(emp._id, 'aadhaar', true)}
                      disabled={actionLoading === `${emp._id}-aadhaar`}
                      className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors w-full"
                    >
                      {actionLoading === `${emp._id}-aadhaar` ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Verify Document
                    </button>
                  </div>
                </div>
              ))}
              
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
