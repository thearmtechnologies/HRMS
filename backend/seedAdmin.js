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
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      // Update existing admin user to have the default company if it doesn't have one
      if (!existingAdmin.company) {
        existingAdmin.company = defaultCompany._id;
        await existingAdmin.save();
        console.log('Updated existing admin user with default company reference.');
      }
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);

    const adminUser = new User({
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

    await adminUser.save();
    console.log('Admin user seeded successfully with email: k2080495@gmail.com and password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
