const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const RegularizationRequest = require("../models/RegularizationRequest");

// Helper to get start and end of a specific date
const getDayRange = (dateString) => {
    let targetDate;
    if (dateString) {
        targetDate = new Date(dateString);
    } else {
        targetDate = new Date();
    }
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const checkIn = async (req, res) => {
    try {
        const { date, checkInLocation, notes } = req.body;
        
        // Find employee by user ID
        const employee = await Employee.findOne({ user: req.user.userId });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const { start } = getDayRange(date);

        // Check if attendance already exists for today
        let attendance = await Attendance.findOne({ employee: employee._id, date: start });

        if (attendance) {
            if (attendance.checkInTime) {
                return res.status(400).json({ message: "Already checked in today" });
            }
            // Update existing record
            attendance.checkInTime = new Date();
            attendance.checkInLocation = checkInLocation;
            if (notes) attendance.notes = notes;
            
            // Late calculation
            const currentHour = attendance.checkInTime.getHours();
            const currentMin = attendance.checkInTime.getMinutes();
            if (currentHour > 9 || (currentHour === 9 && currentMin > 15)) {
                attendance.status = "Late";
            } else {
                attendance.status = "Present";
            }
            
            await attendance.save();
        } else {
            const now = new Date();
            let status = "Present";
            if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)) {
                status = "Late";
            }

            // Create new record
            attendance = new Attendance({
                employee: employee._id,
                date: start,
                checkInTime: now,
                checkInLocation,
                notes,
                status
            });
            await attendance.save();
        }

        res.status(200).json({ message: "Checked in successfully", attendance });
    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const checkOut = async (req, res) => {
    try {
        const { date, checkOutLocation, notes } = req.body;
        
        const employee = await Employee.findOne({ user: req.user.userId });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const { start } = getDayRange(date);

        const attendance = await Attendance.findOne({ employee: employee._id, date: start });
        
        if (!attendance) {
            return res.status(404).json({ message: "No check-in record found for today" });
        }
        if (attendance.checkOutTime) {
            return res.status(400).json({ message: "Already checked out today" });
        }

        attendance.checkOutTime = new Date();
        attendance.checkOutLocation = checkOutLocation;
        if (notes) attendance.notes = notes;

        // Calculate Working Hours
        const diffInMs = attendance.checkOutTime - attendance.checkInTime;
        const totalHours = diffInMs / (1000 * 60 * 60);
        attendance.totalWorkingHours = parseFloat(totalHours.toFixed(2));

        // Overtime logic: anything above 9 hours
        if (totalHours > 9) {
            attendance.overtimeHours = parseFloat((totalHours - 9).toFixed(2));
        }

        await attendance.save();

        res.status(200).json({ message: "Checked out successfully", attendance });
    } catch (error) {
        console.error("Check-out error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getTodayAttendance = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.userId });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const { start, end } = getDayRange();

        const attendance = await Attendance.findOne({ 
            employee: employee._id,
            date: { $gte: start, $lte: end }
        });

        res.status(200).json(attendance || null);
    } catch (error) {
        console.error("Get today attendance error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getMonthlyAttendance = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ message: "Month and year required" });

        const employee = await Employee.findOne({ user: req.user.userId });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        let records = await Attendance.find({
            employee: employee._id,
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 });

        // Missing Punch Detection
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let updatedRecords = false;

        for (let record of records) {
            if (record.date < today && record.checkInTime && !record.checkOutTime && !record.missingPunch) {
                record.missingPunch = true;
                await record.save();
                updatedRecords = true;
            }
        }

        // Refetch if we made updates to ensure we send fresh data
        if (updatedRecords) {
            records = await Attendance.find({
                employee: employee._id,
                date: { $gte: start, $lte: end }
            }).sort({ date: -1 });
        }

        res.status(200).json(records);
    } catch (error) {
        console.error("Get monthly attendance error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getAttendanceSummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ message: "Month and year required" });

        const employee = await Employee.findOne({ user: req.user.userId });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        const records = await Attendance.find({
            employee: employee._id,
            date: { $gte: start, $lte: end }
        });

        let present = 0;
        let absent = 0;
        let leave = 0;
        let late = 0;
        let totalHours = 0;

        records.forEach(record => {
            if (record.status === "Present" || record.status === "WFH") present++;
            if (record.status === "Absent") absent++;
            if (record.status === "On Leave" || record.status === "Half Day") leave++;
            if (record.status === "Late") late++;
            totalHours += record.totalWorkingHours || 0;
        });

        res.status(200).json({
            present,
            absent,
            leave,
            late,
            totalHours: parseFloat(totalHours.toFixed(2))
        });
    } catch (error) {
        console.error("Get attendance summary error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const requestRegularization = async (req, res) => {
    try {
        const { attendanceId, reason, type, requestedChanges } = req.body;
        const employee = await Employee.findOne({ user: req.user.userId });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const attendance = await Attendance.findOne({ _id: attendanceId, employee: employee._id });
        if (!attendance) return res.status(404).json({ message: "Attendance record not found" });

        const reqRecord = new RegularizationRequest({
            employee: employee._id,
            attendanceRecord: attendance._id,
            date: attendance.date,
            reason,
            type,
            requestedChanges,
            status: "Submitted"
        });
        await reqRecord.save();

        attendance.regularizationStatus = "Submitted";
        await attendance.save();

        res.status(201).json({ message: "Regularization request submitted", request: reqRecord });
    } catch (error) {
        console.error("Regularization request error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getRegularizationRequests = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.userId });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const requests = await RegularizationRequest.find({ employee: employee._id })
            .populate('approver', 'email')
            .sort({ createdAt: -1 });
        
        res.status(200).json(requests);
    } catch (error) {
        console.error("Get regularization requests error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getAllAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const records = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate("employee");

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllRegularizationRequests = async (req, res) => {
  try {
    const requests = await RegularizationRequest.find()
      .populate("employee")
      .populate("attendanceRecord")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateRegularizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Approved" or "Rejected"

    const request = await RegularizationRequest.findById(id).populate("attendanceRecord");
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    request.resolvedAt = new Date();
    request.resolvedBy = req.user.userId;
    await request.save();

    // If approved, update the actual attendance record
    if (status === "Approved" && request.attendanceRecord) {
      const att = request.attendanceRecord;
      att.regularizationStatus = "Approved";
      
      // Assume "Present" for missing punch / late request if approved 
      // (This logic should be enhanced based on request.type, but simple for now)
      if (request.type === "Missing Punch" || request.type === "Late Arrival") {
        att.status = "Present";
        if (att.missingPunch) {
          att.missingPunch = false;
          // Set checkout time to 18:00 of that day if it was missing punch
          if (!att.checkOutTime && att.checkInTime) {
             const checkOut = new Date(att.checkInTime);
             checkOut.setHours(18, 0, 0, 0);
             att.checkOutTime = checkOut;
             att.totalWorkingHours = (checkOut - new Date(att.checkInTime)) / (1000 * 60 * 60);
          }
        }
      }
      
      att.auditLogs.push({
        action: `Regularization ${status}`,
        timestamp: new Date(),
        changedBy: req.user.userId,
        reason: request.reason
      });

      await att.save();
    } else if (status === "Rejected" && request.attendanceRecord) {
      const att = request.attendanceRecord;
      att.regularizationStatus = "Rejected";
      await att.save();
    }

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
    checkIn,
    checkOut,
    getTodayAttendance,
    getMonthlyAttendance,
    getAttendanceSummary,
    requestRegularization,
    getRegularizationRequests,
    getAllAttendanceByDate,
    getAllRegularizationRequests,
    updateRegularizationStatus
};
