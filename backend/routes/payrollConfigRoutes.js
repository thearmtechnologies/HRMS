const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/permission');
const payrollConfigController = require('../controllers/payrollConfigController');

// All settings routes require authentication and 'settings : edit' or similar admin privilege.
// For now, aligning with existing payroll structure, requiring payroll admin or hr level access.
// We will use standard authenticate middleware, and require specific permission.

// Note: authorizePermission('settings', 'edit') or authorizePermission('payroll', 'edit')
// We will use 'payroll : edit' since this configures the payroll engine.
router.use(authenticate);

// ----------------------------------------------------
// SALARY COMPONENTS
// ----------------------------------------------------
router.get('/components', authorizePermission('payroll', 'view'), payrollConfigController.getAllComponents);
router.post('/components', authorizePermission('payroll', 'edit'), payrollConfigController.createComponent);
router.put('/components/:id', authorizePermission('payroll', 'edit'), payrollConfigController.updateComponent);
router.delete('/components/:id', authorizePermission('payroll', 'edit'), payrollConfigController.deleteComponent);

// ----------------------------------------------------
// PAYROLL TEMPLATES
// ----------------------------------------------------
router.get('/templates', authorizePermission('payroll', 'view'), payrollConfigController.getAllTemplates);
router.post('/templates', authorizePermission('payroll', 'edit'), payrollConfigController.createTemplate);
router.put('/templates/:id', authorizePermission('payroll', 'edit'), payrollConfigController.updateTemplate);
router.delete('/templates/:id', authorizePermission('payroll', 'edit'), payrollConfigController.deleteTemplate);

// ----------------------------------------------------
// PAYROLL CONFIGURATION (General & Tax)
// ----------------------------------------------------
router.get('/config', authorizePermission('payroll', 'view'), payrollConfigController.getConfiguration);
router.put('/config', authorizePermission('payroll', 'edit'), payrollConfigController.updateConfiguration);

module.exports = router;
