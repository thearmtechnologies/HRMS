const CompanyInfo = require('../models/CompanyInfo');
const cloudinary = require('../config/cloudinary');
const { findOneCompanyRecord } = require('../utils/tenantUtils');

// GET /api/company-info
exports.getCompanyInfo = async (req, res) => {
  try {
    let companyInfo = await findOneCompanyRecord(CompanyInfo, {}, req.company, { path: 'updatedBy', select: 'firstName lastName fullName' });
    if (!companyInfo) {
      // If it doesn't exist, return empty object with 200 OK (frontend handles it)
      return res.status(200).json({ data: null, message: "Company information not configured yet." });
    }
    res.status(200).json({ data: companyInfo });
  } catch (error) {
    console.error('Error fetching company info:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// PUT or POST /api/company-info
exports.updateCompanyInfo = async (req, res) => {
  try {
    let companyInfo = await findOneCompanyRecord(CompanyInfo, {}, req.company);
    const isNew = !companyInfo;
    
    if (!companyInfo) {
      companyInfo = new CompanyInfo({ company: req.company });
    }

    // Process uploaded images
    const files = req.files || {};
    
    // Helper function to handle image replacement/removal
    const handleImageField = async (fieldName, fileArray) => {
      // If user explicitly requested removal
      if (req.body[`remove_${fieldName}`] === 'true' || req.body[`remove_${fieldName}`] === true) {
        if (companyInfo[`${fieldName}PublicId`]) {
          try {
            await cloudinary.uploader.destroy(companyInfo[`${fieldName}PublicId`]);
          } catch(err) {
            console.error(`Error deleting old ${fieldName} from Cloudinary:`, err);
          }
        }
        companyInfo[`${fieldName}Url`] = null;
        companyInfo[`${fieldName}PublicId`] = null;
      }
      
      // If a new file is uploaded
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        
        // Delete old image if it exists
        if (companyInfo[`${fieldName}PublicId`]) {
          try {
            await cloudinary.uploader.destroy(companyInfo[`${fieldName}PublicId`]);
          } catch(err) {
            console.error(`Error deleting old ${fieldName} from Cloudinary:`, err);
          }
        }
        
        companyInfo[`${fieldName}Url`] = file.path;
        companyInfo[`${fieldName}PublicId`] = file.filename;
      }
    };

    await handleImageField('logo', files.logo);
    await handleImageField('icon', files.icon);
    await handleImageField('banner', files.banner);
    await handleImageField('stamp', files.stamp);
    await handleImageField('signature', files.signature);

    // Update text fields
    const fieldsToUpdate = [
      'companyName', 'legalName', 'shortName', 'companyCode', 'regNumber', 
      'companyType', 'industry', 'foundedYear', 'description',
      'mission', 'vision', 'coreValues',
      'officialEmail', 'hrEmail', 'payrollEmail', 'supportEmail', 'phone', 'altPhone',
      'website', 'linkedin', 'facebook', 'instagram', 'twitter',
      'addressLine1', 'addressLine2', 'city', 'state', 'country', 'zipCode',
      'panNumber', 'gstNumber', 'cinNumber', 'tanNumber', 'defaultCurrency',
      'status'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        companyInfo[field] = req.body[field];
      }
    });

    companyInfo.isConfigured = true;
    companyInfo.updatedBy = req.user.id;

    await companyInfo.save();
    
    // Fetch populated version for response
    const populatedInfo = await findOneCompanyRecord(CompanyInfo, {}, req.company, { path: 'updatedBy', select: 'firstName lastName fullName' });

    res.status(200).json({ 
      message: isNew ? 'Company information created successfully' : 'Company information updated successfully',
      data: populatedInfo
    });

  } catch (error) {
    console.error('Error updating company info:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
