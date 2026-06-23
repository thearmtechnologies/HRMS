const SalaryFixed = require('../models/SalaryFixed');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const Employee = require('../models/Employee');
const inrWords = require("inr-words");
const { sendPaySlip } = require('../config/emailService');
const TempChanges = require('../models/TempChanges');
const Payroll = require('../models/Payroll');
const PayrollAuditLog = require('../models/PayrollAuditLog');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const HolidayConfig = require('../models/HolidaysStructure');
const archiver = require("archiver");

// ============================================================
// UTILITY HELPERS
// ============================================================

const getMonthName = (monthNumber) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[monthNumber - 1] || "Invalid Month";
};

const sanitizeFilename = (name) => {
  return name.replace(/[^a-zA-Z0-9-_\.]/g, "_");
};

// Valid status transitions
const VALID_TRANSITIONS = {
  Draft: ["Generated"],
  Generated: ["Approved", "Draft"],
  Approved: ["Paid"],
  Paid: [],
};

// Create audit log entry
const createAuditLog = async (action, { payroll, employee, performedBy, oldValue, newValue, description }) => {
  try {
    await PayrollAuditLog.create({
      action,
      payroll: payroll || null,
      employee: employee || null,
      performedBy,
      oldValue: oldValue || null,
      newValue: newValue || null,
      description: description || "",
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
};

// ============================================================
// FIXED SALARY (SALARY STRUCTURE) MANAGEMENT
// ============================================================

const createFixedSalary = async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Deactivate any existing active salary for this employee
    await SalaryFixed.updateMany(
      { employeeId, isActive: true },
      { $set: { isActive: false } }
    );

    const salaryDetails = new SalaryFixed({
      employeeId,
      ...req.body,
      isActive: true,
      effectiveDate: req.body.effectiveDate || new Date(),
    });

    await salaryDetails.save();

    // Audit log
    if (req.user) {
      await createAuditLog("SALARY_STRUCTURE_CREATED", {
        employee: employeeId,
        performedBy: req.user._id || req.user.id,
        newValue: salaryDetails.toObject(),
        description: `Salary structure created for employee`,
      });
    }

    res.status(201).json({ message: 'Salary created', salaryDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating salary record' });
  }
};

const updateFixedSalaryByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get the current active salary for audit log
    const currentSalary = await SalaryFixed.findOne({ employeeId, isActive: true });

    if (!currentSalary) {
      return res.status(404).json({ message: 'Salary record not found for employee' });
    }

    const oldValues = currentSalary.toObject();

    // Archive the old salary structure
    currentSalary.isActive = false;
    await currentSalary.save();

    // Create a new active salary structure
    const newSalaryData = {
      employeeId,
      ...req.body,
      isActive: true,
      effectiveDate: req.body.effectiveDate || new Date(),
    };
    delete newSalaryData._id;

    const newSalary = new SalaryFixed(newSalaryData);
    await newSalary.save();

    // Audit log
    if (req.user) {
      await createAuditLog("SALARY_STRUCTURE_UPDATED", {
        employee: employeeId,
        performedBy: req.user._id || req.user.id,
        oldValue: oldValues,
        newValue: newSalary.toObject(),
        description: `Salary structure updated for employee`,
      });
    }

    res.status(200).json({ message: 'Salary updated successfully', salaryDetails: newSalary });
  } catch (err) {
    console.error('Error updating salary:', err);
    res.status(500).json({ message: 'Server error updating salary', error: err.message });
  }
};

const getFixedSalary = async (req, res) => {
  try {
    const fixedSalary = await SalaryFixed.find({ isActive: true }).populate('employeeId', [
      'employeeId',
      'employeeName',
      'fullName',
      'firstName',
      'lastName',
      'designation',
      'department',
      'site',
      'email'
    ]);

    if (!fixedSalary || fixedSalary.length === 0) {
      return res.status(404).json({ message: "No fixed salary records found" });
    }

    res.status(200).json(fixedSalary);
  } catch (err) {
    console.error("❌ Error fetching fixed salary:", err);
    res.status(500).json({ message: "Error fetching fixed salary", error: err.message });
  }
};

const getFixedSalaryByEmployee = async (req, res) => {
  try {
    const fixedSalary = await SalaryFixed.findOne({
      employeeId: req.params.employeeId,
      isActive: true
    }).populate('employeeId', 'employeeName fullName firstName lastName employeeId designation');

    if (!fixedSalary) {
      return res.status(404).json({ message: 'Fixed salary not found for this employee' });
    }

    res.status(200).json(fixedSalary);
  } catch (err) {
    console.error('❌ Error fetching fixed salary by employeeId:', err);
    res.status(500).json({ message: 'Error fetching fixed salary', error: err.message });
  }
};

// Get salary history for an employee
const getSalaryHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const history = await SalaryFixed.find({ employeeId })
      .sort({ effectiveDate: -1 })
      .populate('employeeId', 'employeeName fullName firstName lastName employeeId designation');

    res.status(200).json(history);
  } catch (err) {
    console.error('Error fetching salary history:', err);
    res.status(500).json({ message: 'Error fetching salary history', error: err.message });
  }
};

// ============================================================
// PAYROLL GENERATION
// ============================================================

