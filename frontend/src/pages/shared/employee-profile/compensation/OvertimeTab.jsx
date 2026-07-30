import React, { useState, useEffect } from 'react';
import { Clock, Loader2, Save } from 'lucide-react';
import { payrollConfigService } from '../../../../services/payrollConfigService';

export default function OvertimeTab({ employee }) {
  const [formData, setFormData] = useState({
    isOvertimeApplicable: false,
    overtimePolicy: ''
  });
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        isOvertimeApplicable: employee.isOvertimeApplicable || false,
        overtimePolicy: employee.overtimePolicy || ''
      });
    }

    const fetchPolicies = async () => {
      try {
        const res = await payrollConfigService.getAllOvertimePolicies();
        if (Array.isArray(res)) {
          setPolicies(res);
        } else if (res.success && res.data) {
          setPolicies(res.data);
        } else {
          setPolicies(res);
        }
      } catch (err) {
        console.error("Failed to fetch overtime policies", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, [employee]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        isOvertimeApplicable: formData.isOvertimeApplicable,
        overtimePolicy: formData.overtimePolicy || null
      };

      const res = await fetch(`http://localhost:5000/api/employee/admin/${employee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to save overtime policy");
      }

      setMessage({ type: 'success', text: 'Overtime policy updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#1E293B]">Overtime Rules</h3>
          <p className="text-sm text-[#8f9192]">Manage overtime eligibility and assign calculation rules</p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-[#fdfdfe] p-5 rounded-xl border border-[#d6d9df] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-bold text-[#1E293B]">Overtime Applicable</h4>
            <p className="text-xs text-[#8f9192]">Enable if this employee is eligible for overtime pay.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              disabled={saving} 
              checked={formData.isOvertimeApplicable} 
              onChange={e => setFormData({...formData, isOvertimeApplicable: e.target.checked})} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
          </label>
        </div>

        {formData.isOvertimeApplicable && (
          <div className="mb-4">
            <label htmlFor="empOvertimePolicy" className="block text-sm font-semibold text-[#8f9192] mb-2">Select Policy *</label>
            <select 
              id="empOvertimePolicy" 
              name="overtimePolicy" 
              disabled={saving} 
              value={formData.overtimePolicy} 
              onChange={e => setFormData({...formData, overtimePolicy: e.target.value})} 
              className="w-full px-4 py-3 bg-[#f0f3f5] border border-[#d6d9df] rounded-xl text-[#1E293B] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all cursor-pointer disabled:opacity-70 font-medium"
            >
              <option value="" disabled>Select an Overtime Policy</option>
              {policies.filter(p => p.isActive || p._id === formData.overtimePolicy).map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} — {p.calculationType === 'Fixed Amount' ? `₹${p.rate}/hr` : `${p.rate}x Hourly`} (Min: {p.minimumOvertimeHours} hrs)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-4 border-t border-[#d6d9df] flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving || (formData.isOvertimeApplicable && !formData.overtimePolicy)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg text-sm font-semibold hover:bg-[#2563EB] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
