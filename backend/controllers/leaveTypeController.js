const LeaveType = require("../models/LeaveType");
const LeaveBalance = require("../models/LeaveBalance");
const { processLeaveAccruals } = require("../cron/leaveAccrualJob");
const { createCompanyRecord, findCompanyRecords, updateCompanyRecord, deleteCompanyRecord, findOneCompanyRecord } = require("../utils/tenantUtils");

const LEGACY_MAPPING = {
  "Casual Leave": "casualLeave",
  "Sick Leave": "sickLeave",
  "Earned Leave": "earnedLeave",
  "Comp Off": "compOff",
  "Unpaid Leave": "unpaidLeave",
  "Work From Home": "wfh"
};

// @desc    Create a new Leave Type
// @route   POST /api/leave-types
// @access  Private
const createLeaveType = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Check for duplicate name
    const existingName = await findOneCompanyRecord(LeaveType, { name: { $regex: new RegExp(`^${name}$`, "i") } }, req.company);
    if (existingName) {
      return res.status(400).json({ error: "Leave name must be unique." });
    }

    // Check for duplicate code (if provided)
    if (code) {
      const existingCode = await findOneCompanyRecord(LeaveType, { code: { $regex: new RegExp(`^${code}$`, "i") } }, req.company);
      if (existingCode) {
        return res.status(400).json({ error: "Leave code must be unique." });
      }
    }

    const leaveType = await createCompanyRecord(LeaveType, {
      ...req.body,
      createdBy: req.user.userId,
    }, req.company);
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
    const leaveTypes = await findCompanyRecords(LeaveType, filter, req.company, { path: 'createdBy updatedBy', select: 'firstName lastName' });
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
      const existingName = await findOneCompanyRecord(LeaveType, { _id: { $ne: id }, name: { $regex: new RegExp(`^${name}$`, "i") } }, req.company);
      if (existingName) {
        return res.status(400).json({ error: "Leave name must be unique." });
      }
    }

    // Check duplicate code
    if (code) {
      const existingCode = await findOneCompanyRecord(LeaveType, { _id: { $ne: id }, code: { $regex: new RegExp(`^${code}$`, "i") } }, req.company);
      if (existingCode) {
        return res.status(400).json({ error: "Leave code must be unique." });
      }
    }

    const existingLeaveType = await findOneCompanyRecord(LeaveType, { _id: id }, req.company);
    if (!existingLeaveType) {
      return res.status(404).json({ error: "Leave type not found" });
    }

    const updatedLeaveType = await updateCompanyRecord(LeaveType, id, req.company, { ...req.body, updatedBy: req.user.userId });

    // Propagate allocation changes to existing assigned balances
    if (req.body.allocation !== undefined) {
      const diff = Number(req.body.allocation) - Number(existingLeaveType.allocation || 0);
      if (diff !== 0) {
        const leaveName = updatedLeaveType.name;
        const balanceKey = LEGACY_MAPPING[leaveName];
        
        if (balanceKey && ["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(balanceKey)) {
          // It's a legacy type, update the fields directly
          await LeaveBalance.updateMany(
            { company: req.company, [`${balanceKey}.isActive`]: true },
            { 
              $inc: { 
                [`${balanceKey}.total`]: diff,
                [`${balanceKey}.available`]: diff 
              } 
            }
          );
        } else {
          // It's a dynamic balance
          const balances = await LeaveBalance.find({ company: req.company });
          for (let b of balances) {
            if (b.dynamicBalances && b.dynamicBalances.has(leaveName)) {
              let data = b.dynamicBalances.get(leaveName);
              if (data.isActive !== false) {
                data.total = (data.total || 0) + diff;
                data.available = (data.available || 0) + diff;
                b.dynamicBalances.set(leaveName, data);
                await b.save();
              }
            }
          }
        }
      }
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
    
    const doc = await findOneCompanyRecord(LeaveType, { _id: id }, req.company);
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

const triggerManualAccrual = async (req, res) => {
  try {
    await processLeaveAccruals();
    res.status(200).json({ message: "Manual leave accrual completed successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to run manual leave accrual." });
  }
};

module.exports = {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  deleteLeaveType,
  triggerManualAccrual
};
