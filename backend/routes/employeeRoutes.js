const express = require('express');
const router = express.Router();
const { 
  createEmployee, getEmployees, updateEmployeeImage, getEmployeeDataById, 
  updateEmployeeAdmin, updateEmployeeSelf, deleteEmployee, getSortedBirthdays,
  getEmployeeProfileMe 
} = require('../controllers/employeeController');
const upload = require('../middleware/multer');

const { authenticate } = require('../middleware/auth');

router.post('/employee', upload.single("image"), createEmployee);
router.get('/employee', getEmployees);
router.get('/employee/profile/me', authenticate, getEmployeeProfileMe);
router.put('/employee/:id/image', upload.single("image"), updateEmployeeImage);
router.get('/employee/:id', getEmployeeDataById);
router.put('/employee/admin/:id', updateEmployeeAdmin);
router.put('/employee/self/:id', updateEmployeeSelf);
router.delete('/employee/:id', deleteEmployee);
router.get('/birthdays', getSortedBirthdays);

module.exports = router;
