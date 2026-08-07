const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).populate('company');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact administrator.' });
        }

        const company = user.company;
        if (company) {
            if (company.isDeleted) {
                return res.status(403).json({ message: 'Company account has been deactivated.' });
            }
            if (company.status === 'Inactive') {
                return res.status(403).json({ message: 'Company account is currently inactive.' });
            }
            if (company.status === 'Suspended') {
                return res.status(403).json({ message: 'Company account is currently suspended. Please contact your company administrator.' });
            }
        }

        const employee = await Employee.findOne({
            $or: [{ user: user._id }, { email: user.email }]
        });
        if (employee && ['Resigned', 'Terminated', 'Inactive'].includes(employee.status)) {
            return res.status(403).json({ message: `Access denied. Employee status: ${employee.status}.` });
        }

        req.user = {
            userId: user._id,
            email: user.email,
            role: user.role,
            company: user.company // populated Company object
        };
        req.company = user.company ? (user.company._id || user.company) : null;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied. Role not found.' });
        }

        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
    };
};

module.exports = { authenticate, authorizeRoles };