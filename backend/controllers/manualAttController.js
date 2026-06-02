const ManualAtt = require("../models/ManualAtt");
const Employee = require("../models/Employee");


const markAttendance = async (req, res) => {
    try {
        const { employeeId, date, status, remarks } = req.body;

        if (!employeeId || !date || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const attendance = await ManualAtt.findOneAndUpdate(
            { employee: employeeId, date: attendanceDate },
            { status, remarks },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.json({ message: "Attendance saved successfully", attendance });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getAttendanceForMonthAll = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year)
            return res.status(400).json({ message: "Month & Year required" });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const attendance = await ManualAtt.find({
            date: { $gte: start, $lte: end },
        }).populate("employee");

        return res.json(attendance);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getAttendanceByMonth = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;

        if (!month || !year)
            return res.status(400).json({ message: "Month & Year required" });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const attendance = await ManualAtt.find({
            employee: employeeId,
            date: { $gte: start, $lte: end },
        }).sort({ date: 1 });

        return res.json(attendance);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) return res.status(400).json({ message: "Date required" });

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const records = await ManualAtt.find({ date: attendanceDate }).populate("employee");

        return res.json(records);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await ManualAtt.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Attendance record not found" });
        }

        return res.json({ message: "Attendance record deleted", deleted });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const deleteMonthAttendance = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month || !year)
            return res.status(400).json({ message: "Month & Year required" });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const deleted = await ManualAtt.deleteMany({
            date: { $gte: start, $lte: end },
        });

        return res.json({ message: "Month attendance cleared", deleted });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const bulkMarkAttendance = async (req, res) => {
    try {
        const { date, employeeStatusList } = req.body;

        if (!date || !Array.isArray(employeeStatusList))
            return res.status(400).json({ message: "Invalid data" });

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const bulkOps = employeeStatusList.map((item) => ({
            updateOne: {
                filter: {
                    employee: item.employeeId,
                    date: attendanceDate,
                },
                update: {
                    status: item.status,
                    remarks: item.remarks || "",
                },
                upsert: true,
            },
        }));

        await ManualAtt.bulkWrite(bulkOps);

        res.json({ message: "Bulk attendance updated" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const calculatePayroll = async (req, res) => {
    try {
        const { employeeId, month, year } = req.body;

        if (!employeeId || !month || !year)
            return res.status(400).json({ message: "Missing fields" });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const attendance = await ManualAtt.find({
            employee: employeeId,
            date: { $gte: start, $lte: end },
        });

        let totalDays = 0;

        attendance.forEach((day) => {
            if (day.status === "present") totalDays += 1;
            else if (day.status === "first_half" || day.status === "second_half")
                totalDays += 0.5;
        });

        return res.json({
            employeeId,
            month,
            year,
            payableDays: totalDays,
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getAttendanceByEmpId = async (req, res) => {
    try {
        const { employee } = req.params;
        const { month, year } = req.query;

        if (!employeeId) return res.status(400).json({ message: "employeeId required" });
        if (!month || !year)
            return res.status(400).json({ message: "Month & Year required" });

        // Find employee
        const employeeId = await Employee.findById(employee);
        if (!employeeId) return res.status(404).json({ message: "Employee not found" });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        // Fetch attendance records
        const attendance = await ManualAtt.find({
            employee: employeeId._id,
            date: { $gte: start, $lte: end },
        }).sort({ date: 1 });

        res.json({ employee, attendance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// ----------------------------------------------------------
module.exports = {
    markAttendance,
    getAttendanceForMonthAll,
    getAttendanceByMonth,
    getAttendanceByDate,
    deleteAttendance,
    deleteMonthAttendance,
    bulkMarkAttendance,
    calculatePayroll,
    getAttendanceByEmpId
};
