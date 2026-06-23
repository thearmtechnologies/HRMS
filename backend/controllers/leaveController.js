const LeaveBalance = require("../models/LeaveBalance");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveSettings = require("../models/LeaveSettings");
const Notification = require("../models/Notification");
const Employee = require("../models/Employee");
const HolidaysStructure = require("../models/HolidaysStructure");
const Shift = require("../models/Shift");
const Attendance = require("../models/Attendance");
const { 
  sendLeaveAppliedEmail, 
  sendLeaveApprovedEmail, 
  sendLeaveRejectedEmail, 
  sendLeaveCancelledEmail 
} = require("../config/emailService");

// --- Helper Functions ---

const initializeLeaveBalance = async (employeeId) => {
  let settings = await LeaveSettings.findOne();
  if (!settings) {
    settings = await LeaveSettings.create({});
  }
  return await LeaveBalance.create({
    employee: employeeId,
    casualLeave: { total: settings.defaultCL, available: settings.defaultCL, used: 0 },
    sickLeave: { total: settings.defaultSL, available: settings.defaultSL, used: 0 },
    earnedLeave: { total: settings.defaultEL, available: settings.defaultEL, used: 0 },
    compOff: { total: settings.defaultCompOff, available: settings.defaultCompOff, used: 0 },
    transactions: [{ type: "Reset", amount: 0, leaveType: "Casual Leave", reason: "Initial Setup", date: new Date() }]
  });
};

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0,0,0,0);
  const end = new Date(endDate);
  end.setHours(0,0,0,0);
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

// --- Controllers ---

