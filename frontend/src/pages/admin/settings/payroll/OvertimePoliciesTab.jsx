import React, { useState, useEffect } from 'react';
import SettingsCard from '../components/SettingsCard';
import SettingsHeader from '../components/SettingsHeader';
import { Plus, Edit2, Trash2, Loader2, Clock } from 'lucide-react';
import { payrollConfigService } from '../../../../services/payrollConfigService';

export default function OvertimePoliciesTab() {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  
  const getInitialForm = () => ({
    name: '',
    description: '',
    calculationType: 'Fixed Amount',
    rate: 0,
    minimumOvertimeHours: 0,
    isActive: true
  });
  
  const [form, setForm] = useState(getInitialForm());

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const data = await payrollConfigService.getAllOvertimePolicies();
      setPolicies(data);
    } catch (err) {
      setError(err.message || 'Failed to load overtime policies');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 5000); };

  const handleOpenModal = (policy = null) => {
    if (policy) {
      setEditingPolicy(policy);
      setForm({ ...policy });
    } else {
      setEditingPolicy(null);
      setForm(getInitialForm());
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.rate <= 0) {
      showError("Name and a valid rate are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingPolicy) {
        const updated = await payrollConfigService.updateOvertimePolicy(editingPolicy._id, form);
        setPolicies(prev => prev.map(p => p._id === updated._id ? updated : p));
        showSuccess('Policy updated successfully');
      } else {
        const created = await payrollConfigService.createOvertimePolicy(form);
        setPolicies(prev => [...prev, created]);
        showSuccess('Policy created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    try {
      await payrollConfigService.deleteOvertimePolicy(id);
      setPolicies(prev => prev.filter(p => p._id !== id));
      showSuccess('Policy deleted successfully');
    } catch (err) {
      showError(err.message || 'Failed to delete policy');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-medium">
          {success}
        </div>
      )}

      <SettingsCard>
        <SettingsHeader 
          title="Overtime Policies" 
          description="Manage overtime rules, rates, and minimum hour requirements"
          actions={
            <button 
              onClick={() => handleOpenModal()} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> New Policy
            </button>
          }
        />
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 font-medium">No overtime policies configured</p>
              <p className="text-sm text-gray-400 mt-1">Create a policy to start tracking overtime pay</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map(policy => (
                <div key={policy._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900">{policy.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${policy.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {policy.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{policy.description}</p>
                    )}
                    
                    <div className="space-y-2 mt-auto">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Calculation</span>
                        <span className="font-semibold text-gray-800">{policy.calculationType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rate</span>
                        <span className="font-bold text-blue-600">
                          {policy.calculationType === 'Fixed Amount' ? `₹${policy.rate}/hr` : `${policy.rate}x Hourly`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Min. OT Hours</span>
                        <span className="font-semibold text-gray-800">{policy.minimumOvertimeHours} hrs</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(policy)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(policy._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsCard>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">
                {editingPolicy ? 'Edit Overtime Policy' : 'Create Overtime Policy'}
              </h3>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Policy Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Factory Overtime"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Optional description..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Calculation Type</label>
                  <select 
                    value={form.calculationType} 
                    onChange={e => setForm({...form, calculationType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Multiplier">Multiplier (x Hourly)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Rate {form.calculationType === 'Fixed Amount' ? '(₹)' : '(x)'}
                  </label>
                  <input 
                    type="number" 
                    value={form.rate} 
                    onChange={e => setForm({...form, rate: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                    step={form.calculationType === 'Multiplier' ? '0.1' : '1'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Overtime Hours</label>
                <p className="text-xs text-gray-500 mb-2">Employee must complete this many hours of overtime before any overtime is payable.</p>
                <input 
                  type="number" 
                  value={form.minimumOvertimeHours} 
                  onChange={e => setForm({...form, minimumOvertimeHours: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  min="0"
                  step="0.5"
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={e => setForm({...form, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">Policy is Active</span>
              </label>
            </div>
            
            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors min-w-[100px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
