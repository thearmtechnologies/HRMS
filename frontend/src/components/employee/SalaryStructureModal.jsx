import React, { useState, useEffect } from 'react';
import {
  X, User, IndianRupee, Clock, Calendar, History,
  Loader2, CheckCircle2, AlertTriangle, Save
} from 'lucide-react';
import { payrollConfigService } from '../../services/payrollConfigService';

const formatINR = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export default function SalaryStructureModal({ isOpen, onClose, employee, onSaved }) {
  const [activeTab, setActiveTab] = useState('setup');
  const [existingSalary, setExistingSalary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dynamic Data
  const [templates, setTemplates] = useState([]);
  const [componentsDict, setComponentsDict] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [overtimeRate, setOvertimeRate] = useState('');
  
  // Array of { componentId, value }
  const [assignedComponents, setAssignedComponents] = useState([]);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    if (isOpen && employee) {
      setActiveTab('setup');
      setError('');
      setSuccess('');
      fetchConfigData();
    }
  }, [isOpen, employee]);

  const fetchConfigData = async () => {
    setLoading(true);
    try {
      // 1. Fetch templates and components from new config
      const templatesRes = await payrollConfigService.getAllTemplates();
      setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : (Array.isArray(templatesRes) ? templatesRes : []));
      
      const compsRes = await payrollConfigService.getAllComponents();
      const compDict = {};
      const compsArray = Array.isArray(compsRes.data) ? compsRes.data : (Array.isArray(compsRes) ? compsRes : []);
      compsArray.forEach(c => {
        compDict[c._id] = c;
      });
      setComponentsDict(compDict);

      // 2. Fetch existing employee salary assignment
      const empId = employee?._id || employee?.id;
      if (empId) {
        const response = await fetch(`http://localhost:5000/api/pay/salary-fixed/employee/${empId}`, { headers });
        if (response.ok) {
          const data = await response.json();
          setExistingSalary(data);
          if (data.templateId) {
            setSelectedTemplateId(data.templateId._id || data.templateId);
          }
          if (data.assignedComponents && data.assignedComponents.length > 0) {
            setAssignedComponents(data.assignedComponents.map(ac => ({
              componentId: ac.component?._id || ac.component || '',
              value: ac.value || 0
            })));
          }
          setEffectiveDate(data.effectiveDate ? new Date(data.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
          setOvertimeRate(data.overtimeRate || '');
        } else {
          setExistingSalary(null);
          setSelectedTemplateId('');
          setAssignedComponents([]);
        }

        // Fetch history
        const histRes = await fetch(`http://localhost:5000/api/pay/salary-history/${empId}`, { headers });
        if (histRes.ok) {
          const hData = await histRes.json();
          setHistory(Array.isArray(hData) ? hData : []);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load payroll configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (tmplId) => {
    setSelectedTemplateId(tmplId);
    
    // When template changes, load default components and values
    const template = templates.find(t => t._id === tmplId);
    if (!template) {
      setAssignedComponents([]);
      return;
    }

    const newAssignment = (template.components || []).map(ref => {
      // ref is just the component ObjectId string
      const compDetails = componentsDict[ref];
      return {
        componentId: ref,
        value: compDetails ? compDetails.defaultValue : 0
      };
    });

    setAssignedComponents(newAssignment);
  };

  const handleComponentValueChange = (compId, val) => {
    setAssignedComponents(prev => prev.map(c => 
      c.componentId === compId ? { ...c, value: val } : c
    ));
  };

  const num = (v) => Number(v) || 0;

  // Calculate totals dynamically
  let grossMonthly = 0;
  let totalDeductions = 0;

  assignedComponents.forEach(ac => {
    const c = componentsDict[ac.componentId];
    if (c) {
      if (c.type === 'Earning' && c.inNet) grossMonthly += num(ac.value);
      if (c.type === 'Deduction' && c.inNet) totalDeductions += num(ac.value);
    }
  });

  const inHandMonthly = grossMonthly - totalDeductions;

  const handleSave = async () => {
    if (!selectedTemplateId) {
      setError('Please select a Payroll Template.');
      return;
    }
    if (grossMonthly <= 0) {
      setError('Gross monthly salary must be greater than 0.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const empId = employee?._id || employee?.id;
      if (!empId) throw new Error("Invalid Employee ID");
      
      const payload = {
        employeeId: empId,
        templateId: selectedTemplateId,
        assignedComponents: assignedComponents.map(ac => ({
          component: ac.componentId,
          value: num(ac.value)
        })),
        effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
        overtimeRate: num(overtimeRate)
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
        throw new Error(data.message || 'Failed to save salary structure');
      }

      setSuccess(existingSalary ? 'Salary structure updated successfully! Previous record archived.' : 'Salary structure created successfully!');
      
      // Update local state without full reload
      setExistingSalary(data.salaryDetails || data);
      
      const histRes = await fetch(`http://localhost:5000/api/pay/salary-history/${empId}`, { headers });
      if (histRes.ok) {
        const hData = await histRes.json();
        setHistory(Array.isArray(hData) ? hData : []);
      }

      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !employee) return null;

  const empName = employee.employeeName || employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  const empId = employee.employeeId || employee.tradeId || '';
  const empDept = typeof employee.department === 'object' && employee.department !== null
    ? (employee.department.departmentName || 'Unassigned')
    : (typeof employee.department === 'string' && !employee.department.match(/^[0-9a-fA-F]{24}$/) ? employee.department : 'Unassigned');
  const empDesig = employee.designation || 'N/A';

  // Group current assignments by type
  const earnings = assignedComponents.filter(ac => componentsDict[ac.componentId]?.type === 'Earning');
  const deductions = assignedComponents.filter(ac => componentsDict[ac.componentId]?.type === 'Deduction');

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />

      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex-shrink-0 bg-[#fdfdfe] flex items-center justify-between p-6 border-b border-[#d6d9df] rounded-t-2xl z-10">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Salary Structure</h2>
              <p className="text-sm text-[#8f9192] mt-0.5">{empName} · {empId}</p>
            </div>
            <button onClick={onClose} className="p-2 text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Employee Info Bar */}
          <div className="flex-shrink-0 px-6 py-3 bg-[#f0f3f5] border-b border-[#d6d9df] flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <User size={14} className="text-[#8f9192]" />
              <span className="font-medium text-[#1E293B]">{empName}</span>
            </div>
            <div>
              <span className="text-[#bdc2c7]">ID:</span>{' '}
              <span className="font-semibold text-[#8f9192]">{empId}</span>
            </div>
            <div>
              <span className="text-[#bdc2c7]">Dept:</span>{' '}
              <span className="font-semibold text-[#8f9192]">{empDept}</span>
            </div>
            <div>
              <span className="text-[#bdc2c7]">Designation:</span>{' '}
              <span className="font-semibold text-[#8f9192]">{empDesig}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex-shrink-0 px-6 pt-4 flex gap-1 border-b border-[#d6d9df]">
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
                activeTab === 'setup'
                  ? 'bg-[#fdfdfe] text-[#1E293B] border border-[#d6d9df] border-b-[#fdfdfe] -mb-px'
                  : 'text-[#8f9192] hover:text-[#1E293B]'
              }`}
            >
              <IndianRupee size={14} className="inline mr-1.5 -mt-0.5" />
              Salary Setup
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
                activeTab === 'history'
                  ? 'bg-[#fdfdfe] text-[#1E293B] border border-[#d6d9df] border-b-[#fdfdfe] -mb-px'
                  : 'text-[#8f9192] hover:text-[#1E293B]'
              }`}
            >
              <History size={14} className="inline mr-1.5 -mt-0.5" />
              Salary History ({history.length})
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[#3B82F6]" />
              </div>
            )}

            {/* ===== SETUP TAB ===== */}
            {!loading && activeTab === 'setup' && (
              <div className="p-6 space-y-6">

                {/* Messages */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertTriangle size={16} className="shrink-0" /> {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                    <CheckCircle2 size={16} className="shrink-0" /> {success}
                  </div>
                )}

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-2">Payroll Template <span className="text-red-500">*</span></label>
                  <select 
                    value={selectedTemplateId} 
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full bg-[#f0f3f5] border border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                  >
                    <option value="">-- Select a Payroll Template --</option>
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {selectedTemplateId && (
                  <div className="space-y-6">
                    {/* Earnings */}
                    {earnings.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-3 flex items-center gap-2">
                          <IndianRupee size={14} /> Earnings (Monthly)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {earnings.map(ac => {
                            const comp = componentsDict[ac.componentId];
                            if (!comp) return null;
                            return (
                              <div key={ac.componentId}>
                                <label className="block text-xs font-semibold text-[#8f9192] mb-1.5">{comp.name}</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bdc2c7] text-sm">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={ac.value}
                                    onChange={(e) => handleComponentValueChange(ac.componentId, e.target.value)}
                                    className="w-full pl-7 pr-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Deductions */}
                    {deductions.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-3 flex items-center gap-2">
                          <IndianRupee size={14} /> Deductions (Monthly)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {deductions.map(ac => {
                            const comp = componentsDict[ac.componentId];
                            if (!comp) return null;
                            return (
                              <div key={ac.componentId}>
                                <label className="block text-xs font-semibold text-[#8f9192] mb-1.5">{comp.name}</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bdc2c7] text-sm">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={ac.value}
                                    onChange={(e) => handleComponentValueChange(ac.componentId, e.target.value)}
                                    className="w-full pl-7 pr-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">


                      {/* Effective Date */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8f9192] mb-3 flex items-center gap-2">
                          <Calendar size={14} /> Configuration
                        </h3>
                        <div>
                          <label className="block text-xs font-semibold text-[#8f9192] mb-1.5">Effective Date</label>
                          <input
                            type="date"
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl p-5 text-white shadow-md">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-[10px] font-bold uppercase opacity-80">Gross Monthly</p>
                          <p className="text-xl font-bold mt-1">{formatINR(grossMonthly)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase opacity-80">Total Deductions</p>
                          <p className="text-xl font-bold mt-1 text-red-200">-{formatINR(totalDeductions)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase opacity-80">In-Hand Monthly</p>
                          <p className="text-xl font-bold mt-1">{formatINR(inHandMonthly)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== HISTORY TAB ===== */}
            {!loading && activeTab === 'history' && (
              <div className="p-6">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-[#bdc2c7]">
                    <History size={40} className="mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No salary history found</p>
                    <p className="text-xs mt-1">Salary records will appear here after assignment.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-[#f0f3f5]/50 border-b border-[#d6d9df] text-xs font-bold uppercase tracking-wider text-[#bdc2c7]">
                          <th className="px-4 py-3">Effective Date</th>
                          <th className="px-4 py-3">Template</th>
                          <th className="px-4 py-3 text-right">Gross Monthly</th>
                          <th className="px-4 py-3 text-right">In-Hand</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f3f5]">
                        {history.map((record, i) => (
                          <tr key={record._id || i} className="hover:bg-[#f0f3f5]/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-[#1E293B]">
                              {record.effectiveDate ? new Date(record.effectiveDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-[#475569]">
                              {record.templateId ? (record.templateId.name || 'Legacy') : 'Legacy Assignment'}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-[#1E293B]">
                              {formatINR(record.grossMonthly)}
                            </td>
                            <td className="px-4 py-3 text-right text-[#8f9192]">
                              {formatINR(record.inHandMonthly)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {record.isActive ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                  Archived
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === 'setup' && !loading && (
            <div className="flex-shrink-0 bg-[#fdfdfe] flex items-center justify-between gap-3 p-6 border-t border-[#d6d9df] rounded-b-2xl z-10">
              <p className="text-xs text-[#bdc2c7]">
                {existingSalary
                  ? 'Updating will archive the current structure and create a new one.'
                  : 'This will create the first salary structure for this employee.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedTemplateId}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : existingSalary ? 'Update Salary' : 'Assign Salary'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
