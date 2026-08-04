const LeaveBalance = require("../models/LeaveBalance");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveSettings = require("../models/LeaveSettings");
const LeaveType = require("../models/LeaveType");
const Notification = require("../models/Notification");
const { notify, createMultipleNotifications } = require("../utils/notificationService");
const Employee = require("../models/Employee");
const User = require("../models/User");
const HolidaysStructure = require("../models/HolidaysStructure");
const Shift = require("../models/Shift");
const Attendance = require("../models/Attendance");
const { isHoliday } = require("../utils/holidayUtils");
const { createCompanyRecord, findCompanyRecords, updateCompanyRecord, deleteCompanyRecord, findOneCompanyRecord } = require("../utils/tenantUtils");
const { 
  sendLeaveAppliedEmail, 
  sendLeaveApprovedEmail, 
  sendLeaveRejectedEmail, 
  sendLeaveCancelledEmail 
} = require("../config/emailService");

// --- Helper Functions & Mappings ---

const LEGACY_MAPPING = {
  "Casual Leave": "casualLeave",
  "Sick Leave": "sickLeave",
  "Earned Leave": "earnedLeave",
  "Comp Off": "compOff",
  "Unpaid Leave": "unpaidLeave",
  "Work From Home": "wfh"
};
// Removed syncLeaveBalanceWithSettings

const normalizeAndReturnBalance = async (balance) => {
  const balanceObj = balance.toObject ? balance.toObject() : balance;
  const normalizedBalances = {};
  const activeTypes = await LeaveType.find({ isActive: true, company: balanceObj.company });

  // Only return leaves that are actually assigned (exist in the DB) AND are active in the balance
  for (const lt of activeTypes) {
    const name = lt.name;
    let balanceData = null;
    
    if (LEGACY_MAPPING[name]) {
      const field = LEGACY_MAPPING[name];
      if (balanceObj[field]) {
        balanceData = balanceObj[field];
      }
    } else {
      const dyn = balanceObj.dynamicBalances?.[name] || balance.dynamicBalances?.get?.(name);
      if (dyn) {
        balanceData = dyn;
      }
    }

    if (balanceData && balanceData.isActive !== false) {
       normalizedBalances[name] = balanceData;
    }
  }

  balanceObj.normalizedBalances = normalizedBalances;
  return balanceObj;
};

