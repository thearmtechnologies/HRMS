const express = require('express');
const {
    createUser,
    loginUser,
    changePassword,
    forgotPassword,
    resendOtp,
    verifyForgotPasswordOtp,
    resetPassword,
    getUser,
    verifyOtpRegistration,
    getAllUsers,
    editUser,
    toggleUserStatus
} = require('../controllers/authController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(authenticate);

router.post('/change-password', changePassword);
router.get('/user-profile', getUser);
router.post('/verify-otp-registration', verifyOtpRegistration); // Keep if still using OTP

// RBAC routes
router.post('/users', authorizeRoles('admin', 'hr'), createUser);
router.get('/users', authorizeRoles('admin', 'hr'), getAllUsers);
router.put('/users/:id', authorizeRoles('admin', 'hr'), editUser);
router.patch('/users/:id/status', authorizeRoles('admin'), toggleUserStatus);

module.exports = router;