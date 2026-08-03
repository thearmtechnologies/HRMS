const mongoose = require('mongoose');

const companyInfoSchema = new mongoose.Schema({
  // Basic Information
  companyName: { type: String, trim: true, default: '' },
  legalName: { type: String, trim: true, default: '' },
  shortName: { type: String, trim: true, default: '' },
  companyCode: { type: String, trim: true, default: '' },
  regNumber: { type: String, trim: true, default: '' },
  companyType: { 
    type: String, 
    enum: ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Sole Proprietorship', 'Other', ''], 
    default: '' 
  },
  industry: { type: String, trim: true, default: '' },
  foundedYear: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },

  // Company Profile
  mission: { type: String, trim: true, default: '' },
  vision: { type: String, trim: true, default: '' },
  coreValues: { type: String, trim: true, default: '' },

  // Branding (Images)
  logoUrl: { type: String, default: null },
  logoPublicId: { type: String, default: null },
  iconUrl: { type: String, default: null },
  iconPublicId: { type: String, default: null },
  bannerUrl: { type: String, default: null },
  bannerPublicId: { type: String, default: null },
  stampUrl: { type: String, default: null },
  stampPublicId: { type: String, default: null },
  signatureUrl: { type: String, default: null },
  signaturePublicId: { type: String, default: null },

  // Contact Information
  officialEmail: { type: String, trim: true, lowercase: true, default: '' },
  hrEmail: { type: String, trim: true, lowercase: true, default: '' },
  payrollEmail: { type: String, trim: true, lowercase: true, default: '' },
  supportEmail: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  altPhone: { type: String, trim: true, default: '' },

  // Social Links
  website: { type: String, trim: true, default: '' },
  linkedin: { type: String, trim: true, default: '' },
  facebook: { type: String, trim: true, default: '' },
  instagram: { type: String, trim: true, default: '' },
  twitter: { type: String, trim: true, default: '' },

  // Address
  addressLine1: { type: String, trim: true, default: '' },
  addressLine2: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  state: { type: String, trim: true, default: '' },
  country: { type: String, trim: true, default: '' },
  zipCode: { type: String, trim: true, default: '' },

  // Business Information
  panNumber: { type: String, trim: true, uppercase: true, default: '' },
  gstNumber: { type: String, trim: true, uppercase: true, default: '' },
  cinNumber: { type: String, trim: true, uppercase: true, default: '' },
  tanNumber: { type: String, trim: true, uppercase: true, default: '' },
  defaultCurrency: { type: String, trim: true, uppercase: true, default: 'INR' },

  // System Flags
  isConfigured: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyInfo', companyInfoSchema);
