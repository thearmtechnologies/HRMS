const SalaryAdvance = require('../models/SalaryAdvance');
const Employee = require('../models/Employee');
const PayrollConfiguration = require('../models/PayrollConfiguration');
const SalaryFixed = require('../models/SalaryFixed');


exports.createAdvance = async (req, res) => {
  try {
    const { employee, amount, date, reason, recoveryStartMonth, recoveryStartYear, recoveryMethod, installmentAmount } = req.body;

    // 1. Check for existing active advance
    const existingActive = await SalaryAdvance.findOne({
      employee,
      status: { $in: ['Pending', 'Approved', 'Paid', 'Recovering'] }
    });
    if (existingActive) {
      return res.status(400).json({ message: 'Employee already has an active or pending advance.' });
    }

    // 2. Validate max limits based on PayrollConfiguration
    const config = await PayrollConfiguration.findOne();
    const isEnabled = config ? config.salaryAdvanceEnabled : true;
    if (!isEnabled) {
      return res.status(400).json({ message: 'Salary Advance module is disabled in settings.' });
    }

    const limitType = config ? config.salaryAdvanceMaxLimitType : '2x Gross Salary';
    const customLimit = config ? config.salaryAdvanceCustomLimit : 50000;
    
    let maxAllowed = customLimit; // Default for Custom Amount
    
    if (limitType !== 'Custom Amount') {
      const salaryFixed = await SalaryFixed.findOne({ employeeId: employee });
      if (!salaryFixed) {
        return res.status(400).json({ message: 'Employee fixed salary not configured.' });
      }
      const grossMonthly = salaryFixed.grossMonthly || 0;
      if (limitType === '1x Gross Salary') maxAllowed = grossMonthly;
      else if (limitType === '2x Gross Salary') maxAllowed = grossMonthly * 2;
      else if (limitType === '3x Gross Salary') maxAllowed = grossMonthly * 3;
    }

    
    if (amount > maxAllowed) {
      return res.status(400).json({ message: `Requested amount exceeds maximum allowed limit (₹${maxAllowed}).` });
    }

    // 3. Generate initial recoverySchedule if Fixed Monthly
    let recoverySchedule = [];
    if (recoveryMethod === 'Fixed Monthly' && installmentAmount > 0) {
      let remaining = amount;
      let currMonth = parseInt(recoveryStartMonth, 10);
      let currYear = parseInt(recoveryStartYear, 10);
      
      while (remaining > 0) {
        let planned = Math.min(remaining, installmentAmount);
        recoverySchedule.push({
          month: currMonth,
          year: currYear,
          plannedRecovery: planned,
          actualRecovery: 0,
          status: 'Pending'
        });
        remaining -= planned;
        currMonth++;
        if (currMonth > 12) {
          currMonth = 1;
          currYear++;
        }
      }
    }

    const advance = new SalaryAdvance({
      employee,
      amount,
      date: date || Date.now(),
      reason,
      recoveryStartMonth,
      recoveryStartYear,
      recoveryMethod,
      installmentAmount: recoveryMethod === 'Fixed Monthly' ? installmentAmount : 0,
      outstandingBalance: amount,
      status: 'Pending',
      recoverySchedule
    });

    await advance.save();
    
    // Populate employee details for response
    await advance.populate('employee', 'firstName lastName employeeId');
    
    res.status(201).json({ message: 'Salary advance created successfully', advance });
  } catch (error) {
    console.error('Create Advance Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllAdvances = async (req, res) => {
  try {
    const { status, employee } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (employee) query.employee = employee;

    const advances = await SalaryAdvance.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json(advances);
  } catch (error) {
    console.error('Get Advances Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAdvanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Paid', 'Recovering', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const advance = await SalaryAdvance.findById(id);
    if (!advance) {
      return res.status(404).json({ message: 'Salary advance not found' });
    }

    advance.status = status;
    
    if (status === 'Approved' || status === 'Rejected') {
      advance.approvedBy = req.user ? req.user.id : null; // Assuming auth middleware sets req.user
      advance.approvalDate = Date.now();
    }

    await advance.save();
    await advance.populate('employee', 'firstName lastName employeeId');

    res.status(200).json({ message: `Salary advance ${status.toLowerCase()}`, advance });
  } catch (error) {
    console.error('Update Advance Status Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAdvance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const advance = await SalaryAdvance.findById(id);
    if (!advance) {
      return res.status(404).json({ message: 'Salary advance not found' });
    }

    // Recalculate outstanding if amount changes and it's still pending
    if (updateData.amount !== undefined && advance.status === 'Pending') {
      updateData.outstandingBalance = updateData.amount;
    }

    if (updateData.recoveryMethod === 'Manual') {
      updateData.installmentAmount = 0;
    }

    const updated = await SalaryAdvance.findByIdAndUpdate(id, updateData, { new: true })
      .populate('employee', 'firstName lastName employeeId');

    res.status(200).json({ message: 'Salary advance updated', advance: updated });
  } catch (error) {
    console.error('Update Advance Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAdvance = async (req, res) => {
  try {
    const { id } = req.params;
    const advance = await SalaryAdvance.findById(id);
    if (!advance) {
      return res.status(404).json({ message: 'Salary advance not found' });
    }
    
    if (advance.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending advances can be deleted' });
    }

    await SalaryAdvance.findByIdAndDelete(id);
    res.status(200).json({ message: 'Salary advance deleted' });
  } catch (error) {
    console.error('Delete Advance Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
