const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/permission');
const upload = require('../middleware/multer');
const companyInfoController = require('../controllers/companyInfoController');

// All company info routes require authentication
router.use(authenticate);

// Configure multer to accept specific fields
const companyImagesUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'icon', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'stamp', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]);

// Route to get company info (available to all authenticated users for viewing purposes, if needed. 
// Or you can restrict to 'settings' view permission. Let's restrict to settings view to be safe, 
// though some fields might be needed globally later. For now, settings view is fine).
router.get('/', authorizePermission('settings', 'view'), companyInfoController.getCompanyInfo);

// Route to create/update company info (restricted to settings edit permission - i.e. Admin)
router.put('/', authorizePermission('settings', 'edit'), companyImagesUpload, companyInfoController.updateCompanyInfo);
router.post('/', authorizePermission('settings', 'edit'), companyImagesUpload, companyInfoController.updateCompanyInfo);

module.exports = router;
