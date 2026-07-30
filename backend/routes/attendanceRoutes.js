const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

const {
    checkIn,
    checkOut,
    getTodayAttendance,
    getMonthlyAttendance,
    getAttendanceSummary,
    requestRegularization,
    getRegularizationRequests,
    getAllAttendanceByDate,
    getAllRegularizationRequests,
    updateRegularizationStatus,
    manualAttendanceEdit,
    manualAttendanceEntry,
    getAttendanceReport,
    getEmployeeAttendanceSummary,
    resumeWork
} = require("../controllers/attendanceController");

router.post("/check-in", authenticate, checkIn);
router.post("/check-out", authenticate, checkOut);
router.post("/resume", authenticate, resumeWork);
router.get("/today", authenticate, getTodayAttendance);
router.get("/monthly", authenticate, getMonthlyAttendance);
router.get("/summary", authenticate, getAttendanceSummary);
router.post("/regularization/request", authenticate, requestRegularization);
router.get("/regularization", authenticate, getRegularizationRequests);

const { authorizePermission } = require("../middleware/permission");

// Admin / HR routes
router.get("/all/daily", authenticate, authorizePermission('attendance', 'view'), getAllAttendanceByDate);
router.get("/all/regularization", authenticate, authorizePermission('attendance', 'view'), getAllRegularizationRequests);
router.put("/regularization/:id", authenticate, authorizePermission('attendance', 'approve'), updateRegularizationStatus);
router.put("/manual-edit/:id", authenticate, authorizePermission('attendance', 'edit'), manualAttendanceEdit);
router.post("/manual-entry", authenticate, authorizePermission('attendance', 'create'), manualAttendanceEntry);
router.get("/reports", authenticate, authorizePermission('attendance', 'view'), getAttendanceReport);
router.get("/all/employee/:id/summary", authenticate, authorizePermission('attendance', 'view'), getEmployeeAttendanceSummary);

module.exports = router;
