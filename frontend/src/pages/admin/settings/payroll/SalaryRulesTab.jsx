import React, { useState, useEffect } from 'react';
import SettingsCard from '../components/SettingsCard';
import SettingsHeader from '../components/SettingsHeader';
import { Plus, Edit2, Search, Filter, Eye, CheckCircle2, X, LayoutTemplate, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { payrollConfigService } from '../../../../services/payrollConfigService';

export default function SalaryRulesTab() {
  const [components, setComponents] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  // App States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Search
  const [componentFilter, setComponentFilter] = useState('All');
  const [componentSearch, setComponentSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState(null);

  // Modals
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [componentForm, setComponentForm] = useState(getInitialComponentForm());

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState(getInitialTemplateForm());

  // Load Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [compsData, tplsData] = await Promise.all([
        payrollConfigService.getAllComponents(),
        payrollConfigService.getAllTemplates()
      ]);
      setComponents(compsData);
      setTemplates(tplsData);
    } catch (err) {
      setError(err.message || 'Failed to load salary rules data');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  // Initial Form States
  function getInitialComponentForm() {
    return { name: '', code: '', description: '', type: 'Earning', calculationType: 'Fixed Amount', taxable: true, inCTC: true, inNet: true, defaultValue: 0, displayOrder: 99, active: true };
  }

  function getInitialTemplateForm() {
    return { name: '', description: '', components: [], active: true };
  }

  // ----------------------------------------------------
  // COMPONENT CRUD
  // ----------------------------------------------------
  const handleOpenComponentModal = (comp = null) => {
    if (comp) {
      setEditingComponent(comp);
      setComponentForm({ ...comp });
    } else {
      setEditingComponent(null);
      setComponentForm(getInitialComponentForm());
    }
    setIsComponentModalOpen(true);
  };

  const handleSaveComponent = async () => {
    if (!componentForm.name.trim() || !componentForm.code.trim()) {
      showError("Name and Code are required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingComponent) {
        const updated = await payrollConfigService.updateComponent(editingComponent._id, componentForm);
        setComponents(prev => prev.map(c => c._id === updated._id ? updated : c));
        showSuccess('Component updated successfully');
      } else {
        const created = await payrollConfigService.createComponent(componentForm);
        setComponents(prev => [...prev, created]);
        showSuccess('Component created successfully');
      }
      setIsComponentModalOpen(false);
      // Refresh preview if affected
      if (selectedTemplateForPreview) setSelectedTemplateForPreview({ ...selectedTemplateForPreview });
    } catch (err) {
      showError(err.message || 'Error saving component');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComponent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this component?")) return;
    
    try {
      await payrollConfigService.deleteComponent(id);
      setComponents(prev => prev.filter(c => c._id !== id));
      showSuccess('Component deleted successfully');
    } catch (err) {
      showError(err.message || 'Error deleting component');
    }
  };

  // ----------------------------------------------------
  // TEMPLATE CRUD
  // ----------------------------------------------------
  const handleOpenTemplateModal = (tpl = null, duplicate = false) => {
    if (tpl) {
      if (duplicate) {
        setEditingTemplate(null);
        setTemplateForm({ ...tpl, name: `${tpl.name} (Copy)` });
      } else {
        setEditingTemplate(tpl);
        setTemplateForm({ ...tpl });
      }
    } else {
      setEditingTemplate(null);
      setTemplateForm(getInitialTemplateForm());
    }
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) {
      showError("Template name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      let saved;
      if (editingTemplate) {
        saved = await payrollConfigService.updateTemplate(editingTemplate._id, templateForm);
        setTemplates(prev => prev.map(t => t._id === saved._id ? saved : t));
        showSuccess('Template updated successfully');
      } else {
        saved = await payrollConfigService.createTemplate(templateForm);
        setTemplates(prev => [saved, ...prev]);
        showSuccess('Template created successfully');
      }
      
      setIsTemplateModalOpen(false);
      if (selectedTemplateForPreview && selectedTemplateForPreview._id === (editingTemplate?._id || saved._id)) {
        setSelectedTemplateForPreview(saved);
      }
    } catch (err) {
      showError(err.message || 'Error saving template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await payrollConfigService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t._id !== id));
      if (selectedTemplateForPreview?._id === id) {
        setSelectedTemplateForPreview(null);
      }
      showSuccess('Template deleted successfully');
    } catch (err) {
      showError(err.message || 'Error deleting template');
    }
  };

  // ----------------------------------------------------
  // FILTERING
  // ----------------------------------------------------
  const filteredComponents = components.filter(c => {
    const searchLower = componentSearch.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(searchLower) || c.code.toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;
    
    if (componentFilter === 'Earnings') return c.type === 'Earning' && c.active;
    if (componentFilter === 'Deductions') return c.type === 'Deduction' && c.active;
    if (componentFilter === 'Inactive') return !c.active;
    return true; // All
  });

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(templateSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading Salary Rules Configuration...</p>
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

      {/* =========================================
          SECTION 1: SALARY COMPONENTS
      ========================================= */}
      <SettingsCard>
        <SettingsHeader 
          title="Salary Components Builder" 
          description="Create and manage all possible earnings and deductions."
          actions={
            <button onClick={() => handleOpenComponentModal()} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded font-semibold text-xs hover:bg-blue-700">
              <Plus size={14} /> Add Component
            </button>
          }
        />
        
        <div className="p-4 border-b border-[#e2e8f0] bg-[#f8f9fa] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Earnings', 'Deductions', 'Inactive'].map(filter => (
              <button 
                key={filter} 
                onClick={() => setComponentFilter(filter)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors whitespace-nowrap ${
                  componentFilter === filter 
                  ? 'bg-[#1E293B] text-white' 
                  : 'bg-white border border-[#d6d9df] text-[#64748B] hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search components..." 
              value={componentSearch}
              onChange={e => setComponentSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-[#d6d9df] rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f0f3f5] border-b border-[#d6d9df]">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Component</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Calculation</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider text-center">In CTC</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider text-center">Taxable</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredComponents.map(c => (
                <tr key={c._id} className={`hover:bg-[#f8f9fa] ${!c.active && 'opacity-50 grayscale'}`}>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-sm text-[#1E293B] flex items-center gap-2">
                      {c.name}
                      {!c.active && <span className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded uppercase">Inactive</span>}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{c.code}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${c.type === 'Earning' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-sm text-[#475569]">
                      {c.calculationType === 'Variable' ? 'Custom amount' : c.calculationType === 'Formula' ? 'Formula (Store Only)' : c.calculationType}
                    </div>
                    {((c.calculationType === 'Fixed Amount' || c.calculationType === 'Variable') && c.defaultValue > 0) && (
                      <div className="text-[10px] text-gray-500 font-bold mt-0.5">₹ {c.defaultValue}</div>
                    )}
                    {(c.calculationType === 'Percentage' && c.defaultValue > 0) && (
                      <div className="text-[10px] text-gray-500 font-bold mt-0.5">{c.defaultValue} %</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {c.inCTC ? <CheckCircle2 size={16} className="text-green-500 mx-auto" /> : <div className="w-3 h-0.5 bg-gray-300 mx-auto rounded"></div>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {c.taxable ? <CheckCircle2 size={16} className="text-red-400 mx-auto" /> : <div className="w-3 h-0.5 bg-gray-300 mx-auto rounded"></div>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenComponentModal(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Component">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteComponent(c._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Component">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredComponents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-sm text-[#8f9192]">No components found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      {/* =========================================
          SECTION 2: PAYROLL TEMPLATES
      ========================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Templates List */}
        <SettingsCard className="xl:col-span-2 flex flex-col">
          <SettingsHeader 
            title="Payroll Templates" 
            description="Bundle components into templates for easy assignment to employees."
            actions={
              <button onClick={() => handleOpenTemplateModal()} className="flex items-center gap-1.5 px-3 py-2 bg-[#1E293B] text-white rounded font-semibold text-xs hover:bg-[#0F172A]">
                <LayoutTemplate size={14} /> Create Template
              </button>
            }
          />
          <div className="p-4 border-b border-[#e2e8f0] bg-[#f8f9fa] flex justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search templates..." 
                value={templateSearch}
                onChange={e => setTemplateSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-[#d6d9df] rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-[#f0f3f5] border-b border-[#d6d9df]">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Template Name</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider text-center">Components</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider text-center">Status</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredTemplates.map(t => (
                  <tr 
                    key={t._id} 
                    onClick={() => setSelectedTemplateForPreview(t)}
                    className={`cursor-pointer transition-colors ${selectedTemplateForPreview?._id === t._id ? 'bg-blue-50/50' : 'hover:bg-[#f8f9fa]'}`}
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                        {t.name}
                        {!t.active && <span className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded uppercase">Inactive</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{t.description}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 font-bold text-xs rounded-full h-6 w-6 ring-2 ring-white">
                        {t.components.length}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {t.active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold">ACTIVE</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">INACTIVE</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-gray-100 rounded transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedTemplateForPreview(t); }} title="Preview">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" onClick={(e) => { e.stopPropagation(); handleOpenTemplateModal(t, true); }} title="Duplicate">
                          <Plus size={16} />
                        </button>
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={(e) => { e.stopPropagation(); handleOpenTemplateModal(t); }} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t._id); }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTemplates.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-sm text-[#8f9192]">No templates found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SettingsCard>

        {/* Template Preview Panel */}
        <SettingsCard className="bg-slate-50 border-dashed border-2 flex flex-col h-full min-h-[400px]">
          {selectedTemplateForPreview ? (
            <>
              <div className="p-5 border-b border-[#e2e8f0] bg-white flex justify-between items-start rounded-t-xl">
                <div>
                  <h3 className="font-bold text-[#1E293B] flex items-center gap-2">
                    <LayoutTemplate size={18} className="text-blue-500" />
                    {selectedTemplateForPreview.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{selectedTemplateForPreview.description}</p>
                </div>
                <button onClick={() => setSelectedTemplateForPreview(null)} className="text-gray-400 hover:text-gray-700">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Included Components</h4>
                <div className="space-y-3">
                  {selectedTemplateForPreview.components.map(compId => {
                    const comp = components.find(c => c._id === compId);
                    if(!comp) return null;
                    return (
                      <div key={compId} className={`flex items-center justify-between p-3 bg-white rounded-lg border border-[#e2e8f0] shadow-sm ${!comp.active && 'opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={16} className={comp.type === 'Earning' ? 'text-green-500' : 'text-orange-400'} />
                          <div>
                            <div className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                              {comp.name}
                              {!comp.active && <span className="text-[9px] px-1 py-0.5 bg-red-100 text-red-600 rounded uppercase">Inactive Component</span>}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                              {comp.type} &middot; {comp.calculationType === 'Variable' ? 'Custom amount' : comp.calculationType === 'Formula' ? 'Formula (Store Only)' : comp.calculationType}
                              {(comp.calculationType === 'Fixed Amount' || comp.calculationType === 'Variable') && comp.defaultValue > 0 ? ` (₹${comp.defaultValue})` : ''}
                              {comp.calculationType === 'Percentage' && comp.defaultValue > 0 ? ` (${comp.defaultValue}%)` : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Eye size={24} className="text-blue-400" />
              </div>
              <h3 className="font-bold text-[#1E293B] text-sm mb-2">Template Preview</h3>
              <p className="text-xs text-gray-500">Select a template from the table to preview its configuration and included salary components.</p>
            </div>
          )}
        </SettingsCard>

      </div>

      {/* =========================================
          COMPONENT FORM MODAL
      ========================================= */}
      {isComponentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8f9fa]">
              <h2 className="text-base font-bold text-[#1E293B]">{editingComponent ? 'Edit Salary Component' : 'Create Salary Component'}</h2>
              <button onClick={() => setIsComponentModalOpen(false)} className="text-[#8f9192] hover:text-[#1E293B]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Component Name *</label>
                  <input type="text" value={componentForm.name} onChange={e => setComponentForm({...componentForm, name: e.target.value})} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100" placeholder="e.g. Travel Allowance" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Code / Short Name *</label>
                  <input type="text" value={componentForm.code} onChange={e => setComponentForm({...componentForm, code: e.target.value.toUpperCase()})} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100" placeholder="e.g. TRAV" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Description</label>
                <input type="text" value={componentForm.description} onChange={e => setComponentForm({...componentForm, description: e.target.value})} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100" placeholder="Brief description of this component" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Component Type</label>
                  <select value={componentForm.type} onChange={e => setComponentForm({...componentForm, type: e.target.value})} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100">
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Calculation Type</label>
                  <select value={componentForm.calculationType} onChange={e => setComponentForm({...componentForm, calculationType: e.target.value})} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100">
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Percentage">Percentage</option>
                    <option value="Variable">Custom amount</option>
                    <option value="Formula">Formula (Store Only)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Input based on Calculation Type */}
              {(componentForm.calculationType === 'Fixed Amount' || componentForm.calculationType === 'Percentage' || componentForm.calculationType === 'Variable') && (
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    {componentForm.calculationType === 'Percentage' ? 'Percentage Value (%)' : 'Amount (₹)'}
                  </label>
                  <input 
                    type="number" 
                    value={componentForm.defaultValue} 
                    onChange={e => setComponentForm({...componentForm, defaultValue: Number(e.target.value)})} 
                    className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100" 
                    placeholder={componentForm.calculationType === 'Percentage' ? 'e.g. 10' : 'e.g. 5000'}
                    min="0"
                    step={componentForm.calculationType === 'Percentage' ? "0.01" : "1"}
                  />
                  {componentForm.calculationType === 'Variable' && (
                    <p className="text-[10px] text-gray-500 mt-1">This acts as a default value but can be customized per employee during assignment.</p>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-dashed border-[#e2e8f0]">
                <h4 className="text-sm font-bold text-[#1E293B]">Behavior Flags</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={componentForm.inCTC} onChange={e => setComponentForm({...componentForm, inCTC: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span className="text-sm font-medium text-[#475569]">Include in CTC (Cost to Company)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={componentForm.inNet} onChange={e => setComponentForm({...componentForm, inNet: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span className="text-sm font-medium text-[#475569]">Include in Net Pay Calculation</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={componentForm.taxable} onChange={e => setComponentForm({...componentForm, taxable: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span className="text-sm font-medium text-[#475569]">Taxable Component (Subject to Income Tax)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={componentForm.active} onChange={e => setComponentForm({...componentForm, active: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span className="text-sm font-medium text-[#475569]">Active Component</span>
                </label>
              </div>

            </div>
            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8f9fa] flex justify-end gap-3">
              <button onClick={() => setIsComponentModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSaveComponent} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Save Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          TEMPLATE BUILDER FORM MODAL
      ========================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8f9fa]">
              <h2 className="text-base font-bold text-[#1E293B]">{editingTemplate ? 'Edit Payroll Template' : 'Create Payroll Template'}</h2>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-[#8f9192] hover:text-[#1E293B]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-8 overflow-y-auto">
              
              {/* Left Side: Template Info */}
              <div className="md:w-1/3 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Template Name *</label>
                  <input type="text" value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100" placeholder="e.g. Sales Executive" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Description</label>
                  <textarea value={templateForm.description} onChange={e => setTemplateForm({...templateForm, description: e.target.value})} className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 h-24" placeholder="Brief description of who this template applies to..."></textarea>
                </div>
                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input type="checkbox" checked={templateForm.active} onChange={e => setTemplateForm({...templateForm, active: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span className="text-sm font-medium text-[#475569]">Active Template</span>
                </label>
              </div>

              {/* Right Side: Component Selector */}
              <div className="md:w-2/3 border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col h-[500px]">
                <div className="p-3 bg-[#f0f3f5] border-b border-[#e2e8f0]">
                  <h4 className="text-sm font-bold text-[#1E293B]">Assign Components</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Select the earnings and deductions for this template.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  
                  {/* Earnings Group */}
                  <div>
                    <h5 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">Earnings</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {components.filter(c => c.type === 'Earning' && c.active).map(c => (
                        <label key={c._id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${templateForm.components.includes(c._id) ? 'bg-green-50 border-green-200' : 'bg-white border-[#e2e8f0] hover:bg-gray-50'}`}>
                          <input 
                            type="checkbox" 
                            className="mt-0.5 rounded text-green-600 focus:ring-green-500"
                            checked={templateForm.components.includes(c._id)}
                            onChange={(e) => {
                              if (e.target.checked) setTemplateForm({ ...templateForm, components: [...templateForm.components, c._id] });
                              else setTemplateForm({ ...templateForm, components: templateForm.components.filter(id => id !== c._id) });
                            }}
                          />
                          <div>
                            <div className={`text-sm font-bold ${templateForm.components.includes(c._id) ? 'text-green-800' : 'text-[#1E293B]'}`}>{c.name}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{c.calculationType}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Deductions Group */}
                  <div>
                    <h5 className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3">Deductions</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {components.filter(c => c.type === 'Deduction' && c.active).map(c => (
                        <label key={c._id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${templateForm.components.includes(c._id) ? 'bg-orange-50 border-orange-200' : 'bg-white border-[#e2e8f0] hover:bg-gray-50'}`}>
                          <input 
                            type="checkbox" 
                            className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                            checked={templateForm.components.includes(c._id)}
                            onChange={(e) => {
                              if (e.target.checked) setTemplateForm({ ...templateForm, components: [...templateForm.components, c._id] });
                              else setTemplateForm({ ...templateForm, components: templateForm.components.filter(id => id !== c._id) });
                            }}
                          />
                          <div>
                            <div className={`text-sm font-bold ${templateForm.components.includes(c._id) ? 'text-orange-800' : 'text-[#1E293B]'}`}>{c.name}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{c.calculationType}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8f9fa] flex justify-end gap-3">
              <button onClick={() => setIsTemplateModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSaveTemplate} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
