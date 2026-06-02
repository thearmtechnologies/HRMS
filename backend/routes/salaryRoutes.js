const express = require('express');
const router = express.Router();
const {
    createFixedSalary,
    getFixedSalary,
    getFixedSalaryByEmployee,
    updateFixedSalaryByEmployeeId,
    getTempEditByEmployee,
    saveTempEdit,
    resetTempEdit,
    createOrUpdatePayroll,
    getAllPayrolls,
    getPayrollPdf
} = require('../controllers/salaryController');
const { getHolidaysByYear, setHolidayConfig, updateHolidayForMonth } = require('../controllers/holidayController');


router.post('/create-holyday', setHolidayConfig);
router.get('/get-holydays/:year', getHolidaysByYear);
router.patch('/update-holyday/:year', updateHolidayForMonth);

router.post('/salary-fixed/employee/:employeeId', createFixedSalary);
router.get('/all-salary-records', getFixedSalary);
router.put('/salary-fixed/employee/:employeeId', updateFixedSalaryByEmployeeId);
router.get('/salary-fixed/employee/:employeeId', getFixedSalaryByEmployee);

router.post('/final-submit', createOrUpdatePayroll);
router.get('/final-payroll', getAllPayrolls);
router.get('/pdf', getPayrollPdf)

router.get("/get-edits", getTempEditByEmployee);
router.post("/post-edits", saveTempEdit);
router.post("/reset-edits", resetTempEdit);

module.exports = router;