const generatePayroll = async (req, res) => {
  try {
    const { month, year, scope, employeeId, departmentId } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    // Determine which employees to process
    let employeeQuery = { status: "Active" };
    if (scope === "single" && employeeId) {
      employeeQuery._id = employeeId;
    } else if (scope === "department" && departmentId) {
      employeeQuery.department = departmentId;
    }
    // scope === "all" uses default query (all active employees)

    const employees = await Employee.find(employeeQuery)
      .populate("department", "departmentName")
      .populate("shift");

    if (!employees.length) {
      return res.status(404).json({ message: "No active employees found" });
    }

    // Get holidays for this month/year
    const holidayConfig = await HolidayConfig.findOne({ year: Number(year) });
    const monthName = getMonthName(Number(month));
    const monthHolidays = holidayConfig?.holidays?.find(h => h.month === monthName);
    const holidayCount = monthHolidays?.dates?.length || 0;

    // Calculate total days and sundays in the month
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    let sundayCount = 0;
    for (let d = 1; d <= totalDaysInMonth; d++) {
      if (new Date(year, month - 1, d).getDay() === 0) sundayCount++;
    }
    const workingDays = totalDaysInMonth - sundayCount - holidayCount;

    const results = [];
    const errors = [];

    for (const employee of employees) {
      try {
        // Check if locked payroll exists
        const existingPayroll = await Payroll.findOne({
          employee: employee._id,
          month: Number(month),
          year: Number(year),
        });

        if (existingPayroll && existingPayroll.isLocked) {
          errors.push({
            employeeId: employee.employeeId,
            name: employee.fullName || `${employee.firstName} ${employee.lastName}`,
            error: "Payroll is locked and cannot be regenerated",
          });
          continue;
        }

        if (existingPayroll && ["Approved", "Paid"].includes(existingPayroll.status)) {
          errors.push({
            employeeId: employee.employeeId,
            name: employee.fullName || `${employee.firstName} ${employee.lastName}`,
            error: `Payroll already ${existingPayroll.status}. Cannot regenerate.`,
          });
          continue;
        }

        // Get active salary structure
        const salary = await SalaryFixed.findOne({ employeeId: employee._id, isActive: true });
        if (!salary) {
          errors.push({
            employeeId: employee.employeeId,
            name: employee.fullName || `${employee.firstName} ${employee.lastName}`,
            error: "No active salary structure found",
          });
          continue;
        }

        // Get attendance data for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const attendanceRecords = await Attendance.find({
          employee: employee._id,
          date: { $gte: startDate, $lte: endDate },
        });

        // Count attendance
        let presentDays = 0;
        let absentDays = 0;
        let halfDays = 0;
        let totalOvertimeHours = 0;

        for (const record of attendanceRecords) {
          switch (record.status) {
            case "Present":
            case "Late":
            case "WFH":
              presentDays++;
              // Only count overtime from approved attendance
              if (record.overtimeHours > 0) {
                totalOvertimeHours += record.overtimeHours;
              }
              break;
            case "Absent":
              absentDays++;
              break;
            case "Half Day":
              halfDays++;
              presentDays += 0.5;
              absentDays += 0.5;
              break;
            case "On Leave":
              // Will be handled by leave records
              break;
            case "Weekend":
            case "Holiday":
              // Not counted as working days
              break;
          }
        }

        // Get approved leave data for the month
        const leaveRecords = await LeaveRequest.find({
          employee: employee._id,
          status: "Approved",
          $or: [
            { startDate: { $gte: startDate, $lte: endDate } },
            { endDate: { $gte: startDate, $lte: endDate } },
            { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
          ],
        });

        let paidLeaveDays = 0;
        let unpaidLeaveDays = 0;
        let leaveHalfDayCount = 0;

        for (const leave of leaveRecords) {
          // Calculate days that fall within this month
          const leaveStart = new Date(Math.max(leave.startDate, startDate));
          const leaveEnd = new Date(Math.min(leave.endDate, endDate));
          let leaveDaysInMonth = 0;

          for (let d = new Date(leaveStart); d <= leaveEnd; d.setDate(d.getDate() + 1)) {
            if (d.getDay() !== 0) { // Skip Sundays
              leaveDaysInMonth++;
            }
          }

          if (leave.isHalfDay) {
            leaveDaysInMonth = 0.5;
            leaveHalfDayCount++;
          }

          if (leave.leaveType === "Unpaid Leave") {
            unpaidLeaveDays += leaveDaysInMonth;
          } else {
            // Casual Leave, Sick Leave, Earned Leave, Comp Off, WFH = Paid
            paidLeaveDays += leaveDaysInMonth;
          }
        }

        // Get temp changes
        const tempEdit = await TempChanges.findOne({
          employee: employee._id,
          month: Number(month),
          year: Number(year),
        });

        // Apply CL from temp edits if available
        const clDays = tempEdit?.cl || 0;
        const finalPresent = presentDays + paidLeaveDays + clDays;
        const finalAbsent = Math.max(0, workingDays - finalPresent);
        const payableDays = finalPresent + sundayCount + holidayCount;

        // Calculate salary
        const grossSalary = (salary.basicMonthly || 0) + (salary.hraMonthly || 0) +
          (salary.caMonthly || 0) + (salary.maMonthly || 0) + (salary.saMonthly || 0);

        const overtimeRate = salary.overtimeRate || 0;
        const overtimeAmount = totalOvertimeHours * overtimeRate;

        // Leave deduction: (unpaidLeaveDays / workingDays) × grossSalary
        const leaveDeduction = workingDays > 0 ? (unpaidLeaveDays / workingDays) * grossSalary : 0;

        // Prorated earnings
        const earningsAmount = workingDays > 0 ? (payableDays / totalDaysInMonth) * grossSalary : grossSalary;

        // Deductions
        const professionalTax = tempEdit?.professionalTax || salary.professionalTax || 0;
        const otherDed = tempEdit?.otherDed || 0;
        const arrears = tempEdit?.arrears || 0;

        // Net pay = earnings + overtime + arrears - leave deduction - PT - other deductions
        const netPay = earningsAmount + overtimeAmount + arrears - leaveDeduction - professionalTax - otherDed;

        const attendancePercentage = workingDays > 0 ? ((finalPresent / workingDays) * 100) : 0;

        // Build payroll data
        const payrollData = {
          employee: employee._id,
          month: Number(month),
          year: Number(year),
          status: "Generated",
          isLocked: false,
          totalDays: totalDaysInMonth,
          workingDays,
          present: presentDays,
          absent: absentDays,
          cl: clDays,
          finalPresent,
          finalAbsent,
          sundays: sundayCount,
          holidays: holidayCount,
          payableDays,
          attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
          overtimeHours: totalOvertimeHours,
          overtimeAmount: parseFloat(overtimeAmount.toFixed(2)),
          paidLeaveDays,
          unpaidLeaveDays,
          halfDayCount: halfDays + leaveHalfDayCount,
          leaveDeduction: parseFloat(leaveDeduction.toFixed(2)),
          grossSalary: parseFloat(grossSalary.toFixed(2)),
          earnings: parseFloat(earningsAmount.toFixed(2)),
          professionalTax,
          otherDed,
          arrears,
          netPay: parseFloat(netPay.toFixed(2)),
          generatedBy: userId || null,
          salaryStructureSnapshot: {
            basicMonthly: salary.basicMonthly || 0,
            hraMonthly: salary.hraMonthly || 0,
            caMonthly: salary.caMonthly || 0,
            maMonthly: salary.maMonthly || 0,
            saMonthly: salary.saMonthly || 0,
            grossMonthly: salary.grossMonthly || 0,
            bonusMonthly: salary.bonusMonthly || 0,
            overtimeRate: salary.overtimeRate || 0,
            employeePFMonthly: salary.employeePFMonthly || 0,
            employerPFMonthly: salary.employerPFMonthly || 0,
            esiEmployee: salary.esiEmployee || 0,
            esiEmployer: salary.esiEmployer || 0,
            taxMonthly: salary.taxMonthly || 0,
            professionalTax: salary.professionalTax || 0,
            otherDed: salary.otherDed || 0,
          },
        };

        // Upsert payroll record
        const payroll = await Payroll.findOneAndUpdate(
          { employee: employee._id, month: Number(month), year: Number(year) },
          payrollData,
          { new: true, upsert: true }
        );

        results.push({
          employeeId: employee.employeeId,
          name: employee.fullName || `${employee.firstName} ${employee.lastName}`,
          netPay: payroll.netPay,
          status: payroll.status,
        });

        // Audit log
        if (userId) {
          await createAuditLog("PAYROLL_GENERATED", {
            payroll: payroll._id,
            employee: employee._id,
            performedBy: userId,
            description: `Payroll generated for ${getMonthName(Number(month))} ${year}`,
          });
        }
      } catch (empError) {
        errors.push({
          employeeId: employee.employeeId,
          name: employee.fullName || `${employee.firstName} ${employee.lastName}`,
          error: empError.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Payroll generated for ${results.length} employees`,
      generated: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error generating payroll:", error);
    res.status(500).json({ message: "Error generating payroll", error: error.message });
  }
};

// ============================================================
// PAYROLL STATUS MANAGEMENT
// ============================================================

const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?._id || req.user?.id;

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    if (payroll.isLocked && status !== "Paid") {
      return res.status(400).json({ message: "Payroll is locked. Only Admin can unlock it." });
    }

    // Validate status transition
    const validNextStatuses = VALID_TRANSITIONS[payroll.status];
    if (!validNextStatuses || !validNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from '${payroll.status}' to '${status}'. Valid transitions: ${validNextStatuses?.join(", ") || "none"}`,
      });
    }

    const oldStatus = payroll.status;
    payroll.status = status;

    // Set tracking fields
    if (status === "Approved") {
      payroll.approvedBy = userId;
      payroll.approvedAt = new Date();
      payroll.isLocked = true; // Lock on approval
    } else if (status === "Paid") {
      payroll.paidBy = userId;
      payroll.paidAt = new Date();
      payroll.isLocked = true;
    }

    await payroll.save();

    // Audit log
    const actionMap = {
      Generated: "PAYROLL_GENERATED",
      Approved: "PAYROLL_APPROVED",
      Paid: "PAYROLL_PAID",
    };

    if (userId) {
      await createAuditLog(actionMap[status] || "PAYROLL_STATUS_CHANGED", {
        payroll: payroll._id,
        employee: payroll.employee,
        performedBy: userId,
        oldValue: { status: oldStatus },
        newValue: { status },
        description: `Payroll status changed from ${oldStatus} to ${status}`,
      });
    }

    res.status(200).json({ success: true, message: `Payroll ${status.toLowerCase()}`, data: payroll });
  } catch (error) {
    console.error("Error updating payroll status:", error);
    res.status(500).json({ message: "Error updating payroll status", error: error.message });
  }
};

