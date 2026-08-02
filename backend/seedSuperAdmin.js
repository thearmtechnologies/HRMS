const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const SuperAdmin = require('./models/SuperAdmin');

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not found in env configuration.");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const superAdminEmail = 'k2080495@gmail.com';
    const existingSuperAdmin = await SuperAdmin.findOne({ email: superAdminEmail });

    if (existingSuperAdmin) {
      console.log('Super Admin user already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('superadmin123', 12);

    const superAdmin = new SuperAdmin({
      firstName: 'Kaustubh',
      lastName: 'Pawar',
      email: superAdminEmail,
      password: hashedPassword,
      isActive: true
    });

    await superAdmin.save();
    console.log('Super Admin user seeded successfully with email: [EMAIL_ADDRESS] and password: [PASSWORD]');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Super Admin user:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
