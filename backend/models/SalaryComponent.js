const mongoose = require('mongoose');

const salaryComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Component name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Component code is required'],
    uppercase: true,
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Earning', 'Deduction'],
    required: true
  },
  calculationType: {
    type: String,
    enum: ['Fixed Amount', 'Percentage', 'Variable', 'Formula'],
    default: 'Fixed Amount'
  },
  taxable: {
    type: Boolean,
    default: true
  },
  inCTC: {
    type: Boolean,
    default: true
  },
  inNet: {
    type: Boolean,
    default: true
  },
  defaultValue: {
    type: Number,
    default: 0
  },
  displayOrder: {
    type: Number,
    default: 99
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

salaryComponentSchema.index({ code: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('SalaryComponent', salaryComponentSchema);
