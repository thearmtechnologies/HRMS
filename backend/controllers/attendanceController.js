const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const User = require("../models/User");
const RegularizationRequest = require("../models/RegularizationRequest");
const { notify, createMultipleNotifications } = require("../utils/notificationService");
const { isHoliday, getHolidayInfo } = require("../utils/holidayUtils");
const socketService = require("../utils/socketService");

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
        
        // Holiday guard — block check-in on company holidays
        const targetDate = date ? new Date(date) : new Date();
        const holidayInfo = await getHolidayInfo(targetDate);
        if (holidayInfo) {
            return res.status(400).json({ message: `Today is a company holiday: ${holidayInfo.name}. Check-in is not allowed.` });
        }

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

        socketService.emitToAll("attendance_updated", { action: "checkin", attendance });
        res.status(200).json({ message: "Checked in successfully", attendance });
    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const checkOut = async (req, res) => {
    try {
        const { date, checkOutLocation, notes } = req.body;
        
        // Holiday guard — block check-out on company holidays (safety, though check-in is already blocked)
        const targetDate = date ? new Date(date) : new Date();
        const holidayCheckout = await getHolidayInfo(targetDate);
        if (holidayCheckout) {
            return res.status(400).json({ message: `Today is a company holiday: ${holidayCheckout.name}. Clock actions are not allowed.` });
        }

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

        socketService.emitToAll("attendance_updated", { action: "checkout", attendance });
        res.status(200).json({ message: "Checked out successfully", attendance });
    } catch (error) {
        console.error("Check-out error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const resumeWork = async (req, res) => {
    try {
        const { date, reason } = req.body;
        
        const employee = await Employee.findOne({ user: req.user.userId });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const { start } = getDayRange(date);

        const attendance = await Attendance.findOne({ employee: employee._id, date: start });
        
        if (!attendance) {
            return res.status(404).json({ message: "No check-in record found for today" });
        }
        if (!attendance.checkOutTime) {
            return res.status(400).json({ message: "Not checked out yet" });
        }

        // Prevent multiple resumes
        if (attendance.resumeHistory && attendance.resumeHistory.length > 0) {
            return res.status(400).json({ message: "You have already resumed work once today. Further resumes are not allowed." });
        }

        const now = new Date();
        const diffInMs = now - attendance.checkOutTime;
        const diffInMins = diffInMs / (1000 * 60);

        if (diffInMins > 5) {
            return res.status(400).json({ message: "Grace period expired. Please submit a regularization request." });
        }

        // Push to resume history
        attendance.resumeHistory.push({
            clockOutTime: attendance.checkOutTime,
            resumeTime: now,
            reason: reason || "Accidental clock out",
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null
        });

        // Reopen session without resetting calculations
        attendance.checkOutTime = null;

        await attendance.save();

        socketService.emitToAll("attendance_updated", { action: "resume", attendance });
        res.status(200).json({ message: "Work session resumed successfully", attendance });
    } catch (error) {
        console.error("Resume work error:", error);
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

        if (type && (type === "Late Arrival" || type.toLowerCase().includes("late"))) {
            const attDateStr = new Date(attendance.date).toISOString().split('T')[0];
            const todayStr = new Date().toISOString().split('T')[0];
            if (attDateStr < todayStr) {
                return res.status(400).json({
                    success: false,
                    message: "Regularization for late attendance is not allowed for past dates. Late attendance must be regularized on the same day."
                });
            }
        }

        const reqRecord = new RegularizationRequest({
            employee: employee._id,
            attendanceRecord: attendance._id,
            date: attendance.date,
            reason,
            type,
            requestedChanges,
            status: "Pending"
        });
        await reqRecord.save();

        attendance.regularizationStatus = "Pending";
        await attendance.save();

        if (employee.user) {
          await notify({
            recipient: employee.user,
            sender: req.user.userId,
            title: 'Attendance Regularization Submitted',
            message: `Your regularization request for attendance on ${new Date(attendance.date).toLocaleDateString()} has been submitted.`,
            type: 'attendance',
            module: 'attendance',
            link: '/employee/attendance'
          }).catch(err => console.error(err));
        }

        const hrAdmins = await User.find({ role: { $in: ["admin", "hr"] } }).select('_id role').lean();
        const hrNotifs = hrAdmins.map(admin => ({
          recipient: admin._id,
          sender: req.user.userId,
          title: 'New Regularization Request',
          message: `${employee.firstName} ${employee.lastName} submitted a ${type || "regularization"} request for ${new Date(attendance.date).toLocaleDateString()}.`,
          type: 'attendance',
          module: 'attendance',
          link: admin.role === 'admin' ? '/admin-dashboard?tab=attendance' : '/hr/attendance'
        }));
        if (hrNotifs.length > 0) {
          createMultipleNotifications(hrNotifs).catch(err => console.error(err));
        }

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
    }).populate({ path: "employee", populate: { path: "department" } });

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
    const { status, remarks } = req.body; // "Approved" or "Rejected"

    const request = await RegularizationRequest.findById(id).populate("attendanceRecord");
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    request.resolvedAt = new Date();
    request.resolvedBy = req.user.userId;
    request.approver = req.user.userId;
    if (remarks) request.approverRemarks = remarks;
    await request.save();

    // If approved, update the actual attendance record
    if (status === "Approved" && request.attendanceRecord) {
      const att = request.attendanceRecord;
      att.regularizationStatus = "Approved";
      att.status = "Present";
      att.missingPunch = false;

      if (!att.checkInTime) {
        const checkIn = new Date(att.date);
        checkIn.setHours(9, 0, 0, 0);
        att.checkInTime = checkIn;
      }
      if (!att.checkOutTime) {
        const checkOut = new Date(att.checkInTime);
        checkOut.setHours(18, 0, 0, 0);
        if (checkOut <= new Date(att.checkInTime)) {
          checkOut.setTime(new Date(att.checkInTime).getTime() + 8 * 3600 * 1000);
        }
        att.checkOutTime = checkOut;
      }
      if (att.checkInTime && att.checkOutTime) {
        att.totalWorkingHours = Math.max(0, (new Date(att.checkOutTime) - new Date(att.checkInTime)) / (1000 * 60 * 60));
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

    const empId = request.employee?._id || request.employee;
    const emp = await Employee.findById(empId);
    if (emp && emp.user) {
      await notify({
        recipient: emp.user,
        sender: req.user.userId,
        title: `Regularization ${status}`,
        message: `Your attendance regularization request for ${new Date(request.date).toLocaleDateString()} has been ${status.toLowerCase()}. ${remarks ? 'Remarks: ' + remarks : ''}`,
        type: 'attendance',
        module: 'attendance',
        link: '/employee/attendance'
      }).catch(err => console.error("Regularization notify error:", err));
    }

    socketService.emitToAll("attendance_updated", { action: "regularize", request });
    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const manualAttendanceEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInTime, checkOutTime, status, notes, reason } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ message: "Record not found" });

    const originalValue = {
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      status: attendance.status,
      notes: attendance.notes
    };

    if (checkInTime !== undefined) attendance.checkInTime = checkInTime ? new Date(checkInTime) : null;
    if (checkOutTime !== undefined) attendance.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;
    if (status !== undefined) attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;

    if (attendance.checkInTime && attendance.checkOutTime) {
      const diffInMs = attendance.checkOutTime - attendance.checkInTime;
      const totalHours = diffInMs / (1000 * 60 * 60);
      attendance.totalWorkingHours = parseFloat(totalHours.toFixed(2));
      attendance.overtimeHours = totalHours > 9 ? parseFloat((totalHours - 9).toFixed(2)) : 0;
    } else {
      attendance.totalWorkingHours = 0;
      attendance.overtimeHours = 0;
    }

    attendance.auditLogs.push({
      action: "Manual Correction",
      originalValue,
      newValue: {
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.status,
        notes: attendance.notes
      },
      changedBy: req.user.userId,
      reason: reason || "HR Manual Correction"
    });

    await attendance.save();

    const emp = await Employee.findById(attendance.employee);
    if (emp && emp.user && emp.user.toString() !== req.user.userId) {
      await notify({
        recipient: emp.user,
        sender: req.user.userId,
        title: "Attendance Updated by HR/Admin",
        message: `Your attendance record for ${new Date(attendance.date).toLocaleDateString()} was updated to status "${attendance.status}".`,
        type: "attendance",
        module: "attendance",
        link: "/employee/attendance"
      }).catch(err => console.error("Attendance edit notify error:", err));
    }

    socketService.emitToAll("attendance_updated", { action: "edit", attendance });
    res.json({ message: "Record updated successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const manualAttendanceEntry = async (req, res) => {
  try {
    const { employeeId, date, checkInTime, checkOutTime, status, notes, reason } = req.body;
    
    const { start } = getDayRange(date);
    const existing = await Attendance.findOne({ employee: employeeId, date: start });
    if (existing) return res.status(400).json({ message: "Record already exists for this date. Please edit it instead." });

    const attendance = new Attendance({
      employee: employeeId,
      date: start,
      checkInTime: checkInTime ? new Date(checkInTime) : null,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
      status: status || "Present",
      notes: notes || ""
    });

    if (attendance.checkInTime && attendance.checkOutTime) {
      const diffInMs = attendance.checkOutTime - attendance.checkInTime;
      const totalHours = diffInMs / (1000 * 60 * 60);
      attendance.totalWorkingHours = parseFloat(totalHours.toFixed(2));
      attendance.overtimeHours = totalHours > 9 ? parseFloat((totalHours - 9).toFixed(2)) : 0;
    }

    attendance.auditLogs.push({
      action: "Manual Entry",
      changedBy: req.user.userId,
      reason: reason || "HR Manual Entry",
      newValue: { checkInTime: attendance.checkInTime, checkOutTime: attendance.checkOutTime, status: attendance.status }
    });

    await attendance.save();
    socketService.emitToAll("attendance_updated", { action: "entry", attendance });
    res.json({ message: "Record created successfully", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ message: "startDate and endDate are required" });

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).populate({ path: "employee", populate: { path: "department" } });

    res.json(records);
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
    updateRegularizationStatus,
    manualAttendanceEdit,
    manualAttendanceEntry,
    getAttendanceReport,
    resumeWork
};
