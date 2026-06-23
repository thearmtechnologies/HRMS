const express = require('express');
const router = express.Router();
const {
    // Salary structure
    createFixedSalary,
    getFixedSalary,
    getFixedSalaryByEmployee,
    updateFixedSalaryByEmployeeId,
    getSalaryHistory,

    // Payroll generation & queries
    generatePayroll,
    createOrUpdatePayroll,
    getAllPayrolls,
    getPayrollDashboardStats,
    getEmployeePayrollHistory,

    // Status management
    updatePayrollStatus,
    bulkUpdatePayrollStatus,
    lockPayroll,
    unlockPayroll,

    // Adjustments
    addAdjustment,
    removeAdjustment,

    // PDF & Email
    getPayrollPdf,
    emailPayslip,

    // Reports & Export
    getPayrollReports,
    exportPayrollCSV,
    exportPayrollExcel,

    // Audit logs
    getPayrollAuditLogs,

    // Temp changes
    getTempEditByEmployee,
    saveTempEdit,
    resetTempEdit,
} = require('../controllers/salaryController');

const { getHolidaysByYear, setHolidayConfig, updateHolidayForMonth } = require('../controllers/holidayController');


// ============================================================
// HOLIDAYS (preserved)
// ============================================================
router.post('/create-holyday', setHolidayConfig);
router.get('/get-holydays/:year', getHolidaysByYear);
router.patch('/update-holyday/:year', updateHolidayForMonth);

// ============================================================
// SALARY STRUCTURE (preserved + extended)
// ============================================================
router.post('/salary-fixed/employee/:employeeId', createFixedSalary);
router.get('/all-salary-records', getFixedSalary);
router.put('/salary-fixed/employee/:employeeId', updateFixedSalaryByEmployeeId);
router.get('/salary-fixed/employee/:employeeId', getFixedSalaryByEmployee);
router.get('/salary-history/:employeeId', getSalaryHistory);

// ============================================================
// PAYROLL GENERATION & QUERIES (preserved + new)
// ============================================================
router.post('/generate-payroll', generatePayroll);
router.post('/final-submit', createOrUpdatePayroll);
router.get('/final-payroll', getAllPayrolls);
router.get('/dashboard-stats', getPayrollDashboardStats);
router.get('/employee-history/:empId', getEmployeePayrollHistory);

// ============================================================
// PAYROLL STATUS MANAGEMENT
// ============================================================
router.patch('/payroll/:id/status', updatePayrollStatus);
router.patch('/payroll/bulk-status', bulkUpdatePayrollStatus);
router.patch('/payroll/:id/lock', lockPayroll);
router.patch('/payroll/:id/unlock', unlockPayroll);

// ============================================================
// PAYROLL ADJUSTMENTS
// ============================================================
router.post('/payroll/:id/adjustment', addAdjustment);
router.delete('/payroll/:id/adjustment/:adjId', removeAdjustment);

// ============================================================
// PDF & EMAIL
// ============================================================
router.get('/pdf', getPayrollPdf);
router.post('/payroll/:id/email', emailPayslip);

// ============================================================
// REPORTS & EXPORT
// ============================================================
router.get('/reports', getPayrollReports);
router.get('/export/csv', exportPayrollCSV);
router.get('/export/excel', exportPayrollExcel);

// ============================================================
// AUDIT LOGS
// ============================================================
router.get('/audit-logs', getPayrollAuditLogs);

// ============================================================
// TEMP CHANGES (preserved)
// ============================================================
router.get("/get-edits", getTempEditByEmployee);
router.post("/post-edits", saveTempEdit);
router.post("/reset-edits", resetTempEdit);

module.exports = router;
