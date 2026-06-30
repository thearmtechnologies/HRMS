const Designation = require('../models/Designation');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

const logAudit = async (action, entityType, entityId, changedBy, oldValue, newValue, description) => {
  try {
    await AuditLog.create({
      action,
      entityType,
      entityId,
      changedBy,
      oldValue,
      newValue,
      description
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
};

// --- DESIGNATIONS ---

const getDesignations = async (req, res) => {
  try {
    const designations = await Designation.find().sort({ createdAt: -1 });
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching designations' });
  }
};

const getActiveDesignations = async (req, res) => {
  try {
    const designations = await Designation.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching active designations' });
  }
};

const createDesignation = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Designation name is required' });

    const existing = await Designation.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) return res.status(400).json({ message: 'Designation already exists' });

    const newDesignation = new Designation({
      name,
      createdBy: req.user.userId
    });

    await newDesignation.save();

    await logAudit('CREATE_DESIGNATION', 'Designation', newDesignation._id, req.user.userId, null, { name: newDesignation.name, isActive: true }, `Created designation ${name}`);

    res.status(201).json({ message: 'Designation created successfully', designation: newDesignation });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating designation' });
  }
};

const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Designation name is required' });

    const designation = await Designation.findById(id);
    if (!designation) return res.status(404).json({ message: 'Designation not found' });

    const existing = await Designation.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: id } });
    if (existing) return res.status(400).json({ message: 'Another designation with this name already exists' });

    const oldValue = { name: designation.name };
    designation.name = name;
    designation.updatedBy = req.user.userId;

    await designation.save();

    await logAudit('UPDATE_DESIGNATION', 'Designation', designation._id, req.user.userId, oldValue, { name: designation.name }, `Updated designation name to ${name}`);

    res.status(200).json({ message: 'Designation updated successfully', designation });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating designation' });
  }
};

const toggleDesignationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findById(id);
    if (!designation) return res.status(404).json({ message: 'Designation not found' });

    const oldStatus = designation.isActive;
    designation.isActive = !designation.isActive;
    designation.updatedBy = req.user.userId;

    await designation.save();

    const action = designation.isActive ? 'ACTIVATE_DESIGNATION' : 'DEACTIVATE_DESIGNATION';
    await logAudit(action, 'Designation', designation._id, req.user.userId, { isActive: oldStatus }, { isActive: designation.isActive }, `${designation.isActive ? 'Activated' : 'Deactivated'} designation ${designation.name}`);

    res.status(200).json({ message: `Designation ${designation.isActive ? 'activated' : 'deactivated'} successfully`, designation });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling designation status' });
  }
};

// --- ROLES & PERMISSIONS ---

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching roles' });
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    const oldPermissions = role.permissions;
    role.permissions = permissions;
    role.updatedBy = req.user.userId;

    await role.save();

    await logAudit('UPDATE_PERMISSIONS', 'Role', role._id, req.user.userId, oldPermissions, permissions, `Updated permissions for role ${role.displayName}`);

    res.status(200).json({ message: 'Role permissions updated successfully', role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating role permissions' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('changedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
};

module.exports = {
  getDesignations,
  getActiveDesignations,
  createDesignation,
  updateDesignation,
  toggleDesignationStatus,
  getRoles,
  updateRolePermissions,
  getAuditLogs
};
