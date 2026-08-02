const express = require('express');
const router = express.Router();
const superAdminAuthController = require('../controllers/superAdminAuthController');
const authSuperAdmin = require('../middleware/authSuperAdmin');

router.post('/login', superAdminAuthController.loginSuperAdmin);
router.get('/me', authSuperAdmin, superAdminAuthController.getSuperAdminMe);

module.exports = router;