// Bulk status update
const bulkUpdatePayrollStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!ids || !Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ message: "Payroll IDs array required" });
    }

    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        const payroll = await Payroll.findById(id);
        if (!payroll) {
          errors.push({ id, error: "Not found" });
          continue;
        }

        if (payroll.isLocked && status !== "Paid") {
          errors.push({ id, error: "Locked" });
          continue;
        }

        const validNext = VALID_TRANSITIONS[payroll.status];
        if (!validNext || !validNext.includes(status)) {
          errors.push({ id, error: `Invalid transition from ${payroll.status}` });
          continue;
        }

        const oldStatus = payroll.status;
        payroll.status = status;

        if (status === "Approved") {
          payroll.approvedBy = userId;
          payroll.approvedAt = new Date();
          payroll.isLocked = true;
        } else if (status === "Paid") {
          payroll.paidBy = userId;
          payroll.paidAt = new Date();
          payroll.isLocked = true;
        }

        await payroll.save();
        results.push(id);

        if (userId) {
          await createAuditLog("PAYROLL_STATUS_CHANGED", {
            payroll: payroll._id,
            employee: payroll.employee,
            performedBy: userId,
            oldValue: { status: oldStatus },
            newValue: { status },
            description: `Bulk status update: ${oldStatus} → ${status}`,
          });
        }
      } catch (e) {
        errors.push({ id, error: e.message });
      }
    }

    res.status(200).json({ success: true, updated: results.length, errors });
  } catch (error) {
    console.error("Error in bulk status update:", error);
    res.status(500).json({ message: "Error in bulk status update", error: error.message });
  }
};

// Lock payroll (Admin only)
const lockPayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    const payroll = await Payroll.findById(id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    payroll.isLocked = true;
    await payroll.save();

    if (userId) {
      await createAuditLog("PAYROLL_LOCKED", {
        payroll: payroll._id,
        employee: payroll.employee,
        performedBy: userId,
        description: "Payroll manually locked",
      });
    }

    res.status(200).json({ success: true, message: "Payroll locked", data: payroll });
  } catch (error) {
    res.status(500).json({ message: "Error locking payroll", error: error.message });
  }
};

// Unlock payroll (Admin only)
const unlockPayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    const payroll = await Payroll.findById(id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    payroll.isLocked = false;
    await payroll.save();

    if (userId) {
      await createAuditLog("PAYROLL_UNLOCKED", {
        payroll: payroll._id,
        employee: payroll.employee,
        performedBy: userId,
        description: "Payroll manually unlocked by admin",
      });
    }

    res.status(200).json({ success: true, message: "Payroll unlocked", data: payroll });
  } catch (error) {
    res.status(500).json({ message: "Error unlocking payroll", error: error.message });
  }
};

// ============================================================
// PAYROLL ADJUSTMENTS
// ============================================================

const addAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, reason } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!type || amount === undefined || !reason) {
      return res.status(400).json({ message: "Type, amount, and reason are required" });
    }

    const payroll = await Payroll.findById(id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    if (payroll.isLocked) {
      return res.status(400).json({ message: "Payroll is locked. Cannot add adjustments." });
    }

    if (!["Draft", "Generated"].includes(payroll.status)) {
      return res.status(400).json({ message: "Adjustments can only be added to Draft or Generated payrolls" });
    }

    const adjustment = {
      type,
      amount: Number(amount),
      reason,
      addedBy: userId || null,
      addedAt: new Date(),
    };

    payroll.adjustments.push(adjustment);

    // Recalculate net pay
    const totalAdjustments = payroll.adjustments.reduce((sum, adj) => {
      if (["Bonus", "Incentive", "Reimbursement"].includes(adj.type)) {
        return sum + adj.amount;
      } else {
        return sum - Math.abs(adj.amount);
      }
    }, 0);

    payroll.netPay = parseFloat((
      payroll.earnings + payroll.overtimeAmount + payroll.arrears - 
      payroll.leaveDeduction - payroll.professionalTax - payroll.otherDed + 
      totalAdjustments
    ).toFixed(2));

    await payroll.save();

    if (userId) {
      await createAuditLog("ADJUSTMENT_ADDED", {
        payroll: payroll._id,
        employee: payroll.employee,
        performedBy: userId,
        newValue: adjustment,
        description: `${type} of ₹${amount} added: ${reason}`,
      });
    }

    res.status(200).json({ success: true, message: "Adjustment added", data: payroll });
  } catch (error) {
    console.error("Error adding adjustment:", error);
    res.status(500).json({ message: "Error adding adjustment", error: error.message });
  }
};

const removeAdjustment = async (req, res) => {
  try {
    const { id, adjId } = req.params;
    const userId = req.user?._id || req.user?.id;

    const payroll = await Payroll.findById(id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    if (payroll.isLocked) {
      return res.status(400).json({ message: "Payroll is locked. Cannot remove adjustments." });
    }

    const adjIndex = payroll.adjustments.findIndex(a => a._id.toString() === adjId);
    if (adjIndex === -1) {
      return res.status(404).json({ message: "Adjustment not found" });
    }

    const removed = payroll.adjustments[adjIndex];
    payroll.adjustments.splice(adjIndex, 1);

    // Recalculate net pay
    const totalAdjustments = payroll.adjustments.reduce((sum, adj) => {
      if (["Bonus", "Incentive", "Reimbursement"].includes(adj.type)) {
        return sum + adj.amount;
      } else {
        return sum - Math.abs(adj.amount);
      }
    }, 0);

    payroll.netPay = parseFloat((
      payroll.earnings + payroll.overtimeAmount + payroll.arrears - 
      payroll.leaveDeduction - payroll.professionalTax - payroll.otherDed + 
      totalAdjustments
    ).toFixed(2));

    await payroll.save();

    if (userId) {
      await createAuditLog("ADJUSTMENT_REMOVED", {
        payroll: payroll._id,
        employee: payroll.employee,
        performedBy: userId,
        oldValue: removed,
        description: `${removed.type} of ₹${removed.amount} removed`,
      });
    }

    res.status(200).json({ success: true, message: "Adjustment removed", data: payroll });
  } catch (error) {
    res.status(500).json({ message: "Error removing adjustment", error: error.message });
  }
};

// ============================================================
// PAYROLL QUERIES
// ============================================================

// Preserved: createOrUpdatePayroll
const createOrUpdatePayroll = async (req, res) => {
  try {
    const payrollData = req.body;
    const filter = {
      employee: payrollData.employee,
      month: payrollData.month,
      year: payrollData.year,
    };

    const updatedPayroll = await Payroll.findOneAndUpdate(
      filter,
      payrollData,
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Payroll record created/updated successfully",
      data: updatedPayroll,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create/update payroll record",
      error: error.message,
    });
  }
};

