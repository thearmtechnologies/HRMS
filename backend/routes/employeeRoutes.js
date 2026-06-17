const express = require('express');
const router = express.Router();
const { 
  createEmployee, getEmployees, updateEmployeeImage, getEmployeeDataById, 
  updateEmployeeAdmin, updateEmployeeSelf, deleteEmployee, getSortedBirthdays,
  approveBankDetails, verifyDocument, getPendingApprovals 
} = require('../controllers/employeeController');
const upload = require('../middleware/multer');

router.post('/employee', upload.single("image"), createEmployee);
router.get('/employee', getEmployees);
router.get('/employee/pending-approvals', getPendingApprovals);
router.put('/employee/:id/image', upload.single("image"), updateEmployeeImage);
router.get('/employee/:id', getEmployeeDataById);
router.put('/employee/admin/:id', updateEmployeeAdmin);
router.put('/employee/self/:id', updateEmployeeSelf);
router.put('/employee/:id/approve-bank', approveBankDetails);
router.put('/employee/:id/verify-document', verifyDocument);
router.delete('/employee/:id', deleteEmployee);
router.get('/birthdays', getSortedBirthdays);

module.exports = router;
