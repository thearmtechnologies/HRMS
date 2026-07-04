const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/permission');
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
router.post('/create-holyday', authenticate, authorizePermission('settings', 'create'), setHolidayConfig);
router.get('/get-holydays/:year', authenticate, getHolidaysByYear);
router.patch('/update-holyday/:year', authenticate, authorizePermission('settings', 'edit'), updateHolidayForMonth);

// ============================================================
// SALARY STRUCTURE (preserved + extended)
// ============================================================
router.post('/salary-fixed/employee/:employeeId', authenticate, authorizePermission('payroll', 'create'), createFixedSalary);
router.get('/all-salary-records', authenticate, authorizePermission('payroll', 'view'), getFixedSalary);
router.put('/salary-fixed/employee/:employeeId', authenticate, authorizePermission('payroll', 'edit'), updateFixedSalaryByEmployeeId);
router.get('/salary-fixed/employee/:employeeId', authenticate, getFixedSalaryByEmployee);
router.get('/salary-history/:employeeId', authenticate, getSalaryHistory);

// ============================================================
// PAYROLL GENERATION & QUERIES (preserved + new)
// ============================================================
router.post('/generate-payroll', authenticate, authorizePermission('payroll', 'create'), generatePayroll);
router.post('/final-submit', authenticate, authorizePermission('payroll', 'create'), createOrUpdatePayroll);
router.get('/final-payroll', authenticate, authorizePermission('payroll', 'view'), getAllPayrolls);
router.get('/dashboard-stats', authenticate, authorizePermission('payroll', 'view'), getPayrollDashboardStats);
router.get('/employee-history/:empId', authenticate, getEmployeePayrollHistory);

// ============================================================
// PAYROLL STATUS MANAGEMENT
// ============================================================
router.patch('/payroll/:id/status', authenticate, authorizePermission('payroll', 'edit'), updatePayrollStatus);
router.patch('/payroll/bulk-status', authenticate, authorizePermission('payroll', 'edit'), bulkUpdatePayrollStatus);
router.patch('/payroll/:id/lock', authenticate, authorizePermission('payroll', 'edit'), lockPayroll);
router.patch('/payroll/:id/unlock', authenticate, authorizePermission('payroll', 'edit'), unlockPayroll);

// ============================================================
// PAYROLL ADJUSTMENTS
// ============================================================
router.post('/payroll/:id/adjustment', authenticate, authorizePermission('payroll', 'edit'), addAdjustment);
router.delete('/payroll/:id/adjustment/:adjId', authenticate, authorizePermission('payroll', 'edit'), removeAdjustment);

// ============================================================
// PDF & EMAIL
// ============================================================
router.get('/pdf', authenticate, getPayrollPdf);
router.post('/payroll/:id/email', authenticate, authorizePermission('payroll', 'edit'), emailPayslip);

// ============================================================
// REPORTS & EXPORT
// ============================================================
router.get('/reports', authenticate, authorizePermission('payroll', 'view'), getPayrollReports);
router.get('/export/csv', authenticate, authorizePermission('payroll', 'view'), exportPayrollCSV);
router.get('/export/excel', authenticate, authorizePermission('payroll', 'view'), exportPayrollExcel);

// ============================================================
// AUDIT LOGS
// ============================================================
router.get('/audit-logs', authenticate, authorizePermission('payroll', 'view'), getPayrollAuditLogs);

// ============================================================
// TEMP CHANGES (preserved)
// ============================================================
router.get("/get-edits", authenticate, authorizePermission('payroll', 'view'), getTempEditByEmployee);
router.post("/post-edits", authenticate, authorizePermission('payroll', 'edit'), saveTempEdit);
router.post("/reset-edits", authenticate, authorizePermission('payroll', 'edit'), resetTempEdit);

module.exports = router;
