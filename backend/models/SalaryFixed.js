const mongoose = require('mongoose');

const salaryFixedSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  basicMonthly: Number,
  hraMonthly: Number,
  caMonthly: Number,
  maMonthly: Number,
  saMonthly: Number,
  grossMonthly: Number,
  bonusMonthly: Number,

  employeePFMonthly: Number,
  employerPFMonthly: Number,
  esiEmployee: Number,
  esiEmployer: Number,
  taxMonthly: Number,
  otherDed: Number,
  professionalTax: Number,
  inHandMonthly: Number,

  annualCTC: Number,
  annualGross: Number,
  annualInHand: Number,
  annualBonus: Number,
  annualEmployerPF: Number,

  // Overtime rate per hour
  overtimeRate: { type: Number, default: 0 },

  // Salary history support
  effectiveDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Index for fast lookups - allow multiple records per employee (salary history)
salaryFixedSchema.index({ employeeId: 1, isActive: 1 });
salaryFixedSchema.index({ employeeId: 1, effectiveDate: -1 });

const SalaryFixed = mongoose.model('SalaryFixed', salaryFixedSchema);
module.exports = SalaryFixed;
