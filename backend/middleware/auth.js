const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
        console.log("✓ authenticate");

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
                console.log("❌ No token");

        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log("Decoded JWT:", decoded);

        req.user = decoded;
        next();
    } catch (error) {
                console.log("JWT Error:", error.message);

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