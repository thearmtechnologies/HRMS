const express = require('express');
const { createDepartment, getDepartments, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const router = express.Router();

router.post('/department', createDepartment);
router.get('/department', getDepartments);
router.put('/department/:id', updateDepartment);
router.delete('/department/:id', deleteDepartment);

module.exports = router;