// Preserved: getAllPayrolls
const getAllPayrolls = async (req, res) => {
  try {
    const { month, year, employeeId, search, status } = req.query;

    let query = {};
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (status) query.status = status;

    if (employeeId) {
      const employeeObj = await Employee.findOne({ employeeId });
      if (!employeeObj) return res.json([]);
      query.employee = employeeObj._id;
    }

    let payrolls = await Payroll.find(query).populate({
      path: "employee",
      populate: [
        { path: "department", model: "Department" }
      ]
    });

    if (!payrolls.length) return res.json([]);

    if (search) {
      const s = search.toLowerCase();
      payrolls = payrolls.filter(p => {
        const emp = p.employee;
        return (
          emp?.employeeName?.toLowerCase().includes(s) ||
          emp?.fullName?.toLowerCase().includes(s) ||
          emp?.firstName?.toLowerCase().includes(s) ||
          emp?.lastName?.toLowerCase().includes(s) ||
          emp?.employeeId?.toLowerCase().includes(s) ||
          emp?.designation?.toLowerCase().includes(s)
        );
      });
    }

    const formattedPayrolls = [];

    for (const payroll of payrolls) {
      const employee = payroll.employee;
      if (!employee) continue;

      // Use snapshot if available, otherwise fetch current salary
      let salary = null;
      if (payroll.salaryStructureSnapshot && payroll.salaryStructureSnapshot.basicMonthly > 0) {
        salary = payroll.salaryStructureSnapshot;
      } else {
        salary = await SalaryFixed.findOne({ employeeId: employee._id, isActive: true });
      }
      if (!salary) continue;

      const totalDays = payroll.totalDays || 30;
      const payableDays = payroll.payableDays || 30;

      const calc = (std) => parseFloat(((std / totalDays) * payableDays).toFixed(2));

      const earnings = {
        basic: { standard: salary.basicMonthly, earned: calc(salary.basicMonthly) },
        hra: { standard: salary.hraMonthly, earned: calc(salary.hraMonthly) },
        conveyance: { standard: salary.caMonthly, earned: calc(salary.caMonthly) },
        medical: { standard: salary.maMonthly, earned: calc(salary.maMonthly) },
        specialAllowance: { standard: salary.saMonthly, earned: calc(salary.saMonthly) },
        arrears: { standard: 0, earned: payroll.arrears || 0 }
      };

      const deductions = {
        pf: salary.employeePFMonthly || 0,
        esi: salary.esiEmployee || 0,
        pt: payroll.professionalTax || 0,
        tax: salary.taxMonthly || 0,
        other: payroll.otherDed || 0
      };

      const totalEarnings = Object.values(earnings).reduce((sum, val) => sum + val.earned, 0);
      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
      const netPay = totalEarnings + (payroll.arrears || 0) - totalDeductions;

      const grossSalary =
        (salary.basicMonthly || 0) +
        (salary.hraMonthly || 0) +
        (salary.caMonthly || 0) +
        (salary.maMonthly || 0) +
        (salary.saMonthly || 0) +
        (salary.bonusMonthly || 0);

      formattedPayrolls.push({
        _id: payroll._id,
        status: payroll.status,
        isLocked: payroll.isLocked,
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: employee.employeeName || employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || "Unknown",
          designation: employee.designation,
          site: employee.workLocation || "N/A",
          department: employee.department?.departmentName || "N/A",
          bankAccount: employee.accountNo || "N/A",
          bankName: employee.bankName || "N/A",
          doj: employee.doj ? new Date(employee.doj).toISOString().split("T")[0] : "N/A",
          email: employee.email || "N/A",
        },
        payrollInfo: {
          month: payroll.month,
          year: payroll.year,
          totalDays,
          payableDays,
          present: payroll.present,
          absent: payroll.absent,
          weekOffs: payroll.sundays,
          holidays: payroll.holidays,
          allowedLeaves: payroll.allowedLeaves,
          overtimeHours: payroll.overtimeHours,
          paidLeaveDays: payroll.paidLeaveDays,
          unpaidLeaveDays: payroll.unpaidLeaveDays,
        },
        earnings,
        deductions,
        adjustments: payroll.adjustments || [],
        totals: {
          grossSalary: parseFloat((grossSalary || 0).toFixed(2)),
          totalEarnings: parseFloat((totalEarnings || 0).toFixed(2)),
          arrears: payroll.arrears || 0,
          overtimeAmount: payroll.overtimeAmount || 0,
          leaveDeduction: payroll.leaveDeduction || 0,
          totalDeductions: parseFloat((totalDeductions || 0).toFixed(2)),
          pt: payroll.professionalTax || 0,
          netPay: parseFloat((payroll.netPay || 0).toFixed(2))
        },
        tracking: {
          generatedBy: payroll.generatedBy,
          approvedBy: payroll.approvedBy,
          paidBy: payroll.paidBy,
          approvedAt: payroll.approvedAt,
          paidAt: payroll.paidAt,
          emailSent: payroll.emailSent,
        }
      });
    }

    res.json(formattedPayrolls);

  } catch (error) {
    console.error("Error fetching payrolls:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// ============================================================
// DASHBOARD STATS
// ============================================================

const getPayrollDashboardStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const payrolls = await Payroll.find(query);
    const totalEmployees = await Employee.countDocuments({ status: "Active" });

    // Single query to get count of employees with active salary structures
    const employeesWithSalary = await SalaryFixed.distinct("employeeId", { isActive: true });
    const salaryAssigned = employeesWithSalary.length;
    const salaryMissing = Math.max(0, totalEmployees - salaryAssigned);

    const stats = {
      totalEmployees,
      salaryAssigned,
      salaryMissing,
      payrollPending: payrolls.filter(p => ["Draft", "Generated"].includes(p.status)).length,
      payrollProcessed: payrolls.filter(p => p.status === "Generated").length,
      payrollApproved: payrolls.filter(p => p.status === "Approved").length,
      payrollPaid: payrolls.filter(p => p.status === "Paid").length,
      monthlyPayrollAmount: payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0),
      totalGrossSalary: payrolls.reduce((sum, p) => sum + (p.grossSalary || 0), 0),
      totalDeductions: payrolls.reduce((sum, p) => sum + (p.professionalTax || 0) + (p.otherDed || 0) + (p.leaveDeduction || 0), 0),
      totalOvertimeAmount: payrolls.reduce((sum, p) => sum + (p.overtimeAmount || 0), 0),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

// ============================================================
// EMPLOYEE PAYROLL HISTORY
// ============================================================

const getEmployeePayrollHistory = async (req, res) => {
  try {
    const { empId } = req.params;

    // Find employee by employeeId string or ObjectId
    let employee;
    if (empId.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(empId);
    } else {
      employee = await Employee.findOne({ employeeId: empId });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const payrolls = await Payroll.find({ employee: employee._id })
      .sort({ year: -1, month: -1 });

    // Calculate summary
    const currentYear = new Date().getFullYear();
    const thisYearPayrolls = payrolls.filter(p => p.year === currentYear && p.status === "Paid");
    const totalEarningsThisYear = thisYearPayrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);
    const latestPayroll = payrolls[0] || null;

    // Get current salary
    const currentSalary = await SalaryFixed.findOne({ employeeId: employee._id, isActive: true });

    res.status(200).json({
      employee: {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.fullName || `${employee.firstName} ${employee.lastName}`,
        designation: employee.designation,
        email: employee.email,
      },
      summary: {
        currentSalary: currentSalary?.grossMonthly || currentSalary?.inHandMonthly || 0,
        lastPayslipAmount: latestPayroll?.netPay || 0,
        lastPayslipMonth: latestPayroll ? `${getMonthName(latestPayroll.month)} ${latestPayroll.year}` : "N/A",
        totalEarningsThisYear: parseFloat(totalEarningsThisYear.toFixed(2)),
      },
      payrolls: payrolls.map(p => ({
        _id: p._id,
        month: p.month,
        monthName: getMonthName(p.month),
        year: p.year,
        status: p.status,
        grossSalary: p.grossSalary,
        netPay: p.netPay,
        earnings: p.earnings,
        overtimeAmount: p.overtimeAmount,
        leaveDeduction: p.leaveDeduction,
        emailSent: p.emailSent,
        paidAt: p.paidAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching employee payroll history:", error);
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
};

// ============================================================
// PAYROLL REPORTS
// ============================================================

const getPayrollReports = async (req, res) => {
  try {
    const { reportType, month, year, departmentId, employeeId } = req.query;

    let query = {};
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    let payrolls = await Payroll.find(query).populate({
      path: "employee",
      populate: [
        { path: "department", model: "Department" },
        { path: "site", model: "Site" },
      ],
    });

    // Filter by department if specified
    if (departmentId) {
      payrolls = payrolls.filter(p => p.employee?.department?._id?.toString() === departmentId);
    }

    // Filter by employee if specified
    if (employeeId) {
      payrolls = payrolls.filter(p =>
        p.employee?.employeeId === employeeId || p.employee?._id?.toString() === employeeId
      );
    }

    let reportData;

    switch (reportType) {
      case "monthly":
        reportData = {
          title: `Monthly Payroll Report - ${getMonthName(Number(month))} ${year}`,
          totalEmployees: payrolls.length,
          totalGross: payrolls.reduce((s, p) => s + (p.grossSalary || 0), 0),
          totalNet: payrolls.reduce((s, p) => s + (p.netPay || 0), 0),
          totalDeductions: payrolls.reduce((s, p) => s + (p.professionalTax || 0) + (p.otherDed || 0), 0),
          totalOvertime: payrolls.reduce((s, p) => s + (p.overtimeAmount || 0), 0),
          totalLeaveDeductions: payrolls.reduce((s, p) => s + (p.leaveDeduction || 0), 0),
          records: payrolls.map(p => ({
            employeeId: p.employee?.employeeId,
            name: p.employee?.fullName || p.employee?.employeeName,
            department: p.employee?.department?.departmentName || "N/A",
            grossSalary: p.grossSalary,
            netPay: p.netPay,
            overtimeAmount: p.overtimeAmount,
            leaveDeduction: p.leaveDeduction,
            status: p.status,
          })),
        };
        break;

      case "department":
        const deptMap = {};
        for (const p of payrolls) {
          const deptName = p.employee?.department?.departmentName || "Unassigned";
          if (!deptMap[deptName]) {
            deptMap[deptName] = { department: deptName, employees: 0, totalGross: 0, totalNet: 0, totalOvertime: 0 };
          }
          deptMap[deptName].employees++;
          deptMap[deptName].totalGross += p.grossSalary || 0;
          deptMap[deptName].totalNet += p.netPay || 0;
          deptMap[deptName].totalOvertime += p.overtimeAmount || 0;
        }
        reportData = {
          title: `Department Payroll Report - ${getMonthName(Number(month))} ${year}`,
          departments: Object.values(deptMap),
        };
        break;

      case "overtime":
        reportData = {
          title: `Overtime Report - ${getMonthName(Number(month))} ${year}`,
          records: payrolls
            .filter(p => p.overtimeHours > 0)
            .map(p => ({
              employeeId: p.employee?.employeeId,
              name: p.employee?.fullName || p.employee?.employeeName,
              department: p.employee?.department?.departmentName || "N/A",
              overtimeHours: p.overtimeHours,
              overtimeAmount: p.overtimeAmount,
            })),
          totalOvertimeHours: payrolls.reduce((s, p) => s + (p.overtimeHours || 0), 0),
          totalOvertimeAmount: payrolls.reduce((s, p) => s + (p.overtimeAmount || 0), 0),
        };
        break;

      case "deduction":
        reportData = {
          title: `Deduction Report - ${getMonthName(Number(month))} ${year}`,
          records: payrolls.map(p => ({
            employeeId: p.employee?.employeeId,
            name: p.employee?.fullName || p.employee?.employeeName,
            department: p.employee?.department?.departmentName || "N/A",
            professionalTax: p.professionalTax,
            otherDeductions: p.otherDed,
            leaveDeduction: p.leaveDeduction,
            totalDeductions: (p.professionalTax || 0) + (p.otherDed || 0) + (p.leaveDeduction || 0),
          })),
          totalDeductions: payrolls.reduce((s, p) => s + (p.professionalTax || 0) + (p.otherDed || 0) + (p.leaveDeduction || 0), 0),
        };
        break;

      default:
        // Employee report
        reportData = {
          title: `Employee Payroll Report`,
          records: payrolls.map(p => ({
            employeeId: p.employee?.employeeId,
            name: p.employee?.fullName || p.employee?.employeeName,
            month: getMonthName(p.month),
            year: p.year,
            grossSalary: p.grossSalary,
            netPay: p.netPay,
            status: p.status,
          })),
        };
    }

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generating report", error: error.message });
  }
};

// ============================================================
// EXPORT (CSV)
// ============================================================

const exportPayrollCSV = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const payrolls = await Payroll.find(query).populate({
      path: "employee",
      populate: [{ path: "department", model: "Department" }],
    });

    // CSV header
    const headers = [
      "Employee ID", "Employee Name", "Department", "Designation",
      "Month", "Year", "Working Days", "Present", "Absent",
      "Overtime Hours", "Overtime Amount",
      "Paid Leave Days", "Unpaid Leave Days", "Leave Deduction",
      "Gross Salary", "Earnings", "Professional Tax", "Other Deductions",
      "Arrears", "Net Pay", "Status"
    ].join(",");

    const rows = payrolls.map(p => {
      const emp = p.employee;
      return [
        emp?.employeeId || "",
        `"${emp?.fullName || emp?.employeeName || ""}"`,
        `"${emp?.department?.departmentName || ""}"`,
        `"${emp?.designation || ""}"`,
        getMonthName(p.month),
        p.year,
        p.workingDays,
        p.present,
        p.absent,
        p.overtimeHours,
        p.overtimeAmount,
        p.paidLeaveDays,
        p.unpaidLeaveDays,
        p.leaveDeduction,
        p.grossSalary,
        p.earnings,
        p.professionalTax,
        p.otherDed,
        p.arrears,
        p.netPay,
        p.status,
      ].join(",");
    });

    const csv = [headers, ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=payroll_${month || "all"}_${year || "all"}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ message: "Error exporting CSV", error: error.message });
  }
};

// Excel export
const exportPayrollExcel = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const payrolls = await Payroll.find(query).populate({
      path: "employee",
      populate: [{ path: "department", model: "Department" }],
    });

    // Build data for Excel-compatible CSV (with BOM for Excel recognition)
    const headers = [
      "Employee ID", "Employee Name", "Department", "Designation",
      "Month", "Year", "Working Days", "Present", "Absent",
      "Overtime Hours", "Overtime Amount",
      "Paid Leave Days", "Unpaid Leave Days", "Leave Deduction",
      "Gross Salary", "Earnings", "Professional Tax", "Other Deductions",
      "Arrears", "Net Pay", "Status"
    ].join("\t");

    const rows = payrolls.map(p => {
      const emp = p.employee;
      return [
        emp?.employeeId || "",
        emp?.fullName || emp?.employeeName || "",
        emp?.department?.departmentName || "",
        emp?.designation || "",
        getMonthName(p.month),
        p.year,
        p.workingDays,
        p.present,
        p.absent,
        p.overtimeHours,
        p.overtimeAmount,
        p.paidLeaveDays,
        p.unpaidLeaveDays,
        p.leaveDeduction,
        p.grossSalary,
        p.earnings,
        p.professionalTax,
        p.otherDed,
        p.arrears,
        p.netPay,
        p.status,
      ].join("\t");
    });

    const content = "\uFEFF" + [headers, ...rows].join("\n"); // BOM for Excel

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("Content-Disposition", `attachment; filename=payroll_${month || "all"}_${year || "all"}.xls`);
    res.send(content);
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({ message: "Error exporting Excel", error: error.message });
  }
};

// ============================================================
// PAYSLIP PDF & EMAIL (PRESERVED + ENHANCED)
// ============================================================

const getPayrollPdf = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Missing month or year" });
    }

    let query = { month: Number(month), year: Number(year) };
    if (employeeId) {
      const employeeObj = await Employee.findOne({ employeeId });
      if (!employeeObj) return res.status(404).json({ message: "Employee not found" });
      query.employee = employeeObj._id;
    }

    const payrolls = await Payroll.find(query).populate({
      path: "employee",
      model: "Employee",
      populate: [
        { path: "site", model: "Site" },
        { path: "department", model: "Department" }
      ]
    });

    if (!payrolls.length) return res.status(404).json({ message: "No payroll records found" });

    const templatePath = path.join(__dirname, "../utils/payslip-template.html");
    const htmlSource = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(htmlSource);

    handlebars.registerHelper("formatINR", function (value) {
      if (!value && value !== 0) return "₹0";
      return "₹" + Number(value).toLocaleString("en-IN");
    });

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: puppeteer.executablePath(),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--no-zygote",
        "--disable-dev-shm-usage"
      ]
    });

    const pdfBuffers = [];

    for (const payroll of payrolls) {
      const employee = payroll.employee;
      if (!employee) continue;

      // Use snapshot if available, otherwise fetch current
      let salary = null;
      if (payroll.salaryStructureSnapshot && payroll.salaryStructureSnapshot.basicMonthly > 0) {
        salary = payroll.salaryStructureSnapshot;
      } else {
        salary = await SalaryFixed.findOne({ employeeId: employee._id, isActive: true });
      }
      if (!salary) continue;

      const totalDays = payroll.totalDays || 30;
      const payableDays = payroll.payableDays || 30;
      const calc = (std) => parseFloat(((std / totalDays) * payableDays).toFixed(2));

      const earnings = {
        basic: { standard: salary.basicMonthly, earned: calc(salary.basicMonthly) },
        hra: { standard: salary.hraMonthly, earned: calc(salary.hraMonthly) },
        conveyance: { standard: salary.caMonthly, earned: calc(salary.caMonthly) },
        medical: { standard: salary.maMonthly, earned: calc(salary.maMonthly) },
        specialAllowance: { standard: salary.saMonthly, earned: calc(salary.saMonthly) },
        bonus: { standard: salary.bonusMonthly, earned: salary.bonusMonthly },
        arrears: { standard: 0, earned: payroll.arrears || 0 }
      };

      const deductions = {
        pf: salary.employeePFMonthly || 0,
        esi: salary.esiEmployee || 0,
        pt: payroll.professionalTax || 0,
        tax: salary.taxMonthly || 0,
        other: payroll.otherDed || 0
      };

      const totalEarnings = Object.values(earnings).reduce((s, v) => s + v.earned, 0);
      const totalDeductions = Object.values(deductions).reduce((s, v) => s + v, 0);
      const netPay = totalEarnings + (payroll.arrears || 0) - totalDeductions;
      const totalStandard = salary.grossMonthly;

      const payslipData = {
        company: {
          name: process.env.COMPANY_NAME || "Trade Syndicate",
          address: process.env.COMPANY_ADDRESS || "",
          logo: process.env.COMPANY_LOGO_URL || "",
        },
        employee: {
          name: employee.fullName || employee.employeeName || `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          designation: employee.designation,
          site: employee.site?.siteName || "N/A",
          department: employee.department?.departmentName || "N/A",
          bankAccount: employee.accountNo || "N/A",
          bankName: employee.bankName || "N/A",
          doj: employee.doj ? employee.doj.toISOString().split("T")[0] : "N/A",
          email: employee.email || "N/A"
        },
        payrollInfo: {
          month: getMonthName(Number(month)),
          year,
          totalDays,
          payableDays,
          present: payroll.present,
          absent: payroll.absent,
          weekOffs: payroll.sundays,
          holidays: payroll.holidays,
          overtimeHours: payroll.overtimeHours || 0,
          paidLeaveDays: payroll.paidLeaveDays || 0,
          unpaidLeaveDays: payroll.unpaidLeaveDays || 0,
        },
        earnings,
        deductions,
        adjustments: payroll.adjustments || [],
        totals: {
          totalStandard,
          totalEarnings,
          totalDeductions,
          arrears: payroll.arrears || 0,
          overtimeAmount: payroll.overtimeAmount || 0,
          leaveDeduction: payroll.leaveDeduction || 0,
          pt: payroll.professionalTax || 0,
          netPay,
          netPayWords: inrWords(Math.abs(Math.round(netPay))) + " Only"
        }
      };

      const html = template(payslipData);
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      let pdf = await page.pdf({ format: "A4", printBackground: true });
      if (!(pdf instanceof Buffer)) pdf = Buffer.from(pdf);

      if (pdf && pdf.length > 0) {
        const empName = employee.fullName || employee.employeeName || `${employee.firstName}_${employee.lastName}`;
        const fileName = sanitizeFilename(
          `Payslip_${empName}-${employee.employeeId}-${getMonthName(Number(month))}-${year}.pdf`
        );
        pdfBuffers.push({ pdf, filename: fileName, employee });
      }

      await page.close();
    }

    await browser.close();

    if (!pdfBuffers.length) return res.status(404).json({ message: "No valid payroll PDFs generated" });

    if (pdfBuffers.length === 1) {
      const singleFile = pdfBuffers[0];
      const encodedName = encodeURIComponent(singleFile.filename);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`
      );
      return res.send(singleFile.pdf);
    }

    // Multiple PDFs → ZIP
    const zipFileName = `payrolls-${month}-${year}.zip`;
    const encodedZipName = encodeURIComponent(zipFileName);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodedZipName}"; filename*=UTF-8''${encodedZipName}`
    );

    const archive = archiver("zip");
    archive.pipe(res);

    pdfBuffers.forEach(item => {
      if (item.pdf && Buffer.isBuffer(item.pdf)) {
        archive.append(item.pdf, { name: item.filename });
      }
    });

    await archive.finalize();

  } catch (error) {
    console.error("Error generating payroll PDF:", error);
    res.status(500).json({ message: "Error generating payroll PDF", error: error.message });
  }
};

