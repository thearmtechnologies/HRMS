const Role = require('../../models/Role');

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

async function provisionRoles(companyId) {
  const rolesToCreate = ['admin', 'hr', 'employee'];
  for (const roleName of rolesToCreate) {
    const role = new Role({
      name: roleName,
      displayName: roleName.charAt(0).toUpperCase() + roleName.slice(1),
      isSystem: true,
      company: companyId,
      permissions: defaultPermissionsConfig[roleName] || []
    });
    await role.save();
  }
}

module.exports = { provisionRoles };
