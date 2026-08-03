const mongoose = require('mongoose');

const overtimePolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  calculationType: {
    type: String,
    enum: ["Fixed Amount", "Multiplier"],
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  minimumOvertimeHours: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

overtimePolicySchema.index({ name: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('OvertimePolicy', overtimePolicySchema);
