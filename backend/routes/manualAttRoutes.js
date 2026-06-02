const express = require("express");
const router = express.Router();

const {
    markAttendance,
    getAttendanceForMonthAll,
    getAttendanceByMonth,
    getAttendanceByDate,
    deleteAttendance,
    deleteMonthAttendance,
    bulkMarkAttendance,
    calculatePayroll,
    getAttendanceByEmpId
} = require("../controllers/manualAttController");

router.post("/mark", markAttendance);
router.get("/all", getAttendanceForMonthAll);
router.get("/employee/:employeeId", getAttendanceByMonth);
router.get("/date", getAttendanceByDate);
router.delete("/delete/:id", deleteAttendance);
router.post("/delete-month", deleteMonthAttendance);
router.post("/bulk", bulkMarkAttendance);
router.post("/payroll", calculatePayroll);
router.get("/employee/:employee", getAttendanceByEmpId)


module.exports = router;

