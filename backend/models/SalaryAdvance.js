const mongoose = require('mongoose');

const salaryAdvanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  reason: {
    type: String,
    required: true
  },
  recoveryStartMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  recoveryStartYear: {
    type: Number,
    required: true
  },
  recoveryMethod: {
    type: String,
    enum: ['Fixed Monthly', 'Manual'],
    required: true
  },
  installmentAmount: {
    type: Number,
    default: 0
  },
  outstandingBalance: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Paid', 'Recovering', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionDate: {
    type: Date
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paidDate: {
    type: Date
  },
  recoveryHistory: [{
    month: Number,
    year: Number,
    payroll: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll' },
    recoveredAmount: Number,
    balanceAfter: Number,
    date: { type: Date, default: Date.now }
  }],
  recoverySchedule: [{
    month: Number,
    year: Number,
    plannedRecovery: Number,
    actualRecovery: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Partial', 'Completed'], default: 'Pending' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SalaryAdvance', salaryAdvanceSchema);
