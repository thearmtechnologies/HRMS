const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../../middleware/auth');
const { getPayrollRegisterReport, exportPayrollRegisterReport } = require('../../controllers/reports/payrollReportController');

// All report routes should be restricted to admin and HR
router.use(authenticate);
router.use(authorizeRoles('admin', 'hr'));

// Payroll Reports
router.get('/register', getPayrollRegisterReport);
router.get('/register/export/:format', exportPayrollRegisterReport);

module.exports = router;