// Email payslip
const emailPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    const payroll = await Payroll.findById(id).populate("employee");
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    const employee = payroll.employee;
    if (!employee || !employee.email) {
      return res.status(400).json({ message: "Employee email not found" });
    }

    // Generate PDF
    const templatePath = path.join(__dirname, "../utils/payslip-template.html");
    const htmlSource = fs.readFileSync(templatePath, "utf8");

    handlebars.registerHelper("formatINR", function (value) {
      if (!value && value !== 0) return "₹0";
      return "₹" + Number(value).toLocaleString("en-IN");
    });

    const template = handlebars.compile(htmlSource);

    let salary = null;
    if (payroll.salaryStructureSnapshot && payroll.salaryStructureSnapshot.basicMonthly > 0) {
      salary = payroll.salaryStructureSnapshot;
    } else {
      salary = await SalaryFixed.findOne({ employeeId: employee._id, isActive: true });
    }

    if (!salary) {
      return res.status(404).json({ message: "Salary structure not found" });
    }

    const totalDays = payroll.totalDays || 30;
    const payableDays = payroll.payableDays || 30;
    const calc = (std) => parseFloat(((std / totalDays) * payableDays).toFixed(2));

    const payslipData = {
      company: {
        name: process.env.COMPANY_NAME || "Trade Syndicate",
        address: process.env.COMPANY_ADDRESS || "",
        logo: process.env.COMPANY_LOGO_URL || "",
      },
      employee: {
        name: employee.fullName || employee.employeeName || `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        designation: employee.designation,
        department: employee.department?.departmentName || "N/A",
        doj: employee.doj ? employee.doj.toISOString().split("T")[0] : "N/A",
      },
      payrollInfo: {
        month: getMonthName(payroll.month),
        year: payroll.year,
        totalDays,
        payableDays,
        present: payroll.present,
        absent: payroll.absent,
      },
      earnings: {
        basic: { standard: salary.basicMonthly, earned: calc(salary.basicMonthly) },
        hra: { standard: salary.hraMonthly, earned: calc(salary.hraMonthly) },
        conveyance: { standard: salary.caMonthly, earned: calc(salary.caMonthly) },
        medical: { standard: salary.maMonthly, earned: calc(salary.maMonthly) },
        specialAllowance: { standard: salary.saMonthly, earned: calc(salary.saMonthly) },
      },
      deductions: {
        pf: salary.employeePFMonthly || 0,
        esi: salary.esiEmployee || 0,
        pt: payroll.professionalTax || 0,
        tax: salary.taxMonthly || 0,
        other: payroll.otherDed || 0,
      },
      totals: {
        totalStandard: salary.grossMonthly,
        totalEarnings: payroll.earnings,
        totalDeductions: (salary.employeePFMonthly || 0) + (salary.esiEmployee || 0) + (payroll.professionalTax || 0) + (salary.taxMonthly || 0) + (payroll.otherDed || 0),
        netPay: payroll.netPay,
        netPayWords: inrWords(Math.abs(Math.round(payroll.netPay))) + " Only",
      },
    };

    const html = template(payslipData);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: puppeteer.executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--no-zygote", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    let pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    if (!(pdfBuffer instanceof Buffer)) pdfBuffer = Buffer.from(pdfBuffer);
    await page.close();
    await browser.close();

    // Send email using existing emailService
    const empName = employee.fullName || employee.employeeName || `${employee.firstName} ${employee.lastName}`;
    await sendPaySlip(
      employee.email,
      empName,
      employee.employeeId,
      getMonthName(payroll.month),
      payroll.year,
      pdfBuffer
    );

    // Update email tracking
    payroll.emailSent = true;
    payroll.emailSentAt = new Date();
    await payroll.save();

    res.status(200).json({ success: true, message: `Payslip emailed to ${employee.email}` });
  } catch (error) {
    console.error("Error emailing payslip:", error);
    res.status(500).json({ message: "Error emailing payslip", error: error.message });
  }
};

// ============================================================
// AUDIT LOGS
// ============================================================

const getPayrollAuditLogs = async (req, res) => {
  try {
    const { payrollId, employeeId, action, page = 1, limit = 50 } = req.query;

    let query = {};
    if (payrollId) query.payroll = payrollId;
    if (employeeId) query.employee = employeeId;
    if (action) query.action = action;

    const logs = await PayrollAuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("performedBy", "firstName lastName fullName email role")
      .populate("employee", "employeeId fullName firstName lastName");

    const total = await PayrollAuditLog.countDocuments(query);

    res.status(200).json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Error fetching audit logs", error: error.message });
  }
};

// ============================================================
// TEMP CHANGES (PRESERVED)
// ============================================================

const getTempEditByEmployee = async (req, res) => {
  const { month, year } = req.query;
  try {
    const edits = await TempChanges.find({ month, year });
    res.json(edits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching temp edits" });
  }
};

const saveTempEdit = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    const allowedFields = ["cl", "otherDed", "arrears", "professionalTax"];
    const updates = { isEdited: true };

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updated = await TempChanges.findOneAndUpdate(
      { employee: employeeId, month, year },
      { $set: updates },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    return res.json(updated);

  } catch (err) {
    console.error("Temp edit error:", err);
    return res.status(500).json({ message: "Error saving temp edit" });
  }
};

const resetTempEdit = async (req, res) => {
  const { employeeId, month, year } = req.body;

  try {
    await TempChanges.findOneAndDelete({ employee: employeeId, month, year });
    res.json({ message: "Temp edit reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting temp edit" });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Salary structure
  createFixedSalary,
  getFixedSalary,
  getFixedSalaryByEmployee,
  updateFixedSalaryByEmployeeId,
  getSalaryHistory,

  // Payroll generation & queries
  generatePayroll,
  createOrUpdatePayroll,
  getAllPayrolls,
  getPayrollDashboardStats,
  getEmployeePayrollHistory,

  // Status management
  updatePayrollStatus,
  bulkUpdatePayrollStatus,
  lockPayroll,
  unlockPayroll,

  // Adjustments
  addAdjustment,
  removeAdjustment,

  // PDF & Email
  getPayrollPdf,
  emailPayslip,

  // Reports & Export
  getPayrollReports,
  exportPayrollCSV,
  exportPayrollExcel,

  // Audit logs
  getPayrollAuditLogs,

  // Temp changes
  getTempEditByEmployee,
  saveTempEdit,
  resetTempEdit,
};
