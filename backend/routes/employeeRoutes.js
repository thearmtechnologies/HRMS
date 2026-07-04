const express = require('express');
const router = express.Router();
const { 
  createEmployee, getEmployees, updateEmployeeImage, getEmployeeDataById, 
  updateEmployeeAdmin, updateEmployeeSelf, deleteEmployee, getSortedBirthdays,
  getEmployeeProfileMe, updateEmployeePermissions, updateCurrentEmployeeImage, uploadEmployeeDocument
} = require('../controllers/employeeController');
const { authorizePermission } = require('../middleware/permission');
const upload = require('../middleware/multer');

const { authenticate } = require('../middleware/auth');

router.post('/employee', authenticate, authorizePermission('employee_management', 'create'), upload.single("image"), createEmployee);
router.get('/employee', authenticate, authorizePermission('employee_management', 'view'), getEmployees);
router.get('/employee/profile/me', authenticate, getEmployeeProfileMe);
router.put('/employee/profile/me/image', authenticate, upload.single("image"), updateCurrentEmployeeImage);
router.put('/employee/profile/me/documents/:docType', authenticate, upload.single("document"), uploadEmployeeDocument);
router.put('/employee/:id/documents/:docType', authenticate, upload.single("document"), uploadEmployeeDocument);
router.put('/employee/:id/image', authenticate, upload.single("image"), updateEmployeeImage);
router.get('/employee/:id', authenticate, getEmployeeDataById);
router.put('/employee/admin/:id', authenticate, authorizePermission('employee_management', 'edit'), updateEmployeeAdmin);
router.put('/employee/:id/permissions', authenticate, authorizePermission('employee_management', 'edit'), updateEmployeePermissions);
router.put('/employee/self/:id', authenticate, updateEmployeeSelf);
router.delete('/employee/:id', authenticate, authorizePermission('employee_management', 'delete'), deleteEmployee);
router.get('/birthdays', authenticate, getSortedBirthdays);

module.exports = router;
