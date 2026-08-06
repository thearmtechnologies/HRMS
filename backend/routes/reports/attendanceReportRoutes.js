const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../../middleware/auth");
const {
	getMonthlyAttendanceReport,
	exportMonthlyAttendanceReport,
	getDailyAttendanceReport,
	exportDailyAttendanceReport,
	getLateAttendanceReport,
	exportLateAttendanceReport,
	getOvertimeAttendanceReport,
	exportOvertimeAttendanceReport
} = require("../../controllers/reports/attendanceReportController");

// All report routes should be restricted to admin and HR
router.use(authenticate);
router.use(authorizeRoles("admin", "hr"));

// Attendance Reports
router.get("/monthly", getMonthlyAttendanceReport);
router.get("/monthly/export/:format", exportMonthlyAttendanceReport);
router.get("/daily", getDailyAttendanceReport);
router.get("/daily/export/:format", exportDailyAttendanceReport);
router.get("/late", getLateAttendanceReport);
router.get("/late/export/:format", exportLateAttendanceReport);
router.get("/overtime", getOvertimeAttendanceReport);
router.get("/overtime/export/:format", exportOvertimeAttendanceReport);

module.exports = router;