exports.getEmployeeBalances = async (req, res) => {
  try {
    const employeeId = req.params.employeeId || (await Employee.findOne({ user: req.user.userId }))._id;
    let balance = await LeaveBalance.findOne({ employee: employeeId });
    if (!balance) {
      balance = await initializeLeaveBalance(employeeId);
    }
    res.status(200).json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, isHalfDay, reason, isEmergency, attachmentUrl } = req.body;
    const employee = await Employee.findOne({ user: req.user.userId });
    if (!employee) return res.status(404).json({ error: "Employee profile not found" });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return res.status(400).json({ error: "End date cannot be before start date" });

    // Calculate Working Days
    const dates = getDatesInRange(start, end);
    let totalDays = isHalfDay ? 0.5 : dates.length;

    // Simple overlapping check
    const overlapping = await LeaveRequest.findOne({
      employee: employee._id,
      status: { $in: ["Pending", "Approved"] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });
    if (overlapping) return res.status(400).json({ error: "You already have a leave request during this period" });

    // Validate Balance
    let balance = await LeaveBalance.findOne({ employee: employee._id });
    if (!balance) balance = await initializeLeaveBalance(employee._id);

    const mapping = {
      "Casual Leave": "casualLeave",
      "Sick Leave": "sickLeave",
      "Earned Leave": "earnedLeave",
      "Comp Off": "compOff"
    };

    if (mapping[leaveType]) {
      if (balance[mapping[leaveType]].available < totalDays) {
        return res.status(400).json({ error: `Insufficient ${leaveType} balance. You need ${totalDays} but have ${balance[mapping[leaveType]].available}.` });
      }
      // Deduct balance temporarily (lock it)
      balance[mapping[leaveType]].available -= totalDays;
      await balance.save();
    } else if (leaveType === "Unpaid Leave") {
      // Nothing to lock
    } else if (leaveType === "Work From Home") {
      // Nothing to lock
    }

    const newRequest = await LeaveRequest.create({
      employee: employee._id,
      reportingManager: employee.reportingManager,
      leaveType, startDate, endDate, totalDays, isHalfDay, reason, isEmergency, attachmentUrl,
      createdBy: req.user.userId,
      source: "Employee Request"
    });

    if (employee.email) {
      await sendLeaveAppliedEmail(employee.email, employee.firstName, leaveType, startDate, endDate, totalDays).catch(err => console.error(err));
    }

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaveHistory = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.userId });
    if (!employee) return res.status(404).json({ error: "Employee profile not found" });
    const requests = await LeaveRequest.find({ employee: employee._id }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelLeaveRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id).populate("employee");
    if (!request) return res.status(404).json({ error: "Request not found" });
    
    const employee = await Employee.findOne({ user: req.user.userId });
    if (request.employee._id.toString() !== employee._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (request.status === "Cancelled" || request.status === "Rejected") {
      return res.status(400).json({ error: "Request already cancelled or rejected" });
    }

    // Refund balance if it was locked or approved
    const mapping = { "Casual Leave": "casualLeave", "Sick Leave": "sickLeave", "Earned Leave": "earnedLeave", "Comp Off": "compOff" };
    if (mapping[request.leaveType]) {
      const balance = await LeaveBalance.findOne({ employee: employee._id });
      if (balance) {
        if (request.status === "Pending") {
          balance[mapping[request.leaveType]].available += request.totalDays;
        } else if (request.status === "Approved") {
          balance[mapping[request.leaveType]].available += request.totalDays;
          balance[mapping[request.leaveType]].used -= request.totalDays;
        }
        await balance.save();
      }
    }

    request.status = "Cancelled";
    await request.save();

    if (request.employee.email) {
      await sendLeaveCancelledEmail(request.employee.email, request.employee.firstName, request.leaveType, request.startDate, request.endDate).catch(e=>console.error(e));
    }

    res.status(200).json({ message: "Leave cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HR / ADMIN ROUTES

exports.getAllLeaveRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== "All") filter.status = req.query.status;
    if (req.query.leaveType && req.query.leaveType !== "All") filter.leaveType = req.query.leaveType;
    
    // Add logic to filter by department or employee search here if needed
    
    const requests = await LeaveRequest.find(filter)
      .populate({ path: "employee", populate: { path: "department" } })
      .populate("approvedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, remarks, reason } = req.body;
    const request = await LeaveRequest.findById(req.params.id).populate("employee");
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.status !== "Pending") {
      return res.status(400).json({ error: "Can only update pending requests" });
    }

    request.status = status;
    request.hrRemarks = remarks || "";
    if (reason) request.rejectionReason = reason;
    request.approvedBy = req.user.userId;
    request.approvedDate = new Date();

    const balance = await LeaveBalance.findOne({ employee: request.employee._id });
    const mapping = { "Casual Leave": "casualLeave", "Sick Leave": "sickLeave", "Earned Leave": "earnedLeave", "Comp Off": "compOff" };
    
    if (status === "Approved") {
      if (mapping[request.leaveType] && balance) {
        // available was deducted at apply time. now move to used.
        balance[mapping[request.leaveType]].used += request.totalDays;
        await balance.save();
      } else if (request.leaveType === "Unpaid Leave" && balance) {
        balance.unpaidLeave.used += request.totalDays;
        await balance.save();
      } else if (request.leaveType === "Work From Home" && balance) {
        balance.wfh.used += request.totalDays;
        await balance.save();
      }

      // INTEGRATION: Upsert Attendance records
      const dates = getDatesInRange(request.startDate, request.endDate);
      const attStatus = request.leaveType === "Work From Home" ? "WFH" : (request.isHalfDay ? "Half Day" : "On Leave");
      
      for (const d of dates) {
        await Attendance.findOneAndUpdate(
          { employee: request.employee._id, date: d },
          { 
            status: attStatus, 
            notes: `Auto-generated via Approved ${request.leaveType}`,
            checkInTime: null,
            checkOutTime: null,
            missingPunch: false
          },
          { upsert: true, new: true }
        );
      }

      if (request.employee.email) {
        await sendLeaveApprovedEmail(request.employee.email, request.employee.firstName, request.leaveType, request.startDate, request.endDate, `${req.user.firstName}`, remarks).catch(e=>console.error(e));
      }

    } else if (status === "Rejected") {
      // Refund available
      if (mapping[request.leaveType] && balance) {
        balance[mapping[request.leaveType]].available += request.totalDays;
        await balance.save();
      }
      if (request.employee.email) {
        await sendLeaveRejectedEmail(request.employee.email, request.employee.firstName, request.leaveType, request.startDate, request.endDate, `${req.user.firstName}`, reason, remarks).catch(e=>console.error(e));
      }
    }

    await request.save();
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manualLeaveEntry = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, isHalfDay, reason, source } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = getDatesInRange(start, end);
    let totalDays = isHalfDay ? 0.5 : dates.length;

    let balance = await LeaveBalance.findOne({ employee: employeeId });
    if (!balance) balance = await initializeLeaveBalance(employeeId);

    const mapping = { "Casual Leave": "casualLeave", "Sick Leave": "sickLeave", "Earned Leave": "earnedLeave", "Comp Off": "compOff" };
    if (mapping[leaveType]) {
      balance[mapping[leaveType]].used += totalDays;
      balance[mapping[leaveType]].available -= totalDays;
      await balance.save();
    } else if (leaveType === "Unpaid Leave") {
      balance.unpaidLeave.used += totalDays;
      await balance.save();
    } else if (leaveType === "Work From Home") {
      balance.wfh.used += totalDays;
      await balance.save();
    }

    const request = await LeaveRequest.create({
      employee: employeeId,
      leaveType, startDate, endDate, totalDays, isHalfDay, reason, source,
      status: "Approved",
      approvedBy: req.user.userId,
      approvedDate: new Date(),
      createdBy: req.user.userId,
      hrRemarks: "Manually entered by HR"
    });

    // INTEGRATION: Upsert Attendance records
    const attStatus = leaveType === "Work From Home" ? "WFH" : (isHalfDay ? "Half Day" : "On Leave");
    for (const d of dates) {
      await Attendance.findOneAndUpdate(
        { employee: employeeId, date: d },
        { 
          status: attStatus, 
          notes: `Auto-generated via HR Manual Entry: ${leaveType}`,
          checkInTime: null,
          checkOutTime: null,
          missingPunch: false
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adjustLeaveBalance = async (req, res) => {
  try {
    const { employeeId, leaveType, amount, action, reason } = req.body;
    let balance = await LeaveBalance.findOne({ employee: employeeId });
    if (!balance) balance = await initializeLeaveBalance(employeeId);

    const mapping = { "Casual Leave": "casualLeave", "Sick Leave": "sickLeave", "Earned Leave": "earnedLeave", "Comp Off": "compOff" };
    const field = mapping[leaveType];
    
    if (!field) return res.status(400).json({ error: "Invalid leave type for adjustment" });

    const val = parseFloat(amount);
    if (action === "Add") {
      balance[field].total += val;
      balance[field].available += val;
      balance.transactions.push({ type: "Credit", amount: val, leaveType, reason, addedBy: req.user.userId });
    } else if (action === "Deduct") {
      balance[field].total -= val;
      balance[field].available -= val;
      balance.transactions.push({ type: "Debit", amount: val, leaveType, reason, addedBy: req.user.userId });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    await balance.save();
    res.status(200).json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaveDashboardStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const [totalRequests, pending, approved, rejected, onLeaveToday] = await Promise.all([
      LeaveRequest.countDocuments(),
      LeaveRequest.countDocuments({ status: "Pending" }),
      LeaveRequest.countDocuments({ status: "Approved" }),
      LeaveRequest.countDocuments({ status: "Rejected" }),
      LeaveRequest.countDocuments({ 
        status: "Approved", 
        startDate: { $lte: endOfDay }, 
        endDate: { $gte: startOfDay }
      })
    ]);

    res.status(200).json({ totalRequests, pending, approved, rejected, onLeaveToday });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
