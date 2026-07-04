const express = require('express');
const { createDepartment, getDepartments, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/permission');
const router = express.Router();

router.post('/department', authenticate, authorizePermission('departments', 'create'), createDepartment);
router.get('/department', authenticate, authorizePermission('departments', 'view'), getDepartments);
router.put('/department/:id', authenticate, authorizePermission('departments', 'edit'), updateDepartment);
router.delete('/department/:id', authenticate, authorizePermission('departments', 'delete'), deleteDepartment);

module.exports = router;
