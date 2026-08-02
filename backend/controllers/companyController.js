const Company = require('../models/Company');
const CompanyInfo = require('../models/CompanyInfo');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
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

// Create Company
// POST /api/companies
exports.createCompany = async (req, res) => {
  try {
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
    } = req.body;

    if (!companyName || !companyCode || !companyEmail || !companyPhone) {
      return res.status(400).json({ message: 'All company fields (companyName, companyCode, companyEmail, companyPhone) are required' });
    }

    if (!firstName || !lastName || !adminEmail || !adminPhone) {
      return res.status(400).json({ message: 'All company administrator fields (firstName, lastName, adminEmail, adminPhone) are required' });
    }

    const normalizedCode = companyCode.trim().toUpperCase();
    const normalizedEmail = companyEmail.trim().toLowerCase();
    const normalizedAdminEmail = adminEmail.trim().toLowerCase();

    const codeRegex = /^[A-Z0-9_]+$/;
    if (!codeRegex.test(normalizedCode)) {
      return res.status(400).json({ message: 'Company code must only contain alphanumeric characters and underscores (no spaces)' });
    }

    // Check for duplicate companyCode
    const existingCode = await Company.findOne({ companyCode: normalizedCode });
    if (existingCode) {
      return res.status(409).json({ message: `Company code '${normalizedCode}' is already registered` });
    }

    // Check for duplicate companyEmail
    const existingEmail = await Company.findOne({ companyEmail: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ message: `Company email '${normalizedEmail}' is already registered` });
    }

    // Check for duplicate adminEmail in User collection
    const existingUser = await User.findOne({ email: normalizedAdminEmail });
    if (existingUser) {
      return res.status(409).json({ message: `Administrator email '${adminEmail}' is already registered under another account` });
    }

    const company = new Company({
      companyName: companyName.trim(),
      companyCode: normalizedCode,
      companyEmail: normalizedEmail,
      companyPhone: companyPhone.trim(),
      status: status || 'Active',
      createdBy: req.superAdmin ? req.superAdmin._id : null
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

    const responsePayload = {
      message: 'Company created successfully',
      company
    };

    if (!sendCredentials) {
      responsePayload.temporaryPassword = tempPassword;
      responsePayload.showPassword = true;
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get All Companies
// GET /api/companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isDeleted: { $ne: true } }).populate('createdBy', 'firstName lastName fullName email');
    
    // Fetch logos from CompanyInfo mapping by companyCode
    const companyCodes = companies.map(c => c.companyCode);
    const infos = await CompanyInfo.find({ companyCode: { $in: companyCodes } }).select('companyCode logoUrl');
    
    const logoMap = {};
    infos.forEach(info => {
      if (info.companyCode) {
        logoMap[info.companyCode.toUpperCase()] = info.logoUrl;
      }
    });

    const companiesWithLogos = companies.map(c => {
      const companyObj = c.toObject();
      companyObj.logoUrl = logoMap[c.companyCode.toUpperCase()] || null;
      return companyObj;
    });

    res.status(200).json({ companies: companiesWithLogos });
  } catch (error) {
    console.error('Error getting all companies:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get Company by ID
// GET /api/companies/:id
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('createdBy', 'firstName lastName fullName email')
      .populate('primaryAdmin', 'firstName lastName fullName email phoneNumber isActive isFirstLogin');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    const companyInfo = await CompanyInfo.findOne({ companyCode: company.companyCode });
    res.status(200).json({ company, companyInfo });
  } catch (error) {
    console.error('Error getting company by ID:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Update Company
// PUT /api/companies/:id
exports.updateCompany = async (req, res) => {
  try {
    const { companyName, companyCode, companyEmail, companyPhone, status } = req.body;
    const { id } = req.params;

    const company = await Company.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const updates = {};

    if (companyName !== undefined) updates.companyName = companyName.trim();
    if (companyPhone !== undefined) updates.companyPhone = companyPhone.trim();
    if (status !== undefined) {
      if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value. Must be Active, Inactive, or Suspended' });
      }
      updates.status = status;
    }

    if (companyCode !== undefined) {
      const normalizedCode = companyCode.trim().toUpperCase();
      const codeRegex = /^[A-Z0-9_]+$/;
      if (!codeRegex.test(normalizedCode)) {
        return res.status(400).json({ message: 'Company code must only contain alphanumeric characters and underscores (no spaces)' });
      }
      if (normalizedCode !== company.companyCode) {
        // Check for duplicate companyCode
        const existingCode = await Company.findOne({ companyCode: normalizedCode, _id: { $ne: id } });
        if (existingCode) {
          return res.status(409).json({ message: `Company code '${normalizedCode}' is already registered` });
        }
        updates.companyCode = normalizedCode;
      }
    }

    if (companyEmail !== undefined) {
      const normalizedEmail = companyEmail.trim().toLowerCase();
      if (normalizedEmail !== company.companyEmail) {
        // Check for duplicate companyEmail
        const existingEmail = await Company.findOne({ companyEmail: normalizedEmail, _id: { $ne: id } });
        if (existingEmail) {
          return res.status(409).json({ message: `Company email '${normalizedEmail}' is already registered` });
        }
        updates.companyEmail = normalizedEmail;
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(id, updates, { new: true }).populate('createdBy', 'firstName lastName fullName email');
    res.status(200).json({ message: 'Company updated successfully', company: updatedCompany });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Change Status
// PATCH /api/companies/:id/status
exports.changeCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Must be Active, Inactive, or Suspended' });
    }

    const company = await Company.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.status = status;
    await company.save();

    res.status(200).json({ message: `Company status updated to ${status} successfully`, company });
  } catch (error) {
    console.error('Error changing company status:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