const initializeLeaveBalance = async (employeeId) => {
  const employee = await Employee.findById(employeeId); // Intentionally keeping findById here since we need it to discover the company
  if (!employee) throw new Error("Employee not found");
  const companyId = employee.company;

  let settings = await LeaveSettings.findOne({ company: companyId });
  if (!settings) {
    settings = await LeaveSettings.create({ company: companyId });
  }
  const activeTypes = await LeaveType.find({ isActive: true, company: companyId });
  const docData = {
    employee: employeeId,
    company: companyId,
    casualLeave: { total: settings.defaultCL, available: settings.defaultCL, used: 0 },
    sickLeave: { total: settings.defaultSL, available: settings.defaultSL, used: 0 },
    earnedLeave: { total: settings.defaultEL, available: settings.defaultEL, used: 0 },
    compOff: { total: settings.defaultCompOff, available: settings.defaultCompOff, used: 0 },
    dynamicBalances: {},
    transactions: [{ type: "Reset", amount: 0, leaveType: "Casual Leave", reason: "Initial Setup", date: new Date() }]
  };

  for (const lt of activeTypes) {
    const name = lt.name;
    const alloc = Number(lt.allocation || 0);
    
    // Determine initial available balance
    let initialAvailable = 0;
    if (lt.accrualType === 'Yearly' || lt.accrualType === 'One-Time') {
      initialAvailable = alloc;
    } else if (lt.accrualType === 'Monthly') {
      initialAvailable = 0; // Cron job handles monthly credit
    }

    if (LEGACY_MAPPING[name]) {
      const field = LEGACY_MAPPING[name];
      if (["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
        docData[field] = { total: alloc, available: initialAvailable, used: 0 };
      }
    } else {
      docData.dynamicBalances[name] = { total: alloc, available: initialAvailable, used: 0 };
    }
  }

  return await LeaveBalance.create(docData);
};

exports.initializeLeaveBalance = initializeLeaveBalance;

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
    const employeeId = req.params.employeeId || (await findOneCompanyRecord(Employee, { user: req.user.userId }, req.company))._id;
    let balance = await findOneCompanyRecord(LeaveBalance, { employee: employeeId }, req.company);
    if (!balance) {
      balance = await LeaveBalance.create({ employee: employeeId });
    }
    const syncedBalance = await normalizeAndReturnBalance(balance);
    res.status(200).json(syncedBalance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, isHalfDay, reason, isEmergency, attachmentUrl } = req.body;
    const employee = await findOneCompanyRecord(Employee, { user: req.user.userId }, req.company)
      .populate('user', 'joiningDate')
      .populate('department', 'name')
      .populate('designation', 'name');
    if (!employee) return res.status(404).json({ error: "Employee profile not found" });

    // Centralized single source of truth check
    let leaveConfig = await findOneCompanyRecord(LeaveType, { name: leaveType, isActive: true }, req.company);
    if (!leaveConfig) {
      if (["Casual Leave", "Sick Leave", "Earned Leave", "Comp Off", "Unpaid Leave", "Work From Home"].includes(leaveType)) {
        leaveConfig = { name: leaveType, category: ["Unpaid Leave", "Work From Home"].includes(leaveType) ? "Unpaid" : "Paid", allowHalfDay: true, countWeekends: false, countHolidays: false, allowNegativeBalance: false };
      } else {
        return res.status(400).json({ error: `Leave type "${leaveType}" is not an active leave definition.` });
      }
    }

    // Rule: Supporting Document Requirement
    if (leaveConfig.requireSupportingDocument && !attachmentUrl) {
      return res.status(400).json({ error: `A supporting document is required for ${leaveType}.` });
    }

    // Rule: Gender Restriction
    if (leaveConfig.genderRestriction && leaveConfig.genderRestriction !== 'All') {
      if (employee.gender !== leaveConfig.genderRestriction) {
        return res.status(400).json({ error: `This leave type is restricted to ${leaveConfig.genderRestriction} employees only.` });
      }
    }

    // Rule: Department Restriction
    if (leaveConfig.departments && leaveConfig.departments.length > 0 && !leaveConfig.departments.includes('All')) {
      const empDept = employee.department?.name;
      if (!empDept || !leaveConfig.departments.includes(empDept)) {
        return res.status(400).json({ error: `This leave type is not applicable to your department.` });
      }
    }

    // Rule: Designation Restriction
    if (leaveConfig.designations && leaveConfig.designations.length > 0 && !leaveConfig.designations.includes('All')) {
      const empDesig = employee.designation?.name;
      if (!empDesig || !leaveConfig.designations.includes(empDesig)) {
        return res.status(400).json({ error: `This leave type is not applicable to your designation.` });
      }
    }

    // Rule: Probation Eligibility
    if (leaveConfig.probationEligibility === false && employee.user?.joiningDate) {
      const settings = await findOneCompanyRecord(LeaveSettings, {}, req.company) || { probationPeriodDays: 180 };
      const PROBATION_DAYS = settings.probationPeriodDays || 180;
      const joiningDate = new Date(employee.user.joiningDate);
      const currentDate = new Date();
      const diffDays = Math.ceil((currentDate - joiningDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= PROBATION_DAYS) {
        return res.status(400).json({ error: `You are not eligible for this leave type during your probation period (${PROBATION_DAYS} days).` });
      }
    }

    // Rule: Half day restriction
    if (isHalfDay && leaveConfig.allowHalfDay === false) {
      return res.status(400).json({ error: `Half-day leaves are not allowed for ${leaveType}.` });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return res.status(400).json({ error: "End date cannot be before start date" });

    // Rule: Respect weekends and holidays counting configuration
    const dates = getDatesInRange(start, end);
    let totalDays;
    if (isHalfDay) {
      totalDays = 0.5;
    } else {
      let workingDayCount = 0;
      for (const d of dates) {
        if (!leaveConfig.countWeekends && d.getDay() === 0) continue;
        if (!leaveConfig.countHolidays) {
          const isHol = await isHoliday(d, req.company);
          if (isHol) continue;
        }
        workingDayCount++;
      }
      totalDays = workingDayCount;
    }

    if (totalDays <= 0 && !isHalfDay) {
      if (start.getTime() === end.getTime()) {
         return res.status(400).json({ error: "Cannot apply for leave on a company holiday or weekend." });
      }
      return res.status(400).json({ error: "Selected dates fall entirely on weekends/holidays. No leave days to deduct." });
    }

    // Rule: Max consecutive days
    if (leaveConfig.maxConsecutiveDays > 0 && totalDays > leaveConfig.maxConsecutiveDays) {
      return res.status(400).json({ error: `Maximum ${leaveConfig.maxConsecutiveDays} consecutive days allowed for ${leaveType}.` });
    }

    // Rule: Minimum notice period
    if (leaveConfig.minimumNoticePeriod > 0) {
      const diffDays = Math.ceil((new Date(start).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
      if (diffDays < leaveConfig.minimumNoticePeriod && !isEmergency) {
        return res.status(400).json({ error: `A minimum notice period of ${leaveConfig.minimumNoticePeriod} days is required for ${leaveType} (unless marked as Emergency).` });
      }
    }

    // Overlap check
    const overlapping = await findOneCompanyRecord(LeaveRequest, {
      employee: employee._id,
      status: { $in: ["Pending", "Approved"] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });
    if (overlapping) return res.status(400).json({ error: "You already have a leave request during this period" });

    // Validate and deduct balance
    let balance = await findOneCompanyRecord(LeaveBalance, { employee: employee._id }, req.company);
    if (!balance) balance = await initializeLeaveBalance(employee._id);

    const field = LEGACY_MAPPING[leaveType];
    let balObj = null;
    if (field && ["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
      balObj = balance[field];
    } else if (field && ["unpaidLeave", "wfh"].includes(field)) {
      // Unpaid or WFH legacy tracking
    } else {
      if (!balance.dynamicBalances) balance.dynamicBalances = new Map();
      balObj = balance.dynamicBalances.get(leaveType) || { total: leaveConfig.allocation || 0, available: leaveConfig.allocation || 0, used: 0 };
    }

    if (balObj && leaveConfig.category === 'Paid') {
      if (balObj.available < totalDays && !leaveConfig.allowNegativeBalance) {
        return res.status(400).json({ error: `Insufficient ${leaveType} balance. You need ${totalDays} day(s) but have ${balObj.available} available.` });
      }
      balObj.available -= totalDays;
      if (!field || !["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
        balance.dynamicBalances.set(leaveType, balObj);
      }
      await balance.save();
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

    if (employee.user) {
      await notify({
        recipient: employee.user,
        sender: req.user.userId,
        title: 'Leave Application Submitted',
        message: `Your ${leaveType} application from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} has been submitted.`,
        type: 'leave',
        module: 'leave_management',
        link: '/employee/leaves'
      }).catch(err => console.error(err));
    }

    const hrAdmins = await findCompanyRecords(User, { role: { $in: ["admin", "hr"] } }, req.company, null, null);
    const adminNotifs = hrAdmins.map(admin => ({
      recipient: admin._id,
      sender: req.user.userId,
      title: 'New Leave Request',
      message: `${employee.firstName} ${employee.lastName} applied for ${totalDays} day(s) of ${leaveType} (${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}).`,
      type: 'leave',
      module: 'leave_management',
      link: admin.role === 'admin' ? '/admin-dashboard?tab=leave-requests' : '/hr/leave-management'
    }));
    if (adminNotifs.length > 0) {
      createMultipleNotifications(adminNotifs).catch(err => console.error('Admin leave notification error:', err));
    }

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaveHistory = async (req, res) => {
  try {
    const employee = await findOneCompanyRecord(Employee, { user: req.user.userId }, req.company);
    if (!employee) return res.status(404).json({ error: "Employee profile not found" });
    const requests = await findCompanyRecords(LeaveRequest, { employee: employee._id }, req.company, null, { createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelLeaveRequest = async (req, res) => {
  try {
    const request = await findOneCompanyRecord(LeaveRequest, { _id: req.params.id }, req.company, "employee");
    if (!request) return res.status(404).json({ error: "Request not found" });
    
    const employee = await findOneCompanyRecord(Employee, { user: req.user.userId }, req.company);
    if (request.employee._id.toString() !== employee._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (request.status === "Cancelled" || request.status === "Rejected") {
      return res.status(400).json({ error: "Request already cancelled or rejected" });
    }

    // Refund balance
    const field = LEGACY_MAPPING[request.leaveType];
    const balance = await findOneCompanyRecord(LeaveBalance, { employee: employee._id }, req.company);
    if (balance) {
      let balObj = null;
      if (field && ["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
        balObj = balance[field];
      } else if (!field || !["unpaidLeave", "wfh"].includes(field)) {
        if (!balance.dynamicBalances) balance.dynamicBalances = new Map();
        balObj = balance.dynamicBalances.get(request.leaveType);
      }

      if (balObj) {
        if (request.status === "Pending") {
          balObj.available += request.totalDays;
        } else if (request.status === "Approved") {
          balObj.available += request.totalDays;
          balObj.used = Math.max(0, balObj.used - request.totalDays);
        }
        if (!field || !["casualLeave", "sickLeave", "earnedLeave", "compOff", "unpaidLeave", "wfh"].includes(field)) {
          balance.dynamicBalances.set(request.leaveType, balObj);
        }
      } else if (field === "unpaidLeave" && request.status === "Approved") {
        balance.unpaidLeave.used = Math.max(0, balance.unpaidLeave.used - request.totalDays);
      } else if (field === "wfh" && request.status === "Approved") {
        balance.wfh.used = Math.max(0, balance.wfh.used - request.totalDays);
      }
      await balance.save();
    }

    request.status = "Cancelled";
    await request.save();

    if (request.employee.email) {
      await sendLeaveCancelledEmail(request.employee.email, request.employee.firstName, request.leaveType, request.startDate, request.endDate).catch(e=>console.error(e));
    }

    if (request.employee.user) {
      await notify({
        recipient: request.employee.user,
        sender: req.user.userId,
        title: 'Leave Application Cancelled',
        message: `Your ${request.leaveType} application has been cancelled.`,
        type: 'leave',
        module: 'leave_management',
        link: '/employee/leaves'
      }).catch(err => console.error(err));
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
    
    const requests = await findCompanyRecords(LeaveRequest, filter, req.company)
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
    const request = await findOneCompanyRecord(LeaveRequest, { _id: req.params.id }, req.company, "employee");
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.status !== "Pending") {
      return res.status(400).json({ error: "Can only update pending requests" });
    }

    request.status = status;
    request.hrRemarks = remarks || "";
    if (reason) request.rejectionReason = reason;
    request.approvedBy = req.user.userId;
    request.approvedDate = new Date();

    const balance = await findOneCompanyRecord(LeaveBalance, { employee: request.employee._id }, req.company);
    const field = LEGACY_MAPPING[request.leaveType];
    
    if (status === "Approved" && balance) {
      let balObj = null;
      if (field && ["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
        balObj = balance[field];
      } else if (!field && balance.dynamicBalances) {
        balObj = balance.dynamicBalances.get(request.leaveType);
      }

      if (balObj) {
        balObj.used += request.totalDays;
        if (!field) balance.dynamicBalances.set(request.leaveType, balObj);
        await balance.save();
      } else if (field === "unpaidLeave") {
        balance.unpaidLeave.used += request.totalDays;
        await balance.save();
      } else if (field === "wfh") {
        balance.wfh.used += request.totalDays;
        await balance.save();
      } else {
        if (!balance.dynamicBalances) balance.dynamicBalances = new Map();
        const dyn = balance.dynamicBalances.get(request.leaveType) || { total: 0, available: 0, used: 0 };
        dyn.used += request.totalDays;
        balance.dynamicBalances.set(request.leaveType, dyn);
        await balance.save();
      }

      // INTEGRATION: Upsert Attendance records
      const dates = getDatesInRange(request.startDate, request.endDate);
      const attStatus = request.leaveType === "Work From Home" ? "WFH" : (request.isHalfDay ? "Half Day" : "On Leave");
      
      for (const d of dates) {
        await upsertCompanyRecord(Attendance, { employee: request.employee._id, date: d }, req.company, { 
            status: attStatus, 
            notes: `Auto-generated via Approved ${request.leaveType}`,
            checkInTime: null,
            checkOutTime: null,
            missingPunch: false
          });
      }

      if (request.employee.email) {
        await sendLeaveApprovedEmail(request.employee.email, request.employee.firstName, request.leaveType, request.startDate, request.endDate, `${req.user.firstName}`, remarks).catch(e=>console.error(e));
      }

      if (request.employee.user) {
        await notify({
          recipient: request.employee.user,
          sender: req.user.userId,
          title: 'Leave Application Approved',
          message: `Your ${request.leaveType} application from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()} has been approved.`,
          type: 'leave',
          module: 'leave_management',
          link: '/employee/leaves'
        }).catch(err => console.error(err));
      }

    } else if (status === "Rejected" && balance) {
      let balObj = null;
      if (field && ["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
        balObj = balance[field];
      } else if (!field && balance.dynamicBalances) {
        balObj = balance.dynamicBalances.get(request.leaveType);
      }

      if (balObj) {
        balObj.available += request.totalDays;
        if (!field) balance.dynamicBalances.set(request.leaveType, balObj);
        await balance.save();
      }

      if (request.employee.email) {
        await sendLeaveRejectedEmail(request.employee.email, request.employee.firstName, request.leaveType, request.startDate, request.endDate, `${req.user.firstName}`, reason, remarks).catch(e=>console.error(e));
      }

      if (request.employee.user) {
        await notify({
          recipient: request.employee.user,
          sender: req.user.userId,
          title: 'Leave Application Rejected',
          message: `Your ${request.leaveType} application has been rejected. Reason: ${reason || remarks || 'N/A'}`,
          type: 'leave',
          module: 'leave_management',
          link: '/employee/leaves'
        }).catch(err => console.error(err));
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

    let balance = await findOneCompanyRecord(LeaveBalance, { employee: employeeId }, req.company);
    if (!balance) balance = await initializeLeaveBalance(employeeId);

    const field = LEGACY_MAPPING[leaveType];
    if (field && ["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
      balance[field].used += totalDays;
      balance[field].available -= totalDays;
      await balance.save();
    } else if (field === "unpaidLeave") {
      balance.unpaidLeave.used += totalDays;
      await balance.save();
    } else if (field === "wfh") {
      balance.wfh.used += totalDays;
      await balance.save();
    } else {
      if (!balance.dynamicBalances) balance.dynamicBalances = new Map();
      const lt = await findOneCompanyRecord(LeaveType, { name: leaveType }, req.company);
      const dyn = balance.dynamicBalances.get(leaveType) || { total: lt?.allocation || 0, available: lt?.allocation || 0, used: 0 };
      dyn.used += totalDays;
      if (lt?.category === 'Paid') dyn.available -= totalDays;
      balance.dynamicBalances.set(leaveType, dyn);
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

    const attStatus = leaveType === "Work From Home" ? "WFH" : (isHalfDay ? "Half Day" : "On Leave");
    for (const d of dates) {
      await upsertCompanyRecord(Attendance, { employee: employeeId, date: d }, req.company, { 
          status: attStatus, 
          notes: `Auto-generated via HR Manual Entry: ${leaveType}`,
          checkInTime: null,
          checkOutTime: null,
          missingPunch: false
      });
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adjustLeaveBalance = async (req, res) => {
  try {
    const { employeeId, leaveType, amount, action, reason } = req.body;
    let balance = await findOneCompanyRecord(LeaveBalance, { employee: employeeId }, req.company);
    if (!balance) balance = await initializeLeaveBalance(employeeId);

    const lt = await findOneCompanyRecord(LeaveType, { name: leaveType }, req.company);
    const field = LEGACY_MAPPING[leaveType];
    
    if (!lt && !field) {
      return res.status(400).json({ error: `Invalid leave type "${leaveType}" for adjustment` });
    }

    const val = parseFloat(amount);
    let targetObj;

    if (field && ["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
      targetObj = balance[field];
    } else {
      if (!balance.dynamicBalances) balance.dynamicBalances = new Map();
      if (!balance.dynamicBalances.has(leaveType)) {
        balance.dynamicBalances.set(leaveType, { total: lt ? lt.allocation : 0, available: lt ? lt.allocation : 0, used: 0 });
      }
      targetObj = balance.dynamicBalances.get(leaveType);
    }

    if (action === "Add") {
      targetObj.total += val;
      targetObj.available += val;
      balance.transactions.push({ type: "Credit", amount: val, leaveType, reason, addedBy: req.user.userId });
    } else if (action === "Deduct") {
      targetObj.total -= val;
      targetObj.available -= val;
      balance.transactions.push({ type: "Debit", amount: val, leaveType, reason, addedBy: req.user.userId });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (!field || !["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
      balance.dynamicBalances.set(leaveType, targetObj);
    }

    await balance.save();
    const syncedBalance = await syncLeaveBalanceWithSettings(balance);
    res.status(200).json(syncedBalance);
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
exports.assignLeaveToEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { leaveType, remarks } = req.body;

    const lt = await findOneCompanyRecord(LeaveType, { name: leaveType }, req.company);
    if (!lt) return res.status(404).json({ error: "Leave type not found" });

    let balance = await findOneCompanyRecord(LeaveBalance, { employee: employeeId }, req.company);
    if (!balance) {
      balance = new LeaveBalance({ employee: employeeId });
    }

    const isLegacy = !!LEGACY_MAPPING[leaveType];
    const balanceKey = LEGACY_MAPPING[leaveType];
    
    let balanceData = isLegacy ? balance[balanceKey] : balance.dynamicBalances?.get(leaveType);

    if (!balanceData) {
       // First time assigning
       let initialAvailable = 0;
       if (lt.initializationMode === 'From Today') initialAvailable = 0;
       else if (lt.initializationMode === 'Full Allocation') initialAvailable = lt.allocation || 0;
       else if (lt.initializationMode === 'Pro-rated') {
           const today = new Date();
           const month = today.getMonth();
           const day = today.getDate();
           const monthsPassed = month + (day > 15 ? 1 : 0);
           initialAvailable = parseFloat(((monthsPassed / 12) * (lt.allocation || 0)).toFixed(2));
       }

       const newData = {
         total: lt.allocation || 0,
         available: initialAvailable,
         used: 0,
         isActive: true,
         assignedBy: req.user.userId,
         assignedDate: new Date(),
         remarks: remarks || "Manually assigned by Admin"
       };

       if (isLegacy) balance[balanceKey] = newData;
       else {
         if (!balance.dynamicBalances) balance.dynamicBalances = new Map();
         balance.dynamicBalances.set(leaveType, newData);
       }
    } else {
       // Reactivating
       balanceData.isActive = true;
       balanceData.assignedBy = req.user.userId;
       balanceData.assignedDate = new Date();
       balanceData.remarks = remarks || "Manually reactivated by Admin";
    }

    await balance.save();
    res.json({ message: `${leaveType} assigned successfully`, balance: await normalizeAndReturnBalance(balance) });
  } catch (error) {
    console.error("Error assigning leave to employee:", error);
    res.status(500).json({ error: "Failed to assign leave" });
  }
};

exports.removeLeaveFromEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { leaveType, remarks } = req.body;

    let balance = await findOneCompanyRecord(LeaveBalance, { employee: employeeId }, req.company);
    if (!balance) return res.status(404).json({ error: "Balance not found" });

    const isLegacy = !!LEGACY_MAPPING[leaveType];
    const balanceKey = LEGACY_MAPPING[leaveType];
    
    let balanceData = isLegacy ? balance[balanceKey] : balance.dynamicBalances?.get(leaveType);

    if (balanceData) {
       balanceData.isActive = false;
       balanceData.deactivatedBy = req.user.userId;
       balanceData.deactivatedDate = new Date();
       balanceData.remarks = remarks || "Manually removed by Admin";
       await balance.save();
    }

    res.json({ message: `${leaveType} removed successfully`, balance: await normalizeAndReturnBalance(balance) });
  } catch (error) {
    console.error("Error removing leave from employee:", error);
    res.status(500).json({ error: "Failed to remove leave" });
  }
};
