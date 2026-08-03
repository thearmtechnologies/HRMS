const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const { initDefaultRoles } = require('./utils/roleInit');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Ensure default system roles & permissions exist right now
    await initDefaultRoles();

    const Company = require('./models/Company');
    let defaultCompany = await Company.findOne({ companyCode: 'DEFAULT' });
    if (!defaultCompany) {
      defaultCompany = new Company({
        companyName: 'Default Company',
        companyCode: 'DEFAULT',
        companyEmail: 'default@example.com',
        companyPhone: '1234567890',
        status: 'Active'
      });
      await defaultCompany.save();
      console.log('Default company seeded successfully.');
    }

    const adminEmail = 'k2080495@gmail.com';
    let existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);

      existingAdmin = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        company: defaultCompany._id,
        isActive: true,
        isVerified: true,
        isFirstLogin: false // Admin setup manually, no forced change needed initially unless desired
      });

      await existingAdmin.save();
      console.log('Admin user seeded successfully with email: k2080495@gmail.com and password: admin123');
    } else {
      console.log('Admin user already exists.');
      // Update existing admin user to have the default company if it doesn't have one
      if (!existingAdmin.company) {
        existingAdmin.company = defaultCompany._id;
        await existingAdmin.save();
        console.log('Updated existing admin user with default company reference.');
      }
    }

    // Provision the workspace for the default company if it hasn't been provisioned yet
    if (!defaultCompany.isWorkspaceProvisioned) {
      console.log('Provisioning workspace for the default company...');
      const { provisionCompany } = require('./services/companyProvisionService');
      await provisionCompany(defaultCompany._id, existingAdmin._id);
      console.log('✅ Workspace provisioned successfully for the default company.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
