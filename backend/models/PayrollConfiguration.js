const mongoose = require('mongoose');

const payrollConfigurationSchema = new mongoose.Schema({
  // General Payroll Settings
  frequency: { type: String, enum: ['Monthly', 'Biweekly', 'Weekly'], default: 'Monthly' },
  salaryCreditDay: { type: Number, default: 1 },
  processingDate: { type: Number, default: 25 },
  financialYear: { type: String, default: 'April - March' },
  currency: { type: String, default: 'INR' },
  defaultOvertimeRate: { type: Number, default: 1.5 },
  roundSalaryAmounts: { type: Boolean, default: true },
  
  // Generation Settings
  defaultCalculationMode: { type: String, enum: ['System Calculated', 'Custom (Full Assigned)'], default: 'System Calculated' },
  allowManualOverride: { type: Boolean, default: false },
  lockPayrollAfterApproval: { type: Boolean, default: true },
  allowPayrollRegeneration: { type: Boolean, default: false },
  allowNegativeSalary: { type: Boolean, default: false },
  autoIncludeAttendance: { type: Boolean, default: true },
  autoIncludeApprovedLeave: { type: Boolean, default: true },
  autoIncludeOvertime: { type: Boolean, default: true },
  
  // Tax Settings (PF)
  pfEnabled: { type: Boolean, default: true },
  pfEmployeePercent: { type: Number, default: 12 },
  pfEmployerPercent: { type: Number, default: 12 },
  pfWageLimit: { type: Number, default: 15000 },
  
  // Tax Settings (ESI)
  esiEnabled: { type: Boolean, default: true },
  esiEmployeePercent: { type: Number, default: 0.75 },
  esiEmployerPercent: { type: Number, default: 3.25 },
  esiWageLimit: { type: Number, default: 21000 },
  
  // Tax Settings (PT)
  ptEnabled: { type: Boolean, default: true },
  ptDefaultAmount: { type: Number, default: 200 },
  ptState: { type: String, default: 'Maharashtra' },

  // Salary Advance Settings
  salaryAdvanceEnabled: { type: Boolean, default: true },
  salaryAdvanceMaxLimitType: { type: String, enum: ['1x Gross Salary', '2x Gross Salary', '3x Gross Salary', 'Custom Amount'], default: '2x Gross Salary' },
  salaryAdvanceCustomLimit: { type: Number, default: 50000 },

  // Singleton lock
  isSingleton: { type: Boolean, default: true, unique: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('PayrollConfiguration', payrollConfigurationSchema);
