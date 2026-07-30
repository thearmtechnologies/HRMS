const mongoose = require('mongoose');

const overtimePolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
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

module.exports = mongoose.model('OvertimePolicy', overtimePolicySchema);
