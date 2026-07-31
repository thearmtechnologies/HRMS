const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const { authorizePermission } = require("../middleware/permission");

// --- Employee Routes ---
router.get("/my-balances", authenticate, leaveController.getEmployeeBalances);
router.get("/my-history", authenticate, leaveController.getLeaveHistory);
router.post("/apply", authenticate, leaveController.applyLeave);
router.put("/cancel/:id", authenticate, leaveController.cancelLeaveRequest);

// --- HR / Admin Routes ---
router.get("/all", authenticate, authorizePermission('leave_management', 'view'), leaveController.getAllLeaveRequests);
router.get("/stats", authenticate, authorizePermission('leave_management', 'view'), leaveController.getLeaveDashboardStats);
router.put("/status/:id", authenticate, authorizePermission('leave_management', 'edit'), leaveController.updateLeaveStatus);
router.post("/manual-entry", authenticate, authorizePermission('leave_management', 'create'), leaveController.manualLeaveEntry);
router.post("/adjust-balance", authenticate, authorizePermission('leave_management', 'edit'), leaveController.adjustLeaveBalance);
router.get("/balances/:employeeId", authenticate, authorizePermission('leave_management', 'view'), leaveController.getEmployeeBalances);
router.post("/balances/:employeeId/assign", authenticate, authorizePermission('leave_management', 'edit'), leaveController.assignLeaveToEmployee);
router.post("/balances/:employeeId/remove", authenticate, authorizePermission('leave_management', 'edit'), leaveController.removeLeaveFromEmployee);

module.exports = router;
