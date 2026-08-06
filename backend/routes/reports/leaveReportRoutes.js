const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../../middleware/auth');
const { getLeaveBalanceReport, exportLeaveBalanceReport } = require('../../controllers/reports/leaveReportController');

// All report routes should be restricted to admin and HR
router.use(authenticate);
router.use(authorizeRoles('admin', 'hr'));

// Leave Reports
router.get('/balance', getLeaveBalanceReport);
router.get('/balance/export/:format', exportLeaveBalanceReport);

module.exports = router;
