const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../../middleware/auth');
const { getEmployeeDirectoryReport, exportEmployeeDirectoryReport } = require('../../controllers/reports/employeeReportController');

// All report routes should be restricted to admin and HR
router.use(authenticate);
router.use(authorizeRoles('admin', 'hr'));

// Employee Reports
router.get('/directory', getEmployeeDirectoryReport);
router.get('/directory/export/:format', exportEmployeeDirectoryReport);

module.exports = router;
