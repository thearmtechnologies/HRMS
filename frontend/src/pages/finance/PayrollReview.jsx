import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Save, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PayrollReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    if (location.state?.previewData?.preview) {
      setPayrolls(location.state.previewData.preview);
      setErrors(location.state.previewData.errors || []);
    } else {
      navigate('/admin-dashboard?tab=payroll'); // redirect back if no data
    }
  }, [location.state, navigate]);

  // Extract all unique components dynamically to build table columns
  const getDynamicColumns = () => {
    const columns = [];
    const seen = new Set();
    
    payrolls.forEach(p => {
      p.components?.forEach(c => {
        if (!seen.has(c.component)) {
          seen.add(c.component);
          columns.push({ id: c.component, name: c.name, type: c.type });
        }
      });
    });
    
    // Sort columns: Earnings first, then Deductions
    return columns.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'Earning' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  const dynamicColumns = getDynamicColumns();

  const handleAdjustmentChange = (index, field, value) => {
    const updated = [...payrolls];
    if (field === 'manualAdjustment') {
      updated[index].manualAdjustment = Number(value) || 0;
      updated[index].finalPayable = updated[index].netPay + updated[index].manualAdjustment;
    } else {
      updated[index][field] = value;
    }
    setPayrolls(updated);
  };

  const handleAdvanceChange = (index, value) => {
    const updated = [...payrolls];
    const payroll = updated[index];
    const amount = Number(value) || 0;
    
    const advanceComp = payroll.components?.find(c => c.component === 'salary_advance_recovery_id');
    if (advanceComp) {
      let actualAmount = amount;
      if (advanceComp.advanceBalance > 0) {
        actualAmount = Math.min(amount, advanceComp.advanceBalance);
      }
      
      const diff = actualAmount - (advanceComp.calculatedValue || 0);
      advanceComp.calculatedValue = actualAmount;
      
      payroll.totalDeductions += diff;
      payroll.netPay -= diff;
      payroll.finalPayable = payroll.netPay + (payroll.manualAdjustment || 0);
    }
    
    setPayrolls(updated);
  };

  const handleGenerateFinal = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pay/generate-payroll-final', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ payrolls }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitResult({ type: 'error', message: data.message || 'Failed to generate final payroll' });
      } else {
        setSubmitResult({ type: 'success', message: data.message });
        setTimeout(() => navigate('/admin-dashboard?tab=payroll'), 3000);
      }
    } catch (err) {
      setSubmitResult({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="p-6 max-w-full overflow-x-hidden h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin-dashboard?tab=payroll')} className="p-2 bg-white border border-[#d6d9df] text-[#475569] hover:bg-[#f0f3f5] rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Payroll Review</h1>
            <p className="text-sm text-[#8f9192]">Review and adjust salary before final generation</p>
          </div>
        </div>
        <button 
          onClick={handleGenerateFinal} 
          disabled={isSubmitting || submitResult?.type === 'success'}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Confirm & Generate
        </button>
      </div>

      {submitResult && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 shrink-0 ${submitResult.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {submitResult.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5" /> : <AlertTriangle size={20} className="mt-0.5" />}
          <div>
            <p className="font-bold text-sm">{submitResult.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-xs mt-1">{submitResult.message}</p>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl shrink-0">
          <div className="flex items-center gap-2 text-orange-700 mb-2">
            <AlertTriangle size={18} />
            <h3 className="font-bold text-sm">Skipped Employees ({errors.length})</h3>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {errors.map((e, idx) => (
              <p key={idx} className="text-xs text-orange-800">
                <span className="font-semibold">{e.name}</span> - {e.error}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-[#d6d9df] rounded-2xl shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-[#d6d9df] bg-[#fdfdfe] flex items-center gap-3 shrink-0">
          <FileSpreadsheet size={18} className="text-blue-600" />
          <h2 className="font-semibold text-[#1E293B]">Payroll Data Worksheet</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold">{payrolls.length} Records</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-[#f8f9fa] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 text-xs font-bold text-[#475569] uppercase border-b border-r bg-[#f8f9fa]">Employee</th>
                <th className="p-3 text-xs font-bold text-[#475569] uppercase border-b border-r bg-[#f8f9fa]">Template</th>
                <th className="p-3 text-xs font-bold text-[#475569] uppercase border-b border-r bg-[#f8f9fa]">Payable Days</th>
                
                {dynamicColumns.map(col => (
                  <th key={col.id} className={`p-3 text-xs font-bold uppercase border-b border-r bg-[#f8f9fa] ${col.type === 'Earning' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {col.name}
                  </th>
                ))}

                <th className="p-3 text-xs font-bold text-[#475569] uppercase border-b border-r bg-[#f8f9fa]">Gross</th>
                <th className="p-3 text-xs font-bold text-[#475569] uppercase border-b border-r bg-[#f8f9fa]">Total Ded.</th>
                <th className="p-3 text-xs font-bold text-[#475569] uppercase border-b border-r bg-[#f8f9fa]">Net Salary</th>
                
                <th className="p-3 text-xs font-bold text-[#475569] uppercase border-b border-r bg-[#f8f9fa] min-w-[250px]">Adjustment (±)</th>
                <th className="p-3 text-xs font-bold text-[#475569] uppercase border-b bg-[#f8f9fa]">Final Payable</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={dynamicColumns.length + 8} className="p-8 text-center text-gray-500">
                    No payroll data generated.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll, idx) => (
                  <tr key={idx} className="border-b hover:bg-[#f8f9fa]/50 transition-colors">
                    <td className="p-3 border-r">
                      <p className="font-bold text-sm text-[#1E293B]">{payroll.employeeName}</p>
                      <p className="text-xs text-[#8f9192]">{payroll.employeeId}</p>
                    </td>
                    <td className="p-3 border-r text-sm text-[#475569]">{payroll.templateName}</td>
                    <td className="p-3 border-r text-sm text-[#475569] font-medium text-center">
                      {payroll.payableDays} <span className="text-xs text-gray-400">/ {payroll.totalDays}</span>
                    </td>
                    
                    {dynamicColumns.map(col => {
                      const comp = payroll.components?.find(c => c.component === col.id);
                      if (col.id === 'salary_advance_recovery_id' && comp) {
                        return (
                          <td key={col.id} className="p-3 border-r bg-orange-50/30">
                            <div className="flex flex-col gap-1 items-end">
                              {comp.recoveryMethod === 'Manual' ? (
                                <input
                                  type="number"
                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 text-right"
                                  placeholder="Amount"
                                  value={comp.calculatedValue || ''}
                                  onChange={(e) => handleAdvanceChange(idx, e.target.value)}
                                />
                              ) : (
                                <span className="text-sm font-bold text-[#475569]">{formatCurrency(comp.calculatedValue)}</span>
                              )}
                              {comp.advanceBalance > 0 && <span className="text-[10px] text-orange-600 font-medium">Bal: ₹{comp.advanceBalance}</span>}
                            </div>
                          </td>
                        );
                      }
                      
                      return (
                        <td key={col.id} className="p-3 border-r text-sm text-right font-medium text-[#475569]">
                          {comp ? formatCurrency(comp.calculatedValue) : '-'}
                        </td>
                      );
                    })}

                    <td className="p-3 border-r text-sm text-right font-bold text-[#1E293B] bg-slate-50">{formatCurrency(payroll.grossSalary)}</td>
                    <td className="p-3 border-r text-sm text-right font-bold text-red-600 bg-red-50/30">{formatCurrency(payroll.totalDeductions)}</td>
                    <td className="p-3 border-r text-sm text-right font-bold text-blue-700 bg-blue-50/50">{formatCurrency(payroll.netPay)}</td>

                    <td className="p-3 border-r bg-yellow-50/30">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 text-right"
                          placeholder="Amount"
                          value={payroll.manualAdjustment || ''}
                          onChange={(e) => handleAdjustmentChange(idx, 'manualAdjustment', e.target.value)}
                        />
                        <input
                          type="text"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="Reason (Optional)"
                          value={payroll.adjustmentReason || ''}
                          onChange={(e) => handleAdjustmentChange(idx, 'adjustmentReason', e.target.value)}
                        />
                      </div>
                    </td>
                    
                    <td className="p-3 text-sm text-right font-bold text-emerald-700 bg-emerald-50">
                      {formatCurrency(payroll.finalPayable)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
