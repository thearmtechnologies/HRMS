const Shift = require("../models/Shift");
const Employee = require("../models/Employee");

const createShift = async (req, res) => {
    try {
        const { name, type, startTime, endTime, weeklyOffDays, breakDuration, isDefault } = req.body;
        const shift = new Shift({ name, type, startTime, endTime, weeklyOffDays, breakDuration, isDefault });
        await shift.save();
        res.status(201).json(shift);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getShifts = async (req, res) => {
    try {
        const shifts = await Shift.find();
        res.status(200).json(shifts);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const assignShift = async (req, res) => {
    try {
        const { employeeId, shiftId } = req.body;
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const shift = await Shift.findById(shiftId);
        if (!shift) return res.status(404).json({ message: "Shift not found" });

        employee.shift = shift._id;
        await employee.save();
        
        res.status(200).json({ message: "Shift assigned successfully", employee });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getMyShift = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.userId }).populate("shift");
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        if (employee.shift) {
            return res.status(200).json(employee.shift);
        }

        // Return default shift if no specific assignment
        let defaultShift = await Shift.findOne({ isDefault: true });
        if (!defaultShift) {
            // Create a fallback default shift if none exists in DB
            defaultShift = new Shift({
                name: "Standard Shift",
                type: "Fixed",
                startTime: "09:00",
                endTime: "18:00",
                weeklyOffDays: ["Saturday", "Sunday"],
                breakDuration: 1,
                isDefault: true
            });
            await defaultShift.save();
        }

        res.status(200).json(defaultShift);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    createShift,
    getShifts,
    assignShift,
    getMyShift
};
