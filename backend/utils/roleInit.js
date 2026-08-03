const Role = require('../models/Role');
const User = require('../models/User');

const defaultPermissionsConfig = {
  admin: [
    { module: 'dashboard', view: true },
    { module: 'employee_management', view: true, create: true, edit: true, delete: true, export: true },
    { module: 'verification_center', view: true, approve: true },
    { module: 'attendance', view: true },
    { module: 'team_attendance', view: true, export: true },
    { module: 'leave_management', view: true, approve: true },
    { module: 'payroll', view: true, create: true, edit: true, generate: true, approve: true, mark_paid: true, export: true },
    { module: 'departments', view: true, create: true, edit: true, delete: true },
    { module: 'projects', view: true, create: true, assign: true, edit: true, archive: true },
    { module: 'reports', view: true, export: true },
    { module: 'settings', view: true, edit: true },
    { module: 'holiday_management', view: true, create: true, edit: true, delete: true },
    { module: 'shift_management', view: true, create: true, edit: true, delete: true },
    { module: 'site_management', view: true, create: true, edit: true, delete: true },
    { module: 'notes', view: true, create: true, edit: true, delete: true },
    { module: 'virtual_id', view: true },
    { module: 'employee_profile', view: true, edit: true },
    { module: 'announcements', view: true, create: true, edit: true, delete: true, publish: true, archive: true }
  ],
  hr: [
    { module: 'dashboard', view: true },
    { module: 'employee_management', view: true, create: true, edit: true, export: true },
    { module: 'verification_center', view: true, approve: true },
    { module: 'attendance', view: true },
    { module: 'team_attendance', view: true, export: true, edit: true, approve: true },
    { module: 'leave_management', view: true, approve: true, create: true, edit: true },
    { module: 'payroll', view: true, create: true, edit: true, generate: true, approve: true, export: true },
    { module: 'departments', view: true, create: true, edit: true },
    { module: 'projects', view: true, create: true, assign: true, edit: true, archive: true },
    { module: 'reports', view: true, export: true },
    { module: 'holiday_management', view: true, create: true, edit: true, delete: true },
    { module: 'shift_management', view: true, create: true, edit: true },
    { module: 'site_management', view: true, create: true, edit: true },
    { module: 'notes', view: true, create: true, edit: true },
    { module: 'virtual_id', view: true },
    { module: 'employee_profile', view: true, edit: true },
    { module: 'announcements', view: true, create: true, edit: true, publish: true }
  ],
  employee: [
    { module: 'dashboard', view: true },
    { module: 'attendance', view: true, regularize: true },
    { module: 'leave_management', view: true },
    { module: 'payroll', view: true },
    { module: 'projects', view: true },
    { module: 'virtual_id', view: true },
    { module: 'employee_profile', view: true, edit: true },
    { module: 'holiday_management', view: true },
    { module: 'announcements', view: true }
  ]
};

const initDefaultRoles = async () => {
  try {
    const roles = ['admin', 'hr', 'employee'];
    for (const roleName of roles) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = new Role({
          name: roleName,
          displayName: roleName.charAt(0).toUpperCase() + roleName.slice(1),
          isSystem: true,
          permissions: defaultPermissionsConfig[roleName] || []
        });
        await role.save();
        console.log(`Created missing system role automatically: ${roleName}`);
      } else {
        if (roleName === 'admin' || roleName === 'hr') {
          let payrollPerm = role.permissions.find(p => p.module === 'payroll');
          if (!payrollPerm) {
            payrollPerm = {
              module: 'payroll',
              view: true,
              create: true,
              edit: true,
              generate: true,
              approve: true,
              mark_paid: roleName === 'admin',
              export: true
            };
            role.permissions.push(payrollPerm);
          } else {
            payrollPerm.view = true;
            payrollPerm.create = true;
            payrollPerm.edit = true;
            payrollPerm.generate = true;
            payrollPerm.approve = true;
            if (roleName === 'admin') payrollPerm.mark_paid = true;
            payrollPerm.export = true;
          }
          await role.save();
        }
      }
    }

    // Also fix any user permissionOverrides for payroll where create or edit was stripped
    const usersWithOverrides = await User.find({ "permissionOverrides.module": "payroll" });
    for (const user of usersWithOverrides) {
      const payrollOverride = user.permissionOverrides.find(p => p.module === 'payroll');
      if (payrollOverride && (payrollOverride.generate || payrollOverride.approve || user.role === 'admin' || user.role === 'hr')) {
        let changed = false;
        if (!payrollOverride.create) { payrollOverride.create = true; changed = true; }
        if (!payrollOverride.edit) { payrollOverride.edit = true; changed = true; }
        if (changed) {
          await user.save();
          console.log(`Synced payroll override for user: ${user.email}`);
        }
      }
    }
  } catch (err) {
    console.error("Error initializing default role permissions:", err);
  }
};

module.exports = { initDefaultRoles, defaultPermissionsConfig };
