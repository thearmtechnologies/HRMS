const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOtp } = require('../utils/otp');
const User = require('../models/User');
const { sendOtpEmail, sendAccountCreationEmail, sendWelcomeEmail } = require('../config/emailService');

// Helper to generate a random password
const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
};

// Map role to permissions for the frontend
const getPermissionsForRole = (role) => {
    switch(role) {
        case 'admin':
            return ['create_users', 'update_users', 'delete_users', 'manage_departments', 'manage_projects', 'manage_attendance', 'manage_payroll'];
        case 'hr':
            return ['create_employee', 'update_employee', 'attendance_management', 'leave_management'];
        case 'project_manager':
            return ['create_project', 'assign_project', 'manage_project_members'];
        case 'department_manager':
            return ['manage_department_staff', 'approve_department_requests'];
        case 'employee':
        default:
            return ['view_profile', 'update_own_profile', 'mark_attendance', 'apply_leave', 'view_payslips'];
    }
};

const createUser = async (req, res) => {
    const { firstName, lastName, email, role, department, designation, phoneNumber, joiningDate } = req.body;

    if (!firstName || !lastName || !email || !role) {
        return res.status(400).json({ message: 'First name, last name, email, and role are required.' });
    }

    const creatorRole = req.user.role;

    if (creatorRole === 'hr' && role !== 'employee') {
        return res.status(403).json({ message: 'HR can only create employee accounts.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            department,
            designation,
            phoneNumber,
            joiningDate,
            createdBy: req.user.userId,
            isActive: true,
            isFirstLogin: true,
            isVerified: false // Needs email verification
        });

        // Generate OTP for email verification
        const otp = generateOtp();
        newUser.otp = otp;
        newUser.otpExpires = Date.now() + 600000;

        await newUser.save();

        sendAccountCreationEmail(email, firstName, randomPassword).catch(err => console.error("❌ Account creation email failed:", err));
        sendOtpEmail(email, otp).catch(err => console.error("❌ OTP email failed:", err));

        res.status(201).json({ message: 'User created successfully. Verification OTP and temporary password sent to email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyOtpRegistration = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Email verified successfully' });
        sendWelcomeEmail(email, user.firstName).catch(err => console.log(err));
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact administrator.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(200).json({
                message: 'Email not verified',
                verified: false,
                requiresVerification: true,
                email: user.email,
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '9h' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            verified: true,
            isFirstLogin: user.isFirstLogin,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                profileImage: user.profileImage,
                isFirstLogin: user.isFirstLogin,
                permissions: getPermissionsForRole(user.role)
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.isFirstLogin = false; // Mark first login as complete
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 600000;
        await user.save();
        sendOtpEmail(email, otp)
            .then(() => console.log("✅ OTP email sent"))
            .catch(err => console.error("❌ OTP email failed:", err));
        res.status(200).json({ message: 'OTP generated. Check your email shortly.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 600000;
        await user.save();
        sendOtpEmail(email, otp).catch(err => console.error("❌ OTP email failed:", err));
        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyForgotPasswordOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired' });

        res.status(200).json({ message: 'OTP is valid.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired' });

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-password').populate('department', 'departmentName');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userObj = user.toObject();
        userObj.permissions = getPermissionsForRole(user.role);
        res.status(200).json(userObj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { role, department } = req.query;
        let query = {};

        if (role) query.role = role;
        if (department) query.department = department;

        const users = await User.find(query).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const editUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        // Don't allow password or role update through this generic endpoint easily
        delete updates.password;
        delete updates.role; // Role updates should perhaps be handled separately or restricted to admin

        const updatedUser = await User.findByIdAndUpdate(userId, { ...updates, updatedBy: req.user.userId }, { new: true }).select('-password');
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.isActive = !user.isActive;
        user.updatedBy = req.user.userId;
        await user.save();
        res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user: { id: user._id, isActive: user.isActive }});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
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
};