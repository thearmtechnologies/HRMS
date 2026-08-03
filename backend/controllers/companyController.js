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

const companyService = require('../services/companyService');

// Create Company
// POST /api/companies
exports.createCompany = async (req, res) => {
  try {
    const { sendCredentials } = req.body;
    
    const result = await companyService.createCompany(req.body, req);

    const responsePayload = {
      message: 'Company created and workspace provisioned successfully',
      company: result.company
    };

    if (!sendCredentials) {
      responsePayload.temporaryPassword = result.tempPassword;
      responsePayload.showPassword = true;
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    console.error('Error creating company:', error);
    // Determine status code based on error message mapping commonly returned by service
    const status = error.message.includes('are required') ? 400 : 
                   error.message.includes('already registered') ? 409 : 
                   error.message.includes('alphanumeric characters') ? 400 : 500;
                   
    res.status(status).json({ message: error.message });
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
