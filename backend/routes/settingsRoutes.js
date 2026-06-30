const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/permission');
const {
  getDesignations,
  getActiveDesignations,
  createDesignation,
  updateDesignation,
  toggleDesignationStatus,
  getRoles,
  updateRolePermissions,
  getAuditLogs
} = require('../controllers/settingsController');

// All settings routes require authentication and 'settings' module view/edit permission
router.use(authenticate);

// Middleware for checking settings access (We will create authorizePermission middleware)
// For now, let's just make sure only users with settings edit access can modify, and settings view can read.
// Actually, I'll apply it per route.

router.get('/designations', authorizePermission('settings', 'view'), getDesignations);
router.get('/designations/active', getActiveDesignations); // Needed for Employee Form, so maybe just authenticated is fine.
router.post('/designations', authorizePermission('settings', 'edit'), createDesignation);
router.put('/designations/:id', authorizePermission('settings', 'edit'), updateDesignation);
router.patch('/designations/:id/toggle', authorizePermission('settings', 'edit'), toggleDesignationStatus);

router.get('/roles', authorizePermission('settings', 'view'), getRoles);
router.put('/roles/:id/permissions', authorizePermission('settings', 'edit'), updateRolePermissions);

router.get('/audit-logs', authorizePermission('settings', 'view'), getAuditLogs);

module.exports = router;
