const Role = require('../models/Role');
const User = require('../models/User');

/**
 * Middleware to check if the authenticated user has the required permission.
 * It fetches the latest permissions from the database.
 * @param {String} moduleName - The module name (e.g. 'settings', 'employee_management')
 * @param {String} action - The action required (e.g. 'view', 'create', 'edit', 'delete')
 */
const authorizePermission = (moduleName, action = 'view') => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(401).json({ message: 'Access denied. No role assigned.' });
            }

            // Always allow admin bypass if needed, but the prompt says:
            // "Admin can enable or disable access. Do not hardcode configuration."
            // So we will rely entirely on the DB permissions even for Admin.

            const roleDoc = await Role.findOne({ name: req.user.role, isActive: true });
            
            if (!roleDoc) {
                return res.status(403).json({ message: 'Access denied. Role not found or inactive.' });
            }

            const userDoc = await User.findById(req.user.userId).select('permissionOverrides');
            
            let modulePerm = null;

            // 1. Check if there's a user-specific override for this module
            if (userDoc && userDoc.permissionOverrides) {
                modulePerm = userDoc.permissionOverrides.find(p => p.module === moduleName);
            }

            // 2. If no override exists, fall back to Role default
            if (!modulePerm) {
                modulePerm = roleDoc.permissions.find(p => p.module === moduleName);
            }
            
            if (modulePerm && modulePerm[action] === true) {
                next();
            } else {
                return res.status(403).json({ message: `Access denied. Insufficient permissions for ${moduleName}:${action}.` });
            }
        } catch (error) {
            console.error("Permission Check Error:", error);
            res.status(500).json({ message: 'Server error checking permissions' });
        }
    };
};

module.exports = { authorizePermission };
