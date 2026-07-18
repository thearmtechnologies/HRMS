const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role');
const Designation = require('./models/Designation');
const User = require('./models/User');

dotenv.config();

const permissionsConfig = {
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
    { module: 'employee_profile', view: true, edit: true }
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
    { module: 'employee_profile', view: true, edit: true }
  ],
  finance: [
    { module: 'dashboard', view: true },
    { module: 'payroll', view: true, mark_paid: true, export: true },
    { module: 'virtual_id', view: true },
    { module: 'employee_profile', view: true },
    { module: 'holiday_management', view: true }
  ],
  employee: [
    { module: 'dashboard', view: true },
    { module: 'attendance', view: true, regularize: true },
    { module: 'leave_management', view: true },
    { module: 'payroll', view: true }, // View own
    { module: 'projects', view: true }, // View assigned
    { module: 'virtual_id', view: true },
    { module: 'employee_profile', view: true, edit: true },
    { module: 'holiday_management', view: true }
  ]
};

const seedSettings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms');
    console.log("Connected to DB");

    // 1. Seed Roles
    const roles = ['admin', 'hr', 'finance', 'employee'];
    for (const roleName of roles) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = new Role({
          name: roleName,
          displayName: roleName.charAt(0).toUpperCase() + roleName.slice(1),
          isSystem: true,
          permissions: permissionsConfig[roleName] || []
        });
        await role.save();
        console.log(`Created system role: ${roleName}`);
      } else {
        // Update permissions for existing ones to ensure they match our matrix
        role.permissions = permissionsConfig[roleName] || [];
        await role.save();
        console.log(`Updated permissions for system role: ${roleName}`);
      }
    }

    // 2. Migrate Users
    const usersToMigrate = await User.find({ role: { $in: ['project_manager', 'department_manager'] } });
    console.log(`Found ${usersToMigrate.length} users to migrate.`);

    for (const user of usersToMigrate) {
      const oldRole = user.role;
      let newDesignation = 'Manager';
      if (oldRole === 'project_manager') newDesignation = 'Project Manager';
      if (oldRole === 'department_manager') newDesignation = 'Department Manager';

      // Assign designation to user string
      user.role = 'employee';
      if (!user.designation) {
        user.designation = newDesignation;
      }
      
      // We are skipping validation for enum just in case, but we updated the model anyway.
      await User.updateOne({ _id: user._id }, { $set: { role: 'employee', designation: user.designation } });
      console.log(`Migrated user ${user.email} from ${oldRole} to employee with designation ${user.designation}`);
      
      // Also ensure the designation exists in Designation collection
      const existingDesig = await Designation.findOne({ name: user.designation });
      if (!existingDesig) {
        await Designation.create({ name: user.designation, isActive: true });
        console.log(`Created designation: ${user.designation}`);
      }
    }

    console.log("Migration and Seeding Complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed", error);
    process.exit(1);
  }
};

seedSettings();
