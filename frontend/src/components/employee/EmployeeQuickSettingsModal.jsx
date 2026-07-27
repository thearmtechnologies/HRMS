import React, { useState, useEffect } from 'react';
import {
  X, Settings, IndianRupee, Briefcase, Building2, Shield, MapPin,
  Loader2, CheckCircle2, AlertTriangle, Save, User, Award, Clock
} from 'lucide-react';

const formatINR = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const INITIAL_JOB_FORM = {
  designation: '',
  department: '',
  role: 'employee',
  workLocation: '',
  employmentType: 'Full-time',
  status: 'Active',
  shift: ''
};

export default function EmployeeQuickSettingsModal({ isOpen, onClose, employee, departments = [], availableShifts = [], onSaved }) {
  const [activeTab, setActiveTab] = useState('job'); // 'job' only now

  const [jobForm, setJobForm] = useState({ ...INITIAL_JOB_FORM });
  const [designations, setDesignations] = useState([]);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobSaving, setJobSaving] = useState(false);
  const [jobError, setJobError] = useState('');
  const [jobSuccess, setJobSuccess] = useState('');

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    if (isOpen && employee) {
      setJobError('');
      setJobSuccess('');
      setActiveTab('job');
      
      // Initialize job form from employee object
      setJobForm({
        designation: employee.designation || '',
        department: employee.department?._id || employee.department || '',
        role: employee.user?.role || 'employee',
        workLocation: employee.workLocation || '',
        employmentType: employee.employmentType || 'Full-time',
        status: employee.status || 'Active',
        shift: employee.shift?._id || employee.shift || ''
      });

      fetchDesignations();
    }
  }, [isOpen, employee]);

  const fetchDesignations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/designations/active', { headers });
      if (res.ok) {
        const data = await res.json();
        setDesignations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching designations:", err);
    }
  };

  const handleJobChange = (field, value) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveJobRole = async () => {
    if (!jobForm.designation || !jobForm.department) {
      setJobError('Designation and Department are required.');
      return;
    }

    setJobSaving(true);
    setJobError('');
    setJobSuccess('');

    try {
      const empId = employee?._id || employee?.id;
      if (!empId) throw new Error("Invalid Employee ID");

      const payload = {
        designation: jobForm.designation,
        department: jobForm.department,
        role: jobForm.role,
        workLocation: jobForm.workLocation,
        employmentType: jobForm.employmentType,
        status: jobForm.status,
        shift: jobForm.shift || null
      };

      const response = await fetch(`http://localhost:5000/api/employee/admin/${empId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update job and role settings');
      }

      setJobSuccess('Designation, department, and role updated successfully!');
      if (onSaved) onSaved();
    } catch (err) {
      setJobError(err.message || 'Failed to save job details');
    } finally {
      setJobSaving(false);
    }
  };

  if (!isOpen || !employee) return null;

  const displayName = employee.employeeName || employee.fullName || (employee.firstName || employee.lastName ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : employee.name || "Unknown");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#d6d9df] bg-[#f0f3f5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Employee Quick Settings</h2>
              <p className="text-xs text-slate-600 font-medium">
                Configure organizational roles for <span className="font-bold text-[#1E293B]">{displayName}</span> ({employee.employeeId || employee.tradeId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-[#1E293B] hover:bg-[#d6d9df] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* JOB & ROLE SETTINGS */}
          {activeTab === 'job' && (
            <div className="space-y-6">
              {jobError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 font-medium">
                  <AlertTriangle size={16} className="shrink-0" />
                  {jobError}
                </div>
              )}
              {jobSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2 font-bold">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  {jobSuccess}
                </div>
              )}

              <div className="bg-[#f0f3f5] p-6 rounded-2xl border border-[#d6d9df] space-y-5">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#1E293B] flex items-center gap-2 border-b border-[#d6d9df] pb-2.5">
                  <Briefcase size={16} className="text-[#3B82F6]" /> Designation & Department Assignment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Department *</label>
                    <select
                      value={jobForm.department}
                      onChange={(e) => handleJobChange('department', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#3B82F6] shadow-sm"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.departmentName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Designation *</label>
                    <select
                      value={jobForm.designation}
                      onChange={(e) => handleJobChange('designation', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#3B82F6] shadow-sm"
                    >
                      <option value="">Select Designation</option>
                      {designations.map(d => (
                        <option key={d._id} value={d.name}>{d.name}</option>
                      ))}
                      {jobForm.designation && !designations.some(d => d.name === jobForm.designation) && (
                        <option value={jobForm.designation}>{jobForm.designation} (Current)</option>
                      )}
                    </select>
                  </div>
                </div>

                <h3 className="font-bold text-sm uppercase tracking-wider text-[#1E293B] flex items-center gap-2 border-b border-[#d6d9df] pb-2.5 pt-3">
                  <Shield size={16} className="text-[#3B82F6]" /> System Role & Employment Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">System Access Role *</label>
                    <select
                      value={jobForm.role}
                      onChange={(e) => handleJobChange('role', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#3B82F6] shadow-sm"
                    >
                      <option value="employee">Regular Employee</option>
                      <option value="hr">HR Officer</option>
                      <option value="manager">Team Manager</option>
                      <option value="admin">System Administrator</option>
                      <option value="finance">Finance Officer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Employment Type</label>
                    <select
                      value={jobForm.employmentType}
                      onChange={(e) => handleJobChange('employmentType', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#3B82F6] shadow-sm"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                      <option value="Consultant">Consultant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Status</label>
                    <select
                      value={jobForm.status}
                      onChange={(e) => handleJobChange('status', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#3B82F6] shadow-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Probation">Probation</option>
                      <option value="Notice Period">Notice Period</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <MapPin size={14} /> Work Location / Office Site
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Headquarters / Mumbai Office / Remote"
                      value={jobForm.workLocation}
                      onChange={(e) => handleJobChange('workLocation', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#3B82F6] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Clock size={14} /> Working Shift
                    </label>
                    <select
                      value={jobForm.shift}
                      onChange={(e) => handleJobChange('shift', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] rounded-xl text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#3B82F6] shadow-sm"
                    >
                      <option value="">Default Company Shift</option>
                      {availableShifts.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.startTime} - {s.endTime})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#f0f3f5] text-slate-700 hover:bg-[#d6d9df] font-bold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={jobSaving}
                  onClick={handleSaveJobRole}
                  className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {jobSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Job & Role Settings
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
