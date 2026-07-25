const LeaveType = require("../models/LeaveType");

// @desc    Create a new Leave Type
// @route   POST /api/leave-types
// @access  Private
const createLeaveType = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Check for duplicate name
    const existingName = await LeaveType.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingName) {
      return res.status(400).json({ error: "Leave name must be unique." });
    }

    // Check for duplicate code (if provided)
    if (code) {
      const existingCode = await LeaveType.findOne({ code: { $regex: new RegExp(`^${code}$`, "i") } });
      if (existingCode) {
        return res.status(400).json({ error: "Leave code must be unique." });
      }
    }

    const leaveType = new LeaveType({
      ...req.body,
      createdBy: req.user.userId,
    });

    await leaveType.save();
    res.status(201).json({ message: "Leave type created successfully", leaveType });
  } catch (error) {
    console.error("Error creating leave type:", error);
    res.status(500).json({ error: error.message || "Failed to create leave type" });
  }
};

// @desc    Get all Leave Types (defaults to active only unless all=true is passed)
// @route   GET /api/leave-types
// @access  Private
const getLeaveTypes = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const leaveTypes = await LeaveType.find(filter).populate('createdBy updatedBy', 'firstName lastName');
    res.status(200).json(leaveTypes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leave types" });
  }
};

// @desc    Update a Leave Type
// @route   PUT /api/leave-types/:id
// @access  Private
const updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    // Check duplicate name
    if (name) {
      const existingName = await LeaveType.findOne({ _id: { $ne: id }, name: { $regex: new RegExp(`^${name}$`, "i") } });
      if (existingName) {
        return res.status(400).json({ error: "Leave name must be unique." });
      }
    }

    // Check duplicate code
    if (code) {
      const existingCode = await LeaveType.findOne({ _id: { $ne: id }, code: { $regex: new RegExp(`^${code}$`, "i") } });
      if (existingCode) {
        return res.status(400).json({ error: "Leave code must be unique." });
      }
    }

    const updatedLeaveType = await LeaveType.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user.userId },
      { new: true, runValidators: true }
    );

    if (!updatedLeaveType) {
      return res.status(404).json({ error: "Leave type not found" });
    }

    res.status(200).json({ message: "Leave type updated successfully", leaveType: updatedLeaveType });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update leave type" });
  }
};

// @desc    Soft Delete / Toggle active state of a Leave Type
// @route   DELETE /api/leave-types/:id
// @access  Private
const deleteLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await LeaveType.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Leave type not found" });
    }

    // Toggle active state to preserve historical records while supporting restore
    doc.isActive = !doc.isActive;
    doc.updatedBy = req.user.userId;
    await doc.save();

    res.status(200).json({ 
      message: doc.isActive ? "Leave type restored successfully" : "Leave type deactivated successfully",
      isActive: doc.isActive
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update leave type status" });
  }
};

module.exports = {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  deleteLeaveType
};
