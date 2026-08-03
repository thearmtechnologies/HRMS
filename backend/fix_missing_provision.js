const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('./models/Company');
const User = require('./models/User');
const { provisionCompany } = require('./services/companyProvisionService');

dotenv.config();

const fixMissingProvision = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms');
    console.log("Connected to DB");

    const companies = await Company.find({ isWorkspaceProvisioned: { $ne: true } });
    console.log(`Found ${companies.length} unprovisioned companies.`);

    for (const company of companies) {
      console.log(`Provisioning workspace for company: ${company.companyName} (${company.companyCode})`);
      
      // Find an admin user for this company to act as primary admin
      let adminUser = await User.findOne({ company: company._id, role: 'admin' });
      if (!adminUser) {
          // If no admin, just use the first user, or pass null
          adminUser = await User.findOne({ company: company._id });
      }
      
      const adminId = adminUser ? adminUser._id : null;

      try {
        await provisionCompany(company._id, adminId);
        console.log(`✅ Provisioned workspace for ${company.companyName}`);
      } catch (err) {
        console.error(`❌ Failed to provision workspace for ${company.companyName}:`, err);
      }
    }

    console.log("Fix complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed", error);
    process.exit(1);
  }
};

fixMissingProvision();
