const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    type: {
      type: String,
      enum: ["Fixed", "Flexible"],
      default: "Fixed",
    },
    startTime: {
      type: String, // e.g. "09:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "18:00"
      required: true,
    },
    weeklyOffDays: {
      type: [String], // e.g. ["Saturday", "Sunday"]
      default: ["Sunday"],
    },
    breakDuration: {
      type: Number, // in hours, e.g. 1
      default: 1,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    lateCheckInGraceTime: {
      type: Number, // in minutes
      default: 0,
      min: [0, 'Late Check-In Grace Time cannot be negative']
    },
    earlyCheckOutGraceTime: {
      type: Number, // in minutes
      default: 0,
      min: [0, 'Early Check-Out Grace Time cannot be negative']
    },
    enableLateDeduction: {
      type: Boolean,
      default: false
    },
    allowedLateEntries: {
      type: Number,
      default: 3,
      min: [0, 'Allowed late entries cannot be negative']
    },
    lateDeductionType: {
      type: String,
      enum: ['Fixed Amount', 'Half-Day', 'Full-Day', 'Percentage of Daily Gross Salary'],
      default: 'Fixed Amount'
    },
    lateDeductionValue: {
      type: Number,
      default: 0,
      min: [0, 'Late deduction value cannot be negative']
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shift", shiftSchema);
