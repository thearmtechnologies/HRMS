import React, { useState, useEffect } from 'react';
import SettingsCard from '../components/SettingsCard';
import SettingsHeader from '../components/SettingsHeader';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { payrollConfigService } from '../../../../services/payrollConfigService';

export default function PayrollSettingsTab() {
  const [settings, setSettings] = useState({
    frequency: 'Monthly',
    salaryCreditDay: 1,
    processingDate: 25,
    financialYear: 'April - March',
    currency: 'INR',
    defaultOvertimeRate: 1.5,
    roundSalaryAmounts: true,
    defaultCalculationMode: 'System Calculated',
    allowManualOverride: false,
    lockPayrollAfterApproval: true,
    allowPayrollRegeneration: false,
    allowNegativeSalary: false,
    autoIncludeAttendance: true,
    autoIncludeApprovedLeave: true,
    autoIncludeOvertime: true,
    salaryAdvanceEnabled: true,
    salaryAdvanceMaxLimitType: '2x Gross Salary',
    salaryAdvanceCustomLimit: 50000
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const data = await payrollConfigService.getConfiguration();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.message || 'Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const updated = await payrollConfigService.updateConfiguration(settings);
      setSettings(prev => ({ ...prev, ...updated }));
      setSuccess('Payroll settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save configuration');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading Payroll Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {success && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in-up">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in-up">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Section 1: Payroll Cycle */}
      <SettingsCard>
        <SettingsHeader 
          title="Payroll Cycle & Defaults" 
          description="Configure company-wide payroll frequencies and default behaviors."
        />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1">Payroll Frequency</label>
            <select name="frequency" value={settings.frequency} onChange={handleChange} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
              <option value="Monthly">Monthly</option>
              <option value="Biweekly">Biweekly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1">Salary Credit Day</label>
            <input type="number" name="salaryCreditDay" value={settings.salaryCreditDay} onChange={handleChange} min="1" max="31" className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
            <p className="text-[10px] text-gray-500 mt-1">Day of the month salary is credited.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1">Processing Date</label>
            <input type="number" name="processingDate" value={settings.processingDate} onChange={handleChange} min="1" max="31" className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
            <p className="text-[10px] text-gray-500 mt-1">Cut-off date for attendance & leaves.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1">Financial Year</label>
            <select name="financialYear" value={settings.financialYear} onChange={handleChange} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
              <option value="April - March">April - March</option>
              <option value="January - December">January - December</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1">Currency</label>
            <select name="currency" value={settings.currency} onChange={handleChange} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="lg:col-span-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer group w-fit">
              <div className="relative flex items-center">
                <input type="checkbox" name="roundSalaryAmounts" checked={settings.roundSalaryAmounts} onChange={handleChange} className="peer sr-only" />
                <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-600/30 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </div>
              <span className="text-sm font-semibold text-[#1E293B]">Round Salary Amounts to nearest integer</span>
            </label>
          </div>
        </div>
      </SettingsCard>

      {/* Section 2: Payroll Generation */}
      <SettingsCard>
        <SettingsHeader 
          title="Payroll Generation Logic" 
          description="Control how the system automatically computes monthly salary batches."
        />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#475569] mb-1">Default Calculation Mode</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="defaultCalculationMode" value="System Calculated" checked={settings.defaultCalculationMode === 'System Calculated'} onChange={handleChange} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                <span className="text-sm font-medium text-[#1E293B]">System Calculated (Pro-rated based on attendance)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="defaultCalculationMode" value="Custom (Full Assigned)" checked={settings.defaultCalculationMode === 'Custom (Full Assigned)'} onChange={handleChange} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                <span className="text-sm font-medium text-[#1E293B]">Custom (Always pay full assigned salary)</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#8f9192] uppercase tracking-wider mb-2">Security & Overrides</h4>
            
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" name="allowManualOverride" checked={settings.allowManualOverride} onChange={handleChange} className="peer sr-only" />
                <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#1E293B] block">Allow Manual Override</span>
                <span className="text-xs text-gray-500">Permit HR to manually edit computed salary amounts before approval.</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" name="lockPayrollAfterApproval" checked={settings.lockPayrollAfterApproval} onChange={handleChange} className="peer sr-only" />
                <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#1E293B] block">Lock Payroll After Approval</span>
                <span className="text-xs text-gray-500">Prevent any changes to a payroll batch once it is marked as approved.</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" name="allowPayrollRegeneration" checked={settings.allowPayrollRegeneration} onChange={handleChange} className="peer sr-only" />
                <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#1E293B] block">Allow Payroll Regeneration</span>
                <span className="text-xs text-gray-500">Allow rebuilding the entire payroll if attendance data changes.</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" name="allowNegativeSalary" checked={settings.allowNegativeSalary} onChange={handleChange} className="peer sr-only" />
                <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#1E293B] block">Allow Negative Salary</span>
                <span className="text-xs text-gray-500">If deductions exceed earnings, allow the net pay to be negative.</span>
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#8f9192] uppercase tracking-wider mb-2">Automated Inclusions</h4>
            
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" name="autoIncludeAttendance" checked={settings.autoIncludeAttendance} onChange={handleChange} className="peer sr-only" />
                <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#1E293B] block">Include Attendance LOP</span>
                <span className="text-xs text-gray-500">Automatically deduct Loss of Pay (LOP) based on timesheets.</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" name="autoIncludeApprovedLeave" checked={settings.autoIncludeApprovedLeave} onChange={handleChange} className="peer sr-only" />
                <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#1E293B] block">Include Approved Leaves</span>
                <span className="text-xs text-gray-500">Process paid and unpaid leaves automatically during generation.</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" name="autoIncludeOvertime" checked={settings.autoIncludeOvertime} onChange={handleChange} className="peer sr-only" />
                <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#1E293B] block">Include Overtime</span>
                <span className="text-xs text-gray-500">Automatically disburse approved overtime hours in the next cycle.</span>
              </div>
            </label>
          </div>
        </div>
      </SettingsCard>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg font-bold hover:bg-[#2563EB] transition-colors shadow-sm disabled:opacity-50">
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
          Save Settings
        </button>
      </div>
    </div>
  );
}
