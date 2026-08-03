const LeaveSettings = require('../../models/LeaveSettings');
const LeaveType = require('../../models/LeaveType');

async function provisionLeave(companyId) {
  // 1. Leave Settings
  const leaveSettings = new LeaveSettings({
    company: companyId,
    defaultCL: 12,
    defaultSL: 8,
    defaultEL: 15,
    defaultCompOff: 0,
    carryForwardLimitEL: 15,
    probationPeriodDays: 180,
    isConfigured: true
  });
  await leaveSettings.save();

  // 2. Leave Types
  const leaveTypes = [
    { name: 'Casual Leave', code: 'CL', description: 'Paid casual leave', category: 'Paid', accrualType: 'Monthly', monthlyCreditOn: 'First day of month', allocation: 12, carryForward: false, allowHalfDay: true, payrollImpact: 'Paid Leave', company: companyId },
    { name: 'Sick Leave', code: 'SL', description: 'Paid sick leave', category: 'Paid', accrualType: 'Monthly', monthlyCreditOn: 'First day of month', allocation: 8, carryForward: false, allowHalfDay: true, payrollImpact: 'Paid Leave', company: companyId },
    { name: 'Earned Leave', code: 'EL', description: 'Paid earned leave', category: 'Paid', accrualType: 'Monthly', monthlyCreditOn: 'First day of month', allocation: 15, carryForward: true, maxCarryForwardDays: 15, allowHalfDay: true, payrollImpact: 'Paid Leave', company: companyId },
    { name: 'Maternity Leave', code: 'ML', description: 'Paid maternity leave for female employees', category: 'Paid', accrualType: 'One-Time', allocation: 180, carryForward: false, genderRestriction: 'Female', allowHalfDay: false, payrollImpact: 'Paid Leave', company: companyId },
    { name: 'Paternity Leave', code: 'PL', description: 'Paid paternity leave for male employees', category: 'Paid', accrualType: 'One-Time', allocation: 15, carryForward: false, genderRestriction: 'Male', allowHalfDay: false, payrollImpact: 'Paid Leave', company: companyId },
    { name: 'Compensatory Off', code: 'COMP_OFF', description: 'Compensatory leave', category: 'Paid', accrualType: 'One-Time', allocation: 0, carryForward: false, allowHalfDay: true, payrollImpact: 'Paid Leave', company: companyId },
    { name: 'Loss of Pay', code: 'LOP', description: 'Unpaid leave', category: 'Unpaid', accrualType: 'One-Time', allocation: 0, carryForward: false, allowHalfDay: true, payrollImpact: 'Unpaid Leave', company: companyId }
  ];

  await LeaveType.insertMany(leaveTypes);
}

module.exports = { provisionLeave };
