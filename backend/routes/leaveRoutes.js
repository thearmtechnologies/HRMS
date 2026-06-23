const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const hrAdmin = authorizeRoles("hr", "admin");

// --- Employee Routes ---
router.get("/my-balances", authenticate, leaveController.getEmployeeBalances);
router.get("/my-history", authenticate, leaveController.getLeaveHistory);
router.post("/apply", authenticate, leaveController.applyLeave);
router.put("/cancel/:id", authenticate, leaveController.cancelLeaveRequest);

// --- HR / Admin Routes ---
router.get("/all", authenticate, hrAdmin, leaveController.getAllLeaveRequests);
router.get("/stats", authenticate, hrAdmin, leaveController.getLeaveDashboardStats);
router.put("/status/:id", authenticate, hrAdmin, leaveController.updateLeaveStatus);
router.post("/manual-entry", authenticate, hrAdmin, leaveController.manualLeaveEntry);
router.post("/adjust-balance", authenticate, hrAdmin, leaveController.adjustLeaveBalance);
router.get("/balances/:employeeId", authenticate, hrAdmin, leaveController.getEmployeeBalances);

module.exports = router;
