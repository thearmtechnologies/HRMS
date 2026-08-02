const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authSuperAdmin = require('../middleware/authSuperAdmin');

// Register the CRUD routes
// Post/Put/Get/Patch for Company Entity
router.post('/', authSuperAdmin, companyController.createCompany);
router.get('/', authSuperAdmin, companyController.getAllCompanies);
router.get('/:id', authSuperAdmin, companyController.getCompanyById);
router.put('/:id', authSuperAdmin, companyController.updateCompany);
router.patch('/:id/status', authSuperAdmin, companyController.changeCompanyStatus);

module.exports = router;
