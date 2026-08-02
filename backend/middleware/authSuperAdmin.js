const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');

const authSuperAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Explicitly verify this is a super admin token type
    if (decoded.type !== 'superadmin' || !decoded.id) {
      return res.status(403).json({ message: 'Access denied. Invalid token type for Super Admin.' });
    }

    const superAdmin = await SuperAdmin.findById(decoded.id);

    if (!superAdmin) {
      return res.status(401).json({ message: 'Access denied. Super Admin not found.' });
    }

    if (!superAdmin.isActive) {
      return res.status(403).json({ message: 'Access denied. Super Admin account is deactivated.' });
    }

    // Set on req.superAdmin and do not overwrite req.user
    req.superAdmin = superAdmin;
    next();
  } catch (error) {
    console.error('Super Admin Auth Middleware error:', error);
    return res.status(401).json({ message: 'Invalid or expired Super Admin token.' });
  }
};

module.exports = authSuperAdmin;
