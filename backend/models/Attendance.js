const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    checkInLocation: {
      type: String,
      default: null,
    },
    checkOutLocation: {
      type: String,
      default: null,
    },
    totalWorkingHours: {
      type: Number,
      default: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Present", "Late", "Absent", "Half Day", "On Leave", "Weekend", "Holiday", "WFH"],
      default: "Absent",
    },
    notes: {
      type: String,
      default: "",
    },
    missingPunch: {
      type: Boolean,
      default: false,
    },
    regularizationStatus: {
      type: String,
      enum: ["None", "Submitted", "Pending", "Approved", "Rejected"],
      default: "None",
    },
    auditLogs: [
      {
        action: String,
        originalValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
        timestamp: { type: Date, default: Date.now },
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Unique index to prevent duplicate attendance records for the same employee on the same date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
