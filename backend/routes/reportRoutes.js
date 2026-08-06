const express = require('express');
const router = express.Router();

// Import individual report route modules
const attendanceRoutes = require('./reports/attendanceReportRoutes');
const employeeRoutes = require('./reports/employeeReportRoutes');
const leaveRoutes = require('./reports/leaveReportRoutes');
const payrollRoutes = require('./reports/payrollReportRoutes');

// Mount them dynamically
router.use('/attendance', attendanceRoutes);
router.use('/employees', employeeRoutes);
router.use('/leave', leaveRoutes);
router.use('/payroll', payrollRoutes);

module.exports = router;
