const express = require('express');
const multer = require('multer');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { downloadEmployeeTemplate, importEmployees } = require('../controllers/employeeImportController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);
router.use(authorizeRoles('admin', 'hr'));

router.get('/import/template', downloadEmployeeTemplate);
router.post('/import', upload.single('file'), importEmployees);

module.exports = router;