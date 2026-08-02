const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');

// POST /api/super-admin/login
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const superAdmin = await SuperAdmin.findOne({ email: normalizedEmail });

    if (!superAdmin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!superAdmin.isActive) {
      return res.status(403).json({ message: 'Super Admin account is currently deactivated. Please contact platform support.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, superAdmin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate dedicated Super Admin JWT
    const token = jwt.sign(
      {
        id: superAdmin._id,
        type: 'superadmin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '9h' }
    );

    // Update lastLogin
    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    res.status(200).json({
      message: 'Super Admin login successful',
      token,
      superAdmin: {
        id: superAdmin._id,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        email: superAdmin.email,
        isActive: superAdmin.isActive,
        lastLogin: superAdmin.lastLogin,
        type: 'superadmin'
      }
    });
  } catch (error) {
    console.error('Super Admin login error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET /api/super-admin/me
exports.getSuperAdminMe = async (req, res) => {
  try {
    // req.superAdmin is populated by authSuperAdmin middleware
    if (!req.superAdmin) {
      return res.status(404).json({ message: 'Super Admin profile not found' });
    }

    res.status(200).json({
      id: req.superAdmin._id,
      firstName: req.superAdmin.firstName,
      lastName: req.superAdmin.lastName,
      email: req.superAdmin.email,
      isActive: req.superAdmin.isActive,
      lastLogin: req.superAdmin.lastLogin,
      type: 'superadmin'
    });
  } catch (error) {
    console.error('Error fetching Super Admin profile:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
