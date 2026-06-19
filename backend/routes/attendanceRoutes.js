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
    updateRegularizationStatus
} = require("../controllers/attendanceController");

router.post("/check-in", authenticate, checkIn);
router.post("/check-out", authenticate, checkOut);
router.get("/today", authenticate, getTodayAttendance);
router.get("/monthly", authenticate, getMonthlyAttendance);
router.get("/summary", authenticate, getAttendanceSummary);
router.post("/regularization/request", authenticate, requestRegularization);
router.get("/regularization", authenticate, getRegularizationRequests);

// Admin / HR routes
router.get("/all/daily", authenticate, getAllAttendanceByDate);
router.get("/all/regularization", authenticate, getAllRegularizationRequests);
router.put("/regularization/:id", authenticate, updateRegularizationStatus);

module.exports = router;
