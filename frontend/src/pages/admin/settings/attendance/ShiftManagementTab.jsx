import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Save, X } from 'lucide-react';
import SettingsCard from '../components/SettingsCard';
import SettingsHeader from '../components/SettingsHeader';
import shiftService from '../../../../services/shiftService';

export default function ShiftManagementTab() {
  const [shifts, setShifts] = useState([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    name: '', type: 'Fixed', startTime: '09:00', endTime: '18:00',
    weeklyOffDays: ['Sunday'], breakDuration: 1, isDefault: false,
    lateCheckInGraceTime: 0, earlyCheckOutGraceTime: 0
  });

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const data = await shiftService.getShifts();
      setShifts(data);
    } catch (e) {
      console.error('Error fetching shifts', e);
    }
  };

  const handleSaveShift = async () => {
    try {
      if (!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) {
        alert("Name, Start Time, and End Time are required.");
        return;
      }
      if (editingShift) {
        await shiftService.updateShift(editingShift._id, shiftForm);
      } else {
        await shiftService.createShift(shiftForm);
      }
      setIsShiftModalOpen(false);
      setEditingShift(null);
      fetchShifts();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to save shift");
    }
  };

  return (
    <SettingsCard>
      <SettingsHeader 
        title="Shift Configurations" 
        description="Define working hours and break durations"
        actions={
          <button
            onClick={() => {
              setEditingShift(null);
              setShiftForm({ name: '', type: 'Fixed', startTime: '09:00', endTime: '18:00', weeklyOffDays: ['Sunday'], breakDuration: 1, isDefault: false, lateCheckInGraceTime: 0, earlyCheckOutGraceTime: 0 });
              setIsShiftModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded font-semibold text-xs hover:bg-blue-700"
          >
            <Plus size={14} /> Add Shift
          </button>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f8f9fa] border-b border-[#d6d9df]">
            <tr>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Shift Name</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Type</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Timings</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider">Weekly Off</th>
              <th className="px-5 py-3 text-[11px] font-bold text-[#8f9192] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {shifts.map(shift => (
              <tr key={shift._id} className="hover:bg-[#f8f9fa]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1E293B]">{shift.name}</span>
                    {shift.isDefault && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">DEFAULT</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-[#475569]">{shift.type}</td>
                <td className="px-5 py-3 text-sm text-[#475569] font-medium">{shift.startTime} - {shift.endTime}</td>
                <td className="px-5 py-3 text-sm text-[#475569]">{shift.weeklyOffDays.join(', ')}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => {
                      setEditingShift(shift);
                      setShiftForm({
                        name: shift.name,
                        type: shift.type || 'Fixed',
                        startTime: shift.startTime,
                        endTime: shift.endTime,
                        weeklyOffDays: shift.weeklyOffDays || ['Sunday'],
                        breakDuration: shift.breakDuration || 1,
                        isDefault: shift.isDefault || false,
                        lateCheckInGraceTime: shift.lateCheckInGraceTime || 0,
                        earlyCheckOutGraceTime: shift.earlyCheckOutGraceTime || 0
                      });
                      setIsShiftModalOpen(true);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {shifts.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-sm text-[#8f9192]">No shifts defined.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SHIFT CREATE/EDIT MODAL */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8f9fa]">
              <h2 className="text-base font-bold text-[#1E293B]">{editingShift ? 'Edit Shift' : 'Create Shift'}</h2>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-[#8f9192] hover:text-[#1E293B]">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Shift Name *</label>
                <input
                  type="text"
                  value={shiftForm.name}
                  onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })}
                  className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="e.g. Morning Shift"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Type</label>
                  <select
                    value={shiftForm.type}
                    onChange={e => setShiftForm({ ...shiftForm, type: e.target.value })}
                    className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Break (Hours)</label>
                  <input
                    type="number"
                    value={shiftForm.breakDuration}
                    onChange={e => setShiftForm({ ...shiftForm, breakDuration: Number(e.target.value) })}
                    className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={shiftForm.startTime}
                    onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">End Time *</label>
                  <input
                    type="time"
                    value={shiftForm.endTime}
                    onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Weekly Off Days</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} className="flex items-center gap-1.5 bg-[#f8f9fa] px-2 py-1 rounded border border-[#e2e8f0] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shiftForm.weeklyOffDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setShiftForm({ ...shiftForm, weeklyOffDays: [...shiftForm.weeklyOffDays, day] });
                          } else {
                            setShiftForm({ ...shiftForm, weeklyOffDays: shiftForm.weeklyOffDays.filter(d => d !== day) });
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] font-medium text-[#475569]">{day.substring(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-[#e2e8f0]">
                <h3 className="text-sm font-bold text-[#1E293B] mb-3">Grace Time Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Late Check-In <span className="text-[#8f9192] font-normal">(minutes)</span></label>
                    <input
                      type="number"
                      value={shiftForm.lateCheckInGraceTime}
                      onChange={e => setShiftForm({ ...shiftForm, lateCheckInGraceTime: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      min="0"
                      step="1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Early Check-Out <span className="text-[#8f9192] font-normal">(minutes)</span></label>
                    <input
                      type="number"
                      value={shiftForm.earlyCheckOutGraceTime}
                      onChange={e => setShiftForm({ ...shiftForm, earlyCheckOutGraceTime: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full border border-[#d6d9df] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      min="0"
                      step="1"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#e2e8f0]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shiftForm.isDefault}
                    onChange={e => setShiftForm({ ...shiftForm, isDefault: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-[#1E293B]">Set as Default Shift</span>
                </label>
                <p className="text-xs text-[#8f9192] ml-6 mt-1">This shift will be automatically assigned to new employees if no specific shift is chosen.</p>
              </div>
            </div>
            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8f9fa] flex justify-end gap-3">
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShift}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save size={16} /> Save Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}
