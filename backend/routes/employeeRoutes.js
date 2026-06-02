const express = require('express');
const router = express.Router();
const { createEmployee, getEmployees, updateEmployeeImage, getEmployeeDataById, updateEmployee, deleteEmployee, getSortedBirthdays } = require('../controllers/employeeController');
const upload = require('../middleware/multer');

router.post('/employee', upload.single("image"), createEmployee);
router.get('/employee', getEmployees);
router.put("/employee/:id/image", upload.single("image"), updateEmployeeImage);
router.get("/employee/:id", getEmployeeDataById);
router.put("/employee/:id", updateEmployee);
router.delete('/employee/:id', deleteEmployee);
router.get('/birthdays', getSortedBirthdays)

module.exports = router;
