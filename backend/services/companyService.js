const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const companyProvisionService = require('./companyProvisionService');
const { sendCompanyAdminWelcomeEmail } = require('../config/mailer');

const generateTempPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  const length = 12 + Math.floor(Math.random() * 5); // 12 to 16 characters
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Creates a new company, the associated admin user, and provisions the workspace.
 * @param {Object} data - The company and admin data
 * @param {Object} req - The request object (to extract superAdmin context if needed)
 * @returns {Promise<Object>} - Contains company, adminUser, and tempPassword
 */
const createCompany = async (data, req) => {
  const { 
    companyName, 
    companyCode, 
    companyEmail, 
    companyPhone, 
    status,
    firstName,
    lastName,
    adminEmail,
    adminPhone,
    sendCredentials
  } = data;

  if (!companyName || !companyCode || !companyEmail || !companyPhone) {
    throw new Error('All company fields (companyName, companyCode, companyEmail, companyPhone) are required');
  }

  if (!firstName || !lastName || !adminEmail || !adminPhone) {
    throw new Error('All company administrator fields (firstName, lastName, adminEmail, adminPhone) are required');
  }

  const normalizedCode = companyCode.trim().toUpperCase();
  const normalizedEmail = companyEmail.trim().toLowerCase();
  const normalizedAdminEmail = adminEmail.trim().toLowerCase();

  const codeRegex = /^[A-Z0-9_]+$/;
  if (!codeRegex.test(normalizedCode)) {
    throw new Error('Company code must only contain alphanumeric characters and underscores (no spaces)');
  }

  // Check for duplicate companyCode
  const existingCode = await Company.findOne({ companyCode: normalizedCode });
  if (existingCode) {
    throw new Error(`Company code '${normalizedCode}' is already registered`);
  }

  // Check for duplicate companyEmail
  const existingEmail = await Company.findOne({ companyEmail: normalizedEmail });
  if (existingEmail) {
    throw new Error(`Company email '${normalizedEmail}' is already registered`);
  }

  // Check for duplicate adminEmail in User collection
  const existingUser = await User.findOne({ email: normalizedAdminEmail });
  if (existingUser) {
    throw new Error(`Administrator email '${adminEmail}' is already registered under another account`);
  }

  const company = new Company({
    companyName: companyName.trim(),
    companyCode: normalizedCode,
    companyEmail: normalizedEmail,
    companyPhone: companyPhone.trim(),
    status: status || 'Active',
    createdBy: req && req.superAdmin ? req.superAdmin._id : null
  });

  await company.save();

  // Auto-generate secure password (12-16 chars)
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  let adminUser = null;
  try {
    adminUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedAdminEmail,
      password: hashedPassword,
      role: 'admin',
      company: company._id,
      phoneNumber: adminPhone.trim(),
      isActive: true,
      isFirstLogin: true,
      isVerified: true
    });
    await adminUser.save();
  } catch (userError) {
    // Rollback company creation if user creation fails
    await Company.deleteOne({ _id: company._id });
    throw userError;
  }

  // Link admin context
  company.adminCreated = true;
  company.primaryAdmin = adminUser._id;
  await company.save();

  // Provision workspace
  try {
    await companyProvisionService.provisionCompany(company, adminUser._id);
  } catch (provisionError) {
    // If provisioning fails, we need to rollback the user and the company to ensure we don't end up with a half-provisioned workspace
    await User.deleteOne({ _id: adminUser._id });
    await Company.deleteOne({ _id: company._id });
    throw new Error(`Company created but provisioning failed. Rolled back. Reason: ${provisionError.message}`);
  }

  // Handle credentials welcome email notification
  if (sendCredentials) {
    sendCompanyAdminWelcomeEmail(
      normalizedAdminEmail,
      `${firstName.trim()} ${lastName.trim()}`,
      companyName.trim(),
      tempPassword
    ).catch(emailErr => {
      console.error("Welcome email sending failed:", emailErr);
    });
  }

  return {
    company,
    adminUser,
    tempPassword
  };
};

module.exports = {
  createCompany
};
