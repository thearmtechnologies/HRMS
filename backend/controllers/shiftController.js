const Shift = require("../models/Shift");
const Employee = require("../models/Employee");
const { createCompanyRecord, findCompanyRecords, updateCompanyRecord, deleteCompanyRecord, findOneCompanyRecord } = require("../utils/tenantUtils");

const createShift = async (req, res) => {
    try {
        const { name, type, startTime, endTime, weeklyOffDays, breakDuration, isDefault, lateCheckInGraceTime, earlyCheckOutGraceTime, enableLateDeduction, allowedLateEntries, lateDeductionType, lateDeductionValue } = req.body;
        const shiftData = { name, type, startTime, endTime, weeklyOffDays, breakDuration, isDefault, lateCheckInGraceTime, earlyCheckOutGraceTime, enableLateDeduction, allowedLateEntries, lateDeductionType, lateDeductionValue };
        const shift = await createCompanyRecord(Shift, shiftData, req.company);
        res.status(201).json(shift);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getShifts = async (req, res) => {
    try {
        const shifts = await findCompanyRecords(Shift, {}, req.company);
        res.status(200).json(shifts);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const assignShift = async (req, res) => {
    try {
        const { employeeId, shiftId, effectiveFrom, remarks } = req.body;
        const employee = await findOneCompanyRecord(Employee, { _id: employeeId }, req.company);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const shift = await findOneCompanyRecord(Shift, { _id: shiftId }, req.company);
        if (!shift) return res.status(404).json({ message: "Shift not found" });

        // Validate effectiveFrom
        if (!effectiveFrom) {
            return res.status(400).json({ message: "Effective from date is required." });
        }

        const newEffectiveDate = new Date(effectiveFrom);
        newEffectiveDate.setHours(0, 0, 0, 0);

        // Push to history
        employee.shiftHistory.push({
            shift: shift._id,
            effectiveFrom: newEffectiveDate,
            remarks: remarks || null,
            assignedBy: req.user.userId
        });

        // Update current shift based on today's true active shift
        const { getActiveShiftForDate } = require('../utils/shiftUtils');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeShift = getActiveShiftForDate(employee, today);
        if (activeShift) {
            employee.shift = activeShift._id || activeShift;
        } else {
            employee.shift = shift._id;
        }

        await employee.save();
        
        res.status(200).json({ message: "Shift assigned successfully", employee });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getMyShift = async (req, res) => {
    try {
        const employee = await findOneCompanyRecord(Employee, { user: req.user.userId }, req.company, "shift");
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        if (employee.shift) {
            return res.status(200).json(employee.shift);
        }

        // Return default shift if no specific assignment
        let defaultShift = await findOneCompanyRecord(Shift, { isDefault: true }, req.company);
        if (!defaultShift) {
            // Create a fallback default shift if none exists in DB
            defaultShift = await createCompanyRecord(Shift, {
                name: "Standard Shift",
                type: "Fixed",
                startTime: "09:00",
                endTime: "18:00",
                weeklyOffDays: ["Saturday", "Sunday"],
                breakDuration: 1,
                isDefault: true,
                lateCheckInGraceTime: 0,
                earlyCheckOutGraceTime: 0,
            }, req.company);
        }

        res.status(200).json(defaultShift);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedShift = await updateCompanyRecord(Shift, id, req.company, req.body, { new: true });
        if (!updatedShift) return res.status(404).json({ message: "Shift not found" });
        res.status(200).json(updatedShift);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedShift = await deleteCompanyRecord(Shift, id, req.company);
        if (!deletedShift) return res.status(404).json({ message: "Shift not found" });
        res.status(200).json({ message: "Shift deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    createShift,
    getShifts,
    assignShift,
    getMyShift,
    updateShift,
    deleteShift
};
