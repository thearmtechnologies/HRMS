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
  annualEmployerPF: Number
}, { timestamps: true });

const SalaryFixed = mongoose.model('SalaryFixed', salaryFixedSchema);
module.exports = SalaryFixed;

