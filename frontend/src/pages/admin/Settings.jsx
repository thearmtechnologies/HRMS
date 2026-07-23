import React, { useState, useEffect, useContext } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserSquare2, 
  History, 
  Plus, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  Save, 
  AlertCircle,
  RotateCcw,
  Clock
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import shiftService from '../../services/shiftService';

const PERMISSION_CONFIG = {
  dashboard: { label: 'Dashboard', actions: ['view'] },
  employee_management: { label: 'Employee Management', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  verification_center: { label: 'Verification Center', actions: ['view', 'approve'] },
  attendance: { label: 'Attendance', actions: ['view', 'regularize'] },
  team_attendance: { label: 'Team Attendance', actions: ['view', 'export', 'edit', 'approve'] },
  leave_management: { label: 'Leave Management', actions: ['view', 'approve', 'create', 'edit'] },
  payroll: { label: 'Payroll', actions: ['view', 'create', 'edit', 'generate', 'approve', 'mark_paid', 'export'] },
  departments: { label: 'Departments', actions: ['view', 'create', 'edit', 'delete'] },
  projects: { label: 'Projects', actions: ['view', 'create', 'assign', 'edit', 'archive'] },
  reports: { label: 'Reports', actions: ['view', 'export'] },
  settings: { label: 'Settings', actions: ['view', 'edit'] },
  holiday_management: { label: 'Holiday Management', actions: ['view', 'create', 'edit', 'delete'] },
  shift_management: { label: 'Shift Management', actions: ['view', 'create', 'edit', 'delete'] },
  site_management: { label: 'Site Management', actions: ['view', 'create', 'edit', 'delete'] },
  notes: { label: 'Notes', actions: ['view', 'create', 'edit', 'delete'] },
  virtual_id: { label: 'Virtual ID', actions: ['view'] },
  employee_profile: { label: 'Employee Profile', actions: ['view', 'edit'] }
};

export default function Settings() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('roles'); // company, roles, designations, audit

  // Designations State
  const [designations, setDesignations] = useState([]);
  const [newDesignation, setNewDesignation] = useState('');
  const [editingDesig, setEditingDesig] = useState(null);

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Individual Employee Overrides State
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Audit State
  // Audit State
  const [auditLogs, setAuditLogs] = useState([]);

  // Shifts State
  const [shifts, setShifts] = useState([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    name: '', type: 'Fixed', startTime: '09:00', endTime: '18:00',
    weeklyOffDays: ['Sunday'], breakDuration: 1, isDefault: false
  });

  useEffect(() => {
    if (activeTab === 'designations') fetchDesignations();
    if (activeTab === 'roles') {
      fetchRoles();
      fetchEmployees();
    }
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'shifts') fetchShifts();
  }, [activeTab]);

  // --- API CALLS ---
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

  const fetchDesignations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/designations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDesignations(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        if (data.length > 0 && !selectedRole) {
          handleSelectRole(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employee', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAuditLogs(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  // --- DESIGNATION HANDLERS ---
  const handleAddDesignation = async (e) => {
    e.preventDefault();
    if (!newDesignation.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/settings/designations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newDesignation })
      });
      if (res.ok) {
        setNewDesignation('');
        fetchDesignations();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleDesignation = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/settings/designations/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDesignations();
    } catch (e) {
      console.error(e);
    }
  };

  // --- ROLE & EMPLOYEE HANDLERS ---
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setSelectedEmployee(null); // Clear employee selection
    // Initialize permissions state ensuring all config modules are present
    const initializedPerms = Object.keys(PERMISSION_CONFIG).map(moduleKey => {
      const existing = role.permissions.find(p => p.module === moduleKey);
      if (existing) {
        return { ...existing };
      }
      return { module: moduleKey, view: false, create: false, edit: false, delete: false, approve: false, export: false, regularize: false, generate: false, mark_paid: false, assign: false, archive: false };
    });
    setRolePermissions(initializedPerms);
  };

  const handleSelectEmployee = async (employeeId) => {
    if (!employeeId) return;
    const emp = employees.find(e => e._id === employeeId);
    if (!emp) return;
    
    setSelectedRole(null); // Clear role selection
    setSelectedEmployee(emp);

    try {
      // Fetch fresh employee details to get their user.permissionOverrides
      const res = await fetch(`http://localhost:5000/api/employee/${emp._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const fullEmp = await res.json();
        const overrides = fullEmp.user?.permissionOverrides || [];
        
        // Match overrides to matrix
        const initializedPerms = Object.keys(PERMISSION_CONFIG).map(moduleKey => {
          const existing = overrides.find(p => p.module === moduleKey);
          if (existing) return { ...existing };
          return { module: moduleKey, view: false, create: false, edit: false, delete: false, approve: false, export: false, regularize: false, generate: false, mark_paid: false, assign: false, archive: false };
        });
        setRolePermissions(initializedPerms);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePermission = (moduleKey, action) => {
    setRolePermissions(prev => prev.map(perm => {
      if (perm.module === moduleKey) {
        const updated = { ...perm, [action]: !perm[action] };
        // If enabling any action other than view, automatically enable view
        if (action !== 'view' && updated[action] === true) {
          updated.view = true;
        }
        // If disabling view, disable everything else
        if (action === 'view' && updated.view === false) {
          Object.keys(updated).forEach(k => {
            if (k !== 'module') updated[k] = false;
          });
        }
        return updated;
      }
      return perm;
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole && !selectedEmployee) return;
    setSavingPermissions(true);
    try {
      let url, method, bodyData;
      
      if (selectedRole) {
        url = `http://localhost:5000/api/settings/roles/${selectedRole._id}/permissions`;
        method = 'PUT';
        bodyData = { permissions: rolePermissions };
      } else {
        url = `http://localhost:5000/api/employee/${selectedEmployee._id}/permissions`;
        method = 'PUT';
        bodyData = { permissions: rolePermissions };
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bodyData)
      });
      
      if (res.ok) {
        alert('Permissions saved successfully!');
        if (selectedRole) fetchRoles();
        // If employee, no need to refresh list, state is up to date
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (e) {
      console.error(e);
      alert('Error saving permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleResetEmployeePermissions = async () => {
    if (!selectedEmployee) return;
    if (!window.confirm(`Are you sure you want to reset ${selectedEmployee.firstName}'s overrides to role defaults?`)) return;
    
    setSavingPermissions(true);
    try {
      const res = await fetch(`http://localhost:5000/api/employee/${selectedEmployee._id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ permissions: null })
      });
      
      if (res.ok) {
        alert('Overrides removed. User now inherits role defaults.');
        handleSelectEmployee(selectedEmployee._id); // refresh the matrix
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (e) {
      console.error(e);
      alert('Error resetting permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  // --- RENDER HELPERS ---
  const formatActionName = (str) => {
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">System Settings</h1>
        <p className="text-sm text-[#8f9192] mt-1">Configure company, roles, permissions, and designations</p>
      </div>

      <div className="flex gap-4 border-b border-[#d6d9df]">
        {[
          { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
          { id: 'designations', label: 'Designations', icon: UserSquare2 },
          { id: 'audit', label: 'Audit Logs', icon: History },
          { id: 'shifts', label: 'Shift Management', icon: Clock },
          { id: 'company', label: 'Company Info', icon: Building2 },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === t.id ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#8f9192] hover:text-[#1E293B]'}`}
          >
            <t.icon size={18} />
            {t.label}
          </button>
        ))}
      </div>

      {/* --- ROLES & PERMISSIONS TAB --- */}
      {activeTab === 'roles' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Roles & Employees List */}
          <div className="w-full lg:w-64 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-2">System Roles</h3>
              {roles.map(role => (
                <button
                  key={role._id}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedRole?._id === role._id ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-md' : 'bg-white text-[#1E293B] border-[#d6d9df] hover:border-[#3B82F6]/50'}`}
                >
                  <div className="font-bold">{role.displayName}</div>
                  <div className={`text-xs ${selectedRole?._id === role._id ? 'text-blue-100' : 'text-[#8f9192]'}`}>System Role</div>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-[#d6d9df]">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-2">Individual Access</h3>
              <p className="text-xs text-[#8f9192] mb-3">Select an employee to override their default role permissions.</p>
              <label htmlFor="selectEmployeeAccess" className="sr-only">Select Employee</label>
              <select 
                id="selectEmployeeAccess"
                name="selectEmployeeAccess"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${selectedEmployee ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-md' : 'bg-white text-[#1E293B] border-[#d6d9df] focus:border-[#3B82F6]'}`}
                value={selectedEmployee?._id || ""}
                onChange={(e) => handleSelectEmployee(e.target.value)}
              >
                <option value="" disabled className="bg-white text-gray-500">Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id} className="bg-white text-[#1E293B]">
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="flex-1 bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#d6d9df] flex justify-between items-center bg-[#fdfdfe]">
              <div>
                <h3 className="font-bold text-[#1E293B]">
                  {selectedRole ? `${selectedRole.displayName} Permissions` : selectedEmployee ? `${selectedEmployee.firstName}'s Custom Access` : 'Select a Role or Employee'}
                </h3>
                <p className="text-xs text-[#8f9192]">
                  {selectedRole ? 'Modify module-specific access rights for this role.' : selectedEmployee ? 'These settings will override the user\'s default role permissions.' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedEmployee && (
                  <button 
                    onClick={handleResetEmployeePermissions}
                    disabled={savingPermissions}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d6d9df] text-[#64748B] rounded-lg font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-colors"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                )}
                <button 
                  onClick={handleSavePermissions}
                  disabled={savingPermissions || (!selectedRole && !selectedEmployee)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg font-bold text-sm hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
                >
                  <Save size={16} /> {savingPermissions ? 'Saving...' : 'Save Matrix'}
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto p-0 flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f0f3f5] sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Module</th>
                    <th className="p-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6d9df]">
                  {Object.entries(PERMISSION_CONFIG).map(([moduleKey, config]) => {
                    const currentPerm = rolePermissions.find(p => p.module === moduleKey) || {};
                    return (
                      <tr key={moduleKey} className="hover:bg-[#f8f9fa]">
                        <td className="p-4 font-semibold text-[#1E293B] align-top">{config.label}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-4">
                            {config.actions.map(action => (
                              <label htmlFor={`perm_${moduleKey}_${action}`} key={action} className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                  <input 
                                    id={`perm_${moduleKey}_${action}`}
                                    name={`perm_${moduleKey}_${action}`}
                                    type="checkbox" 
                                    className="peer sr-only" 
                                    checked={currentPerm[action] || false}
                                    onChange={() => handleTogglePermission(moduleKey, action)}
                                  />
                                  <div className="w-9 h-5 bg-[#d6d9df] rounded-full peer peer-checked:bg-[#3B82F6] peer-focus:ring-2 peer-focus:ring-[#3B82F6]/30 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                </div>
                                <span className="text-sm font-medium text-[#64748B] group-hover:text-[#1E293B] transition-colors">{formatActionName(action)}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- DESIGNATIONS TAB --- */}
      {activeTab === 'designations' && (
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#d6d9df] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fdfdfe]">
            <div>
              <h3 className="font-bold text-[#1E293B]">Company Designations</h3>
              <p className="text-xs text-[#8f9192]">Manage job titles available during employee creation.</p>
            </div>
            <form onSubmit={handleAddDesignation} className="flex items-center gap-2">
              <label htmlFor="newDesignationInput" className="sr-only">New Designation Name</label>
              <input 
                id="newDesignationInput"
                name="newDesignationInput"
                type="text" 
                value={newDesignation}
                onChange={(e) => setNewDesignation(e.target.value)}
                placeholder="New Designation Name" 
                className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#1E293B] focus:outline-none focus:bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all w-64"
              />
              <button type="submit" className="flex items-center justify-center p-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors">
                <Plus size={20} />
              </button>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f0f3f5]">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Designation</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df] text-center">Status</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6d9df]">
                {designations.length === 0 ? (
                  <tr><td colSpan="3" className="p-8 text-center text-[#8f9192]">No designations found.</td></tr>
                ) : designations.map(d => (
                  <tr key={d._id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-5 py-3 font-bold text-[#1E293B]">{d.name}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {d.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        onClick={() => handleToggleDesignation(d._id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${d.isActive ? 'bg-white border-[#d6d9df] text-red-600 hover:bg-red-50 hover:border-red-200' : 'bg-white border-[#d6d9df] text-green-600 hover:bg-green-50 hover:border-green-200'}`}
                      >
                        {d.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- AUDIT LOGS TAB --- */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#d6d9df] bg-[#fdfdfe]">
            <h3 className="font-bold text-[#1E293B]">Security Audit Logs</h3>
            <p className="text-xs text-[#8f9192]">Track changes made to roles, permissions, and designations.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f0f3f5]">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Timestamp</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Action</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Changed By</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#8f9192] uppercase tracking-wider border-b border-[#d6d9df]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6d9df]">
                {auditLogs.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-[#8f9192]">No audit logs found.</td></tr>
                ) : auditLogs.map(log => (
                  <tr key={log._id} className="hover:bg-[#f8f9fa]">
                    <td className="px-5 py-3 text-sm text-[#8f9192] whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-[#1E293B]"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{log.action}</span></td>
                    <td className="px-5 py-3 text-sm font-medium text-[#1E293B]">{log.changedBy ? `${log.changedBy.firstName} ${log.changedBy.lastName}` : 'System'}</td>
                    <td className="px-5 py-3 text-sm text-[#64748B]">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- COMPANY TAB (Placeholder) --- */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm p-12 text-center flex flex-col items-center justify-center">
          <Building2 size={48} className="text-[#bdc2c7] mb-4" />
          <h3 className="font-bold text-[#1E293B] text-lg">Company Settings</h3>
          <p className="text-sm text-[#8f9192] mt-2 max-w-md">This section is reserved for future company information updates such as Company Name, Address, Logo, and default configurations.</p>
        </div>
      )}

      {/* --- SHIFTS TAB --- */}
      {activeTab === 'shifts' && (
        <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#d6d9df] flex justify-between items-center bg-[#f8f9fa]">
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">Shift Configurations</h2>
              <p className="text-xs text-[#8f9192] mt-0.5">Define working hours and break durations</p>
            </div>
            <button
              onClick={() => {
                setEditingShift(null);
                setShiftForm({ name: '', type: 'Fixed', startTime: '09:00', endTime: '18:00', weeklyOffDays: ['Sunday'], breakDuration: 1, isDefault: false });
                setIsShiftModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded font-semibold text-xs hover:bg-blue-700"
            >
              <Plus size={14} /> Add Shift
            </button>
          </div>
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
                            isDefault: shift.isDefault || false
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
        </div>
      )}

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

    </div>
  );
}
