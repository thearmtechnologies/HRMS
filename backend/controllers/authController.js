const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { generateOtp } = require('../utils/otp');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const { sendOtpEmail, sendAccountCreationEmail, sendWelcomeEmail } = require('../config/emailService');
const Role = require('../models/Role');

// Helper to generate a random password
const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
};

// Helper to fetch permissions dynamically from the database and merge with user overrides
const fetchUserPermissions = async (userId, roleName) => {
    try {
        const role = await Role.findOne({ name: roleName, isActive: true }); // Role might be global or company-specific
        const user = await User.findById(userId).select('permissionOverrides');
        
        let mergedPermissions = [];
        const rolePerms = role ? role.permissions : [];
        const userOverrides = (user && user.permissionOverrides) ? user.permissionOverrides : [];

        // Map role permissions by module for easy merging
        const permMap = new Map();
        rolePerms.forEach(p => permMap.set(p.module, { ...p.toObject() }));

        // Override with user specifics
        userOverrides.forEach(override => {
            const moduleName = override.module;
            if (permMap.has(moduleName)) {
                // If override exists, it fully replaces the role permission for this module (as per user feedback)
                permMap.set(moduleName, { ...override.toObject() });
            } else {
                // If user has an override for a module not in role permissions
                permMap.set(moduleName, { ...override.toObject() });
            }
        });

        mergedPermissions = Array.from(permMap.values());
        return mergedPermissions;
    } catch (err) {
        console.error("Error fetching user permissions:", err);
        return [];
    }
};

const createUser = async (req, res) => {
    const { firstName, lastName, email, role, department, designation, phoneNumber, joiningDate, company } = req.body;

    if (!firstName || !lastName || !email || !role) {
        return res.status(400).json({ message: 'First name, last name, email, and role are required.' });
    }

    if (!company) {
        return res.status(400).json({ message: 'Company ID is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(company)) {
        return res.status(400).json({ message: 'Invalid Company ID format.' });
    }

    const creatorRole = req.user.role;

    if (creatorRole === 'hr' && role !== 'employee') {
        return res.status(403).json({ message: 'HR can only create employee accounts.' });
    }

    try {
        const existingCompany = await Company.findOne({ _id: company, isDeleted: { $ne: true } });
        if (!existingCompany) {
            return res.status(400).json({ message: 'Company not found or suspended.' });
        }

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
            company: existingCompany._id,
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
        const normalizedEmail = email.trim().toLowerCase();

        // 1. Find User and populate Company
        const user = await User.findOne({ email: normalizedEmail }).populate('company');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact administrator.' });
        }

        // Check corresponding Employee record status (if one exists)
        const employee = await Employee.findOne({
            $or: [{ user: user._id }, { email: user.email }]
        });
        if (employee && ['Resigned', 'Terminated', 'Inactive'].includes(employee.status)) {
            return res.status(403).json({ message: `Your account is deactivated due to employee status: ${employee.status}.` });
        }

        // 2. Verify Company exists and check its status
        const company = user.company;
        if (!company || company.isDeleted) {
            return res.status(400).json({ message: 'User company not found or deactivated.' });
        }

        if (company.status === 'Inactive') {
            return res.status(403).json({ message: 'Company account is currently inactive. Please contact your company administrator.' });
        }
        if (company.status === 'Suspended') {
            return res.status(403).json({ message: 'Company account is currently suspended. Please contact your company administrator.' });
        }

        // 3. Verify password
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

        let profileImg = user.profileImage;
        if (!profileImg) {
            const emp = await Employee.findOne({
                $or: [{ user: user._id }, { email: (user.email || '').toLowerCase() }, { personalEmail: (user.email || '').toLowerCase() }]
            }).select('url profileImage');
            if (emp && (emp.url || emp.profileImage)) {
                profileImg = emp.url || emp.profileImage;
                user.profileImage = profileImg;
                await user.save().catch(() => {});
            }
        }

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
                profileImage: profileImg,
                isFirstLogin: user.isFirstLogin,
                companyId: company._id,
                companyName: company.companyName,
                companyCode: company.companyCode,
                permissions: await fetchUserPermissions(user._id, user.role)
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
        const user = await User.findOne({ _id: userId, company: req.company });
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

        // Prevent multiple OTP sends within 60 seconds (10 min expiry - 9 min = 60 seconds)
        if (user.otp && user.otpExpires && user.otpExpires > Date.now() + 540000) {
            const waitSeconds = Math.ceil((user.otpExpires - 540000 - Date.now()) / 1000);
            return res.status(429).json({ message: `An OTP was already sent recently. Please check your email or wait ${waitSeconds}s before requesting again.` });
        }

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

        // Prevent multiple OTP sends within 60 seconds
        if (user.otp && user.otpExpires && user.otpExpires > Date.now() + 540000) {
            const waitSeconds = Math.ceil((user.otpExpires - 540000 - Date.now()) / 1000);
            return res.status(429).json({ message: `Please wait ${waitSeconds}s before resending another OTP.` });
        }

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
        const user = await User.findById(userId).select('-password').populate('department', 'departmentName').populate('company');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userObj = user.toObject();
        userObj.permissions = await fetchUserPermissions(userId, user.role);

        if (!userObj.profileImage) {
            const emp = await Employee.findOne({
                $or: [{ user: userId }, { email: (user.email || '').toLowerCase() }, { personalEmail: (user.email || '').toLowerCase() }]
            }).select('url profileImage');
            if (emp && (emp.url || emp.profileImage)) {
                userObj.profileImage = emp.url || emp.profileImage;
                user.profileImage = userObj.profileImage;
                await user.save().catch(() => {});
            }
        }

        if (user.company) {
            userObj.companyId = user.company._id;
            userObj.companyName = user.company.companyName;
            userObj.companyCode = user.company.companyCode;
        }

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

        const users = await User.find(query).select('-password').populate('company');
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

        const updatedUser = await User.findByIdAndUpdate(userId, { ...updates, updatedBy: req.user.userId }, { new: true }).select('-password').populate('company');
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({ _id: userId, company: req.company });
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