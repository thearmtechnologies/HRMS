const Role = require('../models/Role');
const User = require('../models/User');

const initDefaultRoles = async () => {
  try {
    const roles = await Role.find({});
    for (const role of roles) {
      if (role.name === 'admin' || role.name === 'hr') {
        let payrollPerm = role.permissions.find(p => p.module === 'payroll');
        if (!payrollPerm) {
          payrollPerm = {
            module: 'payroll',
            view: true,
            create: true,
            edit: true,
            generate: true,
            approve: true,
            mark_paid: role.name === 'admin',
            export: true
          };
          role.permissions.push(payrollPerm);
        } else {
          payrollPerm.view = true;
          payrollPerm.create = true;
          payrollPerm.edit = true;
          payrollPerm.generate = true;
          payrollPerm.approve = true;
          if (role.name === 'admin') payrollPerm.mark_paid = true;
          payrollPerm.export = true;
        }
        await role.save();
        console.log(`Verified & synced payroll permissions for role: ${role.name}`);
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

module.exports = { initDefaultRoles };
