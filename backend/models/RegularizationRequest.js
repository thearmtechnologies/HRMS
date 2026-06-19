const mongoose = require("mongoose");

const regularizationRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    attendanceRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Missing Punch", "Late Arrival", "Other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Submitted", "Pending", "Approved", "Rejected"],
      default: "Submitted",
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approverRemarks: {
      type: String,
    },
    requestedChanges: {
      type: Object, // e.g. { checkOutTime: "2026-06-18T18:00:00.000Z" }
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RegularizationRequest", regularizationRequestSchema);
