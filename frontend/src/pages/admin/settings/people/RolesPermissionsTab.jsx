import React, { useState, useEffect, useContext } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import SettingsCard from '../components/SettingsCard';
import SettingsHeader from '../components/SettingsHeader';
import { AuthContext } from '../../../../context/AuthContext';

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
  employee_profile: { label: 'Employee Profile', actions: ['view', 'edit'] },
  announcements: { label: 'Announcements', actions: ['view', 'create', 'edit', 'delete', 'publish', 'archive'] }
};

export default function RolesPermissionsTab() {
  const { token } = useContext(AuthContext);

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchEmployees();
  }, []);

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

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setSelectedEmployee(null);
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
    
    setSelectedRole(null);
    setSelectedEmployee(emp);

    try {
      const res = await fetch(`http://localhost:5000/api/employee/${emp._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const fullEmp = await res.json();
        const overrides = fullEmp.user?.permissionOverrides || [];
        
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
        if (action !== 'view' && updated[action] === true) {
          updated.view = true;
        }
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
        handleSelectEmployee(selectedEmployee._id);
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

  const formatActionName = (str) => {
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };


  return (
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
      <div className="flex-1">
        <SettingsCard className="flex flex-col h-full">
          <SettingsHeader 
            title={selectedRole ? `${selectedRole.displayName} Permissions` : selectedEmployee ? `${selectedEmployee.firstName}'s Custom Access` : 'Select a Role or Employee'}
            description={selectedRole ? 'Modify module-specific access rights for this role.' : selectedEmployee ? 'These settings will override the user\'s default role permissions.' : ''}
            actions={
              <>
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
              </>
            }
          />
          
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
        </SettingsCard>
      </div>
    </div>
  );
}
