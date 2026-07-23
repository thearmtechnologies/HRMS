import React, { useState, useEffect } from 'react';
import {
  X, Settings, IndianRupee, Briefcase, Building2, Shield, MapPin,
  Loader2, CheckCircle2, AlertTriangle, Save, User, Award, Clock
} from 'lucide-react';

const formatINR = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const INITIAL_SALARY_FORM = {
  basicMonthly: '',
  hraMonthly: '',
  maMonthly: '',
  caMonthly: '',
  saMonthly: '',
  bonusMonthly: '',
  employeePFMonthly: '',
  employerPFMonthly: '',
  esiEmployee: '',
  esiEmployer: '',
  professionalTax: '',
  otherDed: '',
  overtimeRate: '',
  effectiveDate: new Date().toISOString().split('T')[0],
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
  const [activeTab, setActiveTab] = useState('salary'); // 'salary' | 'job'
  
  // Salary state
  const [salaryForm, setSalaryForm] = useState({ ...INITIAL_SALARY_FORM });
  const [existingSalary, setExistingSalary] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salarySaving, setSalarySaving] = useState(false);
  const [salaryError, setSalaryError] = useState('');
  const [salarySuccess, setSalarySuccess] = useState('');

  // Job & Role state
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
      setSalaryError('');
      setSalarySuccess('');
      setJobError('');
      setJobSuccess('');
      
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
      fetchCurrentSalary();
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

  const fetchCurrentSalary = async () => {
    setSalaryLoading(true);
    try {
      const empId = employee?._id || employee?.id;
      if (!empId) return;
      const response = await fetch(`http://localhost:5000/api/pay/salary-fixed/employee/${empId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setExistingSalary(data);
        setSalaryForm({
          basicMonthly: data.basicMonthly || '',
          hraMonthly: data.hraMonthly || '',
          maMonthly: data.maMonthly || '',
          caMonthly: data.caMonthly || '',
          saMonthly: data.saMonthly || '',
          bonusMonthly: data.bonusMonthly || '',
          employeePFMonthly: data.employeePFMonthly || '',
          employerPFMonthly: data.employerPFMonthly || '',
          esiEmployee: data.esiEmployee || '',
          esiEmployer: data.esiEmployer || '',
          professionalTax: data.professionalTax || '',
          otherDed: data.otherDed || '',
          overtimeRate: data.overtimeRate || '',
          effectiveDate: data.effectiveDate
            ? new Date(data.effectiveDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        });
      } else {
        setExistingSalary(null);
        setSalaryForm({ ...INITIAL_SALARY_FORM });
      }
    } catch (err) {
      setExistingSalary(null);
      setSalaryForm({ ...INITIAL_SALARY_FORM });
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleSalaryChange = (field, value) => {
    setSalaryForm(prev => ({ ...prev, [field]: value }));
  };

  const handleJobChange = (field, value) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
  };

  const num = (v) => Number(v) || 0;

  // Salary calculations
  const grossMonthly = num(salaryForm.basicMonthly) + num(salaryForm.hraMonthly) + num(salaryForm.maMonthly) +
    num(salaryForm.caMonthly) + num(salaryForm.saMonthly) + num(salaryForm.bonusMonthly);

  const totalDeductions = num(salaryForm.employeePFMonthly) + num(salaryForm.professionalTax) +
    num(salaryForm.esiEmployee) + num(salaryForm.otherDed);

  const inHandMonthly = grossMonthly - totalDeductions;
  const annualCTC = grossMonthly * 12 + num(salaryForm.employerPFMonthly) * 12 + num(salaryForm.esiEmployer) * 12;

  const handleSaveSalary = async () => {
    if (grossMonthly <= 0) {
      setSalaryError('Please enter at least one earning component.');
      return;
    }

    setSalarySaving(true);
    setSalaryError('');
    setSalarySuccess('');

    try {
      const empId = employee?._id || employee?.id;
      if (!empId) throw new Error("Invalid Employee ID");
      
      const payload = {
        employeeId: empId,
        basicMonthly: num(salaryForm.basicMonthly),
        hraMonthly: num(salaryForm.hraMonthly),
        maMonthly: num(salaryForm.maMonthly),
        caMonthly: num(salaryForm.caMonthly),
        saMonthly: num(salaryForm.saMonthly),
        bonusMonthly: num(salaryForm.bonusMonthly),
        grossMonthly,
        employeePFMonthly: num(salaryForm.employeePFMonthly),
        employerPFMonthly: num(salaryForm.employerPFMonthly),
        esiEmployee: num(salaryForm.esiEmployee),
        esiEmployer: num(salaryForm.esiEmployer),
        professionalTax: num(salaryForm.professionalTax),
        otherDed: num(salaryForm.otherDed),
        inHandMonthly,
        overtimeRate: num(salaryForm.overtimeRate),
        effectiveDate: salaryForm.effectiveDate || new Date().toISOString().split('T')[0],
        annualCTC,
        annualGross: grossMonthly * 12,
        annualInHand: inHandMonthly * 12,
        annualBonus: num(salaryForm.bonusMonthly) * 12,
        annualEmployerPF: num(salaryForm.employerPFMonthly) * 12,
      };

      const method = existingSalary ? 'PUT' : 'POST';
      const url = `http://localhost:5000/api/pay/salary-fixed/employee/${empId}`;

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to save salary structure');
      }

      setSalarySuccess(existingSalary ? 'Salary structure updated successfully!' : 'Salary structure assigned successfully!');
      setExistingSalary(data.salaryDetails || data);
      if (onSaved) onSaved();
    } catch (err) {
      setSalaryError(err.message || 'Failed to save salary details');
    } finally {
      setSalarySaving(false);
    }
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
                Configure compensation & organizational roles for <span className="font-bold text-[#1E293B]">{displayName}</span> ({employee.employeeId || employee.tradeId})
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-[#d6d9df] bg-[#fdfdfe] flex items-center gap-6 shrink-0">
          <button
            onClick={() => setActiveTab('salary')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'salary'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-slate-600 hover:text-[#1E293B]'
            }`}
          >
            <IndianRupee size={16} /> Salary & Compensation
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'job'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-slate-600 hover:text-[#1E293B]'
            }`}
          >
            <Briefcase size={16} /> Designation, Role & Department
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: SALARY */}
          {activeTab === 'salary' && (
            <div className="space-y-6">
              {salaryLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
                  <p className="text-sm font-semibold">Loading current salary structure...</p>
                </div>
              ) : (
                <>
                  {salaryError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 font-medium">
                      <AlertTriangle size={16} className="shrink-0" />
                      {salaryError}
                    </div>
                  )}
                  {salarySuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2 font-bold">
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                      {salarySuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Earnings Section */}
                    <div className="bg-[#f0f3f5] p-5 rounded-2xl border border-[#d6d9df] space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-[#1E293B] flex items-center gap-2 border-b border-[#d6d9df] pb-2">
                        <IndianRupee size={16} className="text-emerald-600" /> Monthly Earnings
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Basic Salary (Monthly) *</label>
                          <input
                            type="number"
                            placeholder="e.g. 25000"
                            value={salaryForm.basicMonthly}
                            onChange={(e) => handleSalaryChange('basicMonthly', e.target.value)}
                            className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm font-bold text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">HRA (House Rent Allowance)</label>
                          <input
                            type="number"
                            placeholder="e.g. 10000"
                            value={salaryForm.hraMonthly}
                            onChange={(e) => handleSalaryChange('hraMonthly', e.target.value)}
                            className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Medical Allowance</label>
                            <input
                              type="number"
                              placeholder="e.g. 1500"
                              value={salaryForm.maMonthly}
                              onChange={(e) => handleSalaryChange('maMonthly', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Conveyance</label>
                            <input
                              type="number"
                              placeholder="e.g. 1600"
                              value={salaryForm.caMonthly}
                              onChange={(e) => handleSalaryChange('caMonthly', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Special Allowance</label>
                            <input
                              type="number"
                              placeholder="e.g. 5000"
                              value={salaryForm.saMonthly}
                              onChange={(e) => handleSalaryChange('saMonthly', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Bonus / Incentive</label>
                            <input
                              type="number"
                              placeholder="e.g. 2000"
                              value={salaryForm.bonusMonthly}
                              onChange={(e) => handleSalaryChange('bonusMonthly', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deductions Section */}
                    <div className="bg-[#f0f3f5] p-5 rounded-2xl border border-[#d6d9df] space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-[#1E293B] flex items-center gap-2 border-b border-[#d6d9df] pb-2">
                        <IndianRupee size={16} className="text-red-600" /> Monthly Deductions & Rates
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Employee PF</label>
                            <input
                              type="number"
                              placeholder="e.g. 1800"
                              value={salaryForm.employeePFMonthly}
                              onChange={(e) => handleSalaryChange('employeePFMonthly', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Employer PF</label>
                            <input
                              type="number"
                              placeholder="e.g. 1800"
                              value={salaryForm.employerPFMonthly}
                              onChange={(e) => handleSalaryChange('employerPFMonthly', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Tax (PT)</label>
                            <input
                              type="number"
                              placeholder="e.g. 200"
                              value={salaryForm.professionalTax}
                              onChange={(e) => handleSalaryChange('professionalTax', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">ESI (Employee)</label>
                            <input
                              type="number"
                              placeholder="e.g. 150"
                              value={salaryForm.esiEmployee}
                              onChange={(e) => handleSalaryChange('esiEmployee', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Overtime Rate (/Hr)</label>
                            <input
                              type="number"
                              placeholder="e.g. 250"
                              value={salaryForm.overtimeRate}
                              onChange={(e) => handleSalaryChange('overtimeRate', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Effective Date</label>
                            <input
                              type="date"
                              value={salaryForm.effectiveDate}
                              onChange={(e) => handleSalaryChange('effectiveDate', e.target.value)}
                              className="w-full px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] rounded-lg text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-[#1E293B] text-white p-5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-md">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Gross Monthly</p>
                      <p className="text-xl font-black text-emerald-400">{formatINR(grossMonthly)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Total Deductions</p>
                      <p className="text-xl font-black text-red-400">{formatINR(totalDeductions)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">In-Hand (Net Pay)</p>
                      <p className="text-xl font-black text-white">{formatINR(inHandMonthly)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Annual CTC</p>
                      <p className="text-xl font-black text-[#3B82F6]">{formatINR(annualCTC)}</p>
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
                      disabled={salarySaving}
                      onClick={handleSaveSalary}
                      className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {salarySaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Salary Structure
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: JOB & ROLE */}
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
