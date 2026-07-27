import React, { useState, useEffect } from 'react';
import SettingsCard from '../components/SettingsCard';
import SettingsHeader from '../components/SettingsHeader';
import { Save, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import PlaceholderTab from '../components/PlaceholderTab';
import { payrollConfigService } from '../../../../services/payrollConfigService';

export default function TaxSettingsTab() {
  const [taxSettings, setTaxSettings] = useState({
    pfEnabled: true,
    pfEmployeePercent: 12,
    pfEmployerPercent: 12,
    pfWageLimit: 15000,
    
    esiEnabled: true,
    esiEmployeePercent: 0.75,
    esiEmployerPercent: 3.25,
    esiWageLimit: 21000,
    
    ptEnabled: true,
    ptDefaultAmount: 200,
    ptState: 'Maharashtra'
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
      setTaxSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.message || 'Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setTaxSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const updated = await payrollConfigService.updateConfiguration(taxSettings);
      setTaxSettings(prev => ({ ...prev, ...updated }));
      setSuccess('Tax settings saved successfully');
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
        <p>Loading Tax Settings...</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* =========================================
            PROVIDENT FUND (PF)
        ========================================= */}
        <SettingsCard>
          <SettingsHeader 
            title="Provident Fund (EPF)" 
            description="Configure Employee Provident Fund contribution rates."
            actions={
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-xs font-bold text-[#8f9192] uppercase tracking-wider">{taxSettings.pfEnabled ? 'Enabled' : 'Disabled'}</span>
                <div className="relative flex items-center">
                  <input type="checkbox" name="pfEnabled" checked={taxSettings.pfEnabled} onChange={handleChange} className="peer sr-only" />
                  <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </div>
              </label>
            }
          />
          <div className={`p-6 space-y-4 ${!taxSettings.pfEnabled && 'opacity-50 pointer-events-none'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Employee Contribution (%)</label>
                <input type="number" name="pfEmployeePercent" value={taxSettings.pfEmployeePercent} onChange={handleChange} min="0" step="0.1" className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Employer Contribution (%)</label>
                <input type="number" name="pfEmployerPercent" value={taxSettings.pfEmployerPercent} onChange={handleChange} min="0" step="0.1" className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">PF Wage Limit (Basic + DA)</label>
              <input type="number" name="pfWageLimit" value={taxSettings.pfWageLimit} onChange={handleChange} min="0" step="1000" className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
              <p className="text-[10px] text-gray-500 mt-1">If the Basic + DA exceeds this limit, PF contribution is restricted to the limit.</p>
            </div>
          </div>
        </SettingsCard>

        {/* =========================================
            EMPLOYEE STATE INSURANCE (ESI)
        ========================================= */}
        <SettingsCard>
          <SettingsHeader 
            title="Employee State Insurance (ESI)" 
            description="Configure ESI contribution rates."
            actions={
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-xs font-bold text-[#8f9192] uppercase tracking-wider">{taxSettings.esiEnabled ? 'Enabled' : 'Disabled'}</span>
                <div className="relative flex items-center">
                  <input type="checkbox" name="esiEnabled" checked={taxSettings.esiEnabled} onChange={handleChange} className="peer sr-only" />
                  <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </div>
              </label>
            }
          />
          <div className={`p-6 space-y-4 ${!taxSettings.esiEnabled && 'opacity-50 pointer-events-none'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Employee Contribution (%)</label>
                <input type="number" name="esiEmployeePercent" value={taxSettings.esiEmployeePercent} onChange={handleChange} min="0" step="0.01" className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Employer Contribution (%)</label>
                <input type="number" name="esiEmployerPercent" value={taxSettings.esiEmployerPercent} onChange={handleChange} min="0" step="0.01" className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">ESI Wage Limit (Gross Pay)</label>
              <input type="number" name="esiWageLimit" value={taxSettings.esiWageLimit} onChange={handleChange} min="0" step="1000" className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
              <p className="text-[10px] text-gray-500 mt-1">If the Gross Pay exceeds this limit, ESI is not applicable.</p>
            </div>
          </div>
        </SettingsCard>

        {/* =========================================
            PROFESSIONAL TAX (PT)
        ========================================= */}
        <SettingsCard>
          <SettingsHeader 
            title="Professional Tax (PT)" 
            description="State-wise statutory tax on professions."
            actions={
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-xs font-bold text-[#8f9192] uppercase tracking-wider">{taxSettings.ptEnabled ? 'Enabled' : 'Disabled'}</span>
                <div className="relative flex items-center">
                  <input type="checkbox" name="ptEnabled" checked={taxSettings.ptEnabled} onChange={handleChange} className="peer sr-only" />
                  <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </div>
              </label>
            }
          />
          <div className={`p-6 space-y-4 ${!taxSettings.ptEnabled && 'opacity-50 pointer-events-none'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Default PT Amount</label>
                <input type="number" name="ptDefaultAmount" value={taxSettings.ptDefaultAmount} onChange={handleChange} min="0" step="10" className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Company Registration State</label>
                <select name="ptState" value={taxSettings.ptState} onChange={handleChange} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-700">PT slabs vary by state and gross salary. Advanced slab configuration will be available in future updates. The default amount acts as a static fallback.</p>
            </div>
          </div>
        </SettingsCard>

        {/* =========================================
            INCOME TAX (COMING SOON)
        ========================================= */}
        <SettingsCard>
          <SettingsHeader 
            title="Income Tax (TDS)" 
            description="Configure Old/New tax regimes, standard deductions, and declarations."
          />
          <div className="p-6">
            <PlaceholderTab 
              title="Advanced Tax Engine" 
              description="Full TDS calculation, regime selection, and investment declarations are coming in the next release phase."
            />
          </div>
        </SettingsCard>

      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg font-bold hover:bg-[#2563EB] transition-colors shadow-sm disabled:opacity-50">
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
          Save Settings
        </button>
      </div>

    </div>
  );
}
