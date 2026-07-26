import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RotateCcw, Save, X } from 'lucide-react';
import SettingsCard from '../components/SettingsCard';
import SettingsHeader from '../components/SettingsHeader';
import leaveTypeService from '../../../../services/leaveTypeService';

export default function LeaveManagementTab() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLeaveTypeModalOpen, setIsLeaveTypeModalOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState(null);
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: '', code: '', description: '', category: 'Paid', accrualType: 'Monthly', monthlyCreditOn: 'First day of month',
    allocation: 0, maxBalance: 0, carryForward: false, maxCarryForwardDays: 0, allowNegativeBalance: false,
    encashment: false, requireApproval: true, requireSupportingDocument: false, minimumNoticePeriod: 0,
    maxConsecutiveDays: 0, allowHalfDay: true, countWeekends: false, countHolidays: false,
    probationEligibility: false, genderRestriction: 'All', employmentType: ['All'], departments: ['All'], designations: ['All'],
    payrollImpact: 'Paid Leave', isActive: true
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const data = await leaveTypeService.getLeaveTypes(true);
      setLeaveTypes(data);
    } catch (e) {
      console.error('Error fetching leave types', e);
    }
  };

  const handleSaveLeaveType = async () => {
    try {
      if (!leaveTypeForm.name || leaveTypeForm.allocation === '' || leaveTypeForm.allocation < 0) {
        alert("Name is required and Allocation must be a non-negative number.");
        return;
      }
      if (editingLeaveType) {
        await leaveTypeService.updateLeaveType(editingLeaveType._id, leaveTypeForm);
      } else {
        await leaveTypeService.createLeaveType(leaveTypeForm);
      }
      setIsLeaveTypeModalOpen(false);
      setEditingLeaveType(null);
      fetchLeaveTypes();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to save leave type");
    }
  };

  const handleDeleteLeaveType = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this leave type?")) return;
    try {
      await leaveTypeService.deleteLeaveType(id);
      fetchLeaveTypes();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to delete leave type");
    }
  };

  return (
    <SettingsCard>
      <SettingsHeader 
        title="Dynamic Leave Configuration" 
        description="Manage leave types, rules, and payroll impacts"
        actions={
          <button
            onClick={() => {
              setEditingLeaveType(null);
              setLeaveTypeForm({
                name: '', code: '', description: '', category: 'Paid', accrualType: 'Monthly', monthlyCreditOn: 'First day of month',
                allocation: 0, maxBalance: 0, carryForward: false, maxCarryForwardDays: 0, allowNegativeBalance: false,
                encashment: false, requireApproval: true, requireSupportingDocument: false, minimumNoticePeriod: 0,
                maxConsecutiveDays: 0, allowHalfDay: true, countWeekends: false, countHolidays: false,
                probationEligibility: false, genderRestriction: 'All', employmentType: ['All'], departments: ['All'], designations: ['All'],
                payrollImpact: 'Paid Leave', isActive: true
              });
              setIsLeaveTypeModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded font-semibold text-xs hover:bg-blue-700"
          >
            <Plus size={14} /> Add Leave Type
          </button>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f8f9fa] border-b border-[#d6d9df]">
            <tr>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Leave Type</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Code</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Allocation</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {leaveTypes.map(leave => (
              <tr key={leave._id} className="hover:bg-[#f8f9fa]">
                <td className="px-5 py-3 text-sm font-semibold text-[#1E293B]">{leave.name}</td>
                <td className="px-5 py-3 text-sm text-[#475569]">{leave.code || '-'}</td>
                <td className="px-5 py-3 text-sm text-[#475569]">{leave.category}</td>
                <td className="px-5 py-3 text-sm text-[#475569] font-medium">{leave.allocation} ({leave.accrualType})</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded ${leave.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {leave.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingLeaveType(leave);
                        setLeaveTypeForm({ ...leave });
                        setIsLeaveTypeModalOpen(true);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteLeaveType(leave._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      {leave.isActive ? <Trash2 size={16} /> : <RotateCcw size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {leaveTypes.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-sm text-[#8f9192]">No leave types defined.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* LEAVE TYPE MODAL */}
      {isLeaveTypeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8f9fa] shrink-0">
              <h2 className="text-base font-bold text-[#1E293B]">{editingLeaveType ? 'Edit Leave Type' : 'Create Leave Type'}</h2>
              <button onClick={() => setIsLeaveTypeModalOpen(false)} className="text-[#8f9192] hover:text-[#1E293B]">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              
              {/* Basic Info */}
              <section>
                <h3 className="text-sm font-bold text-[#1E293B] mb-4 border-b pb-2">1. Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Leave Name *</label>
                    <input type="text" value={leaveTypeForm.name} onChange={e => setLeaveTypeForm({...leaveTypeForm, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="e.g. Sick Leave" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Code</label>
                    <input type="text" value={leaveTypeForm.code} onChange={e => setLeaveTypeForm({...leaveTypeForm, code: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" placeholder="e.g. SL" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Category</label>
                    <select value={leaveTypeForm.category} onChange={e => setLeaveTypeForm({...leaveTypeForm, category: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-bold text-[#475569] mb-1">Description</label>
                    <textarea value={leaveTypeForm.description} onChange={e => setLeaveTypeForm({...leaveTypeForm, description: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500" rows="2"></textarea>
                  </div>
                </div>
              </section>

              {/* Applicability */}
              <section>
                <h3 className="text-sm font-bold text-[#1E293B] mb-4 border-b pb-2">2. Applicability</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Gender Restriction</label>
                    <select value={leaveTypeForm.genderRestriction} onChange={e => setLeaveTypeForm({...leaveTypeForm, genderRestriction: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                      <option value="All">All</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  {/* Future scope: Multi-select for Departments and Designations could be added here. Currently defaulting to All */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Employment Type</label>
                    <div className="text-xs text-[#8f9192] italic pt-1">Currently applies to All. (Advanced filtering in Policy Module)</div>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={leaveTypeForm.probationEligibility} onChange={e => setLeaveTypeForm({...leaveTypeForm, probationEligibility: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span className="text-sm font-semibold text-[#1E293B]">Eligible during Probation</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Accrual & Allocation */}
              <section>
                <h3 className="text-sm font-bold text-[#1E293B] mb-4 border-b pb-2">3. Accrual & Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Accrual Type</label>
                    <select value={leaveTypeForm.accrualType} onChange={e => setLeaveTypeForm({...leaveTypeForm, accrualType: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="One-Time">One-Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Monthly Credit On</label>
                    <select disabled={leaveTypeForm.accrualType !== 'Monthly'} value={leaveTypeForm.monthlyCreditOn} onChange={e => setLeaveTypeForm({...leaveTypeForm, monthlyCreditOn: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100">
                      <option value="First day of month">First day of month</option>
                      <option value="Last working day">Last working day</option>
                      <option value="Custom Date">Custom Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Allocation (Days) *</label>
                    <input type="number" min="0" step="0.5" value={leaveTypeForm.allocation} onChange={e => setLeaveTypeForm({...leaveTypeForm, allocation: Math.max(0, parseFloat(e.target.value) || 0)})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Max Balance</label>
                    <input type="number" min="0" step="0.5" value={leaveTypeForm.maxBalance} onChange={e => setLeaveTypeForm({...leaveTypeForm, maxBalance: Math.max(0, parseFloat(e.target.value) || 0)})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0 (No limit)" />
                  </div>
                </div>
              </section>

              {/* Rules & Validation */}
              <section>
                <h3 className="text-sm font-bold text-[#1E293B] mb-4 border-b pb-2">4. Rules & Restrictions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={leaveTypeForm.carryForward} onChange={e => setLeaveTypeForm({...leaveTypeForm, carryForward: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span className="text-sm font-semibold text-[#1E293B]">Allow Carry Forward</span>
                    </label>
                    {leaveTypeForm.carryForward && (
                      <div>
                        <label className="block text-xs font-bold text-[#475569] mb-1">Max Carry Forward (Days)</label>
                        <input type="number" min="0" step="0.5" value={leaveTypeForm.maxCarryForwardDays} onChange={e => setLeaveTypeForm({...leaveTypeForm, maxCarryForwardDays: Math.max(0, parseFloat(e.target.value) || 0)})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={leaveTypeForm.allowHalfDay} onChange={e => setLeaveTypeForm({...leaveTypeForm, allowHalfDay: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span className="text-sm font-semibold text-[#1E293B]">Allow Half Day</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={leaveTypeForm.allowNegativeBalance} onChange={e => setLeaveTypeForm({...leaveTypeForm, allowNegativeBalance: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span className="text-sm font-semibold text-[#1E293B]">Allow Negative Balance</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={leaveTypeForm.encashment} onChange={e => setLeaveTypeForm({...leaveTypeForm, encashment: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span className="text-sm font-semibold text-[#1E293B]">Eligible for Encashment</span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={leaveTypeForm.countWeekends} onChange={e => setLeaveTypeForm({...leaveTypeForm, countWeekends: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span className="text-sm font-semibold text-[#1E293B]">Count Weekends in Leave</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={leaveTypeForm.countHolidays} onChange={e => setLeaveTypeForm({...leaveTypeForm, countHolidays: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span className="text-sm font-semibold text-[#1E293B]">Count Holidays in Leave</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Min Notice Period (Days)</label>
                    <input type="number" min="0" step="1" value={leaveTypeForm.minimumNoticePeriod} onChange={e => setLeaveTypeForm({...leaveTypeForm, minimumNoticePeriod: Math.max(0, parseInt(e.target.value) || 0)})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Max Consecutive Days</label>
                    <input type="number" min="0" step="1" value={leaveTypeForm.maxConsecutiveDays} onChange={e => setLeaveTypeForm({...leaveTypeForm, maxConsecutiveDays: Math.max(0, parseInt(e.target.value) || 0)})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="col-span-2 space-y-2 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={leaveTypeForm.requireApproval} onChange={e => setLeaveTypeForm({...leaveTypeForm, requireApproval: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span className="text-sm font-semibold text-[#1E293B]">Requires Approval</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={leaveTypeForm.requireSupportingDocument} onChange={e => setLeaveTypeForm({...leaveTypeForm, requireSupportingDocument: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                      <span className="text-sm font-semibold text-[#1E293B]">Requires Supporting Document (e.g. Medical Cert)</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Payroll Impact */}
              <section>
                <h3 className="text-sm font-bold text-[#1E293B] mb-4 border-b pb-2">5. Payroll Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Impact on Salary</label>
                    <select value={leaveTypeForm.payrollImpact} onChange={e => setLeaveTypeForm({...leaveTypeForm, payrollImpact: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500">
                      <option value="Paid Leave">Paid Leave (No Deduction)</option>
                      <option value="Unpaid Leave">Unpaid Leave (Full Deduction)</option>
                      <option value="Half Paid Leave">Half Paid Leave (50% Deduction)</option>
                    </select>
                  </div>
                </div>
              </section>

            </div>
            
            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8f9fa] flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsLeaveTypeModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLeaveType}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save size={16} /> Save Leave Type
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}
