const mongoose = require("mongoose");
const { Schema } = mongoose;

const payrollAuditLogSchema = new Schema({
  action: {
    type: String,
    enum: [
      "PAYROLL_GENERATED",
      "PAYROLL_APPROVED",
      "PAYROLL_PAID",
      "PAYROLL_LOCKED",
      "PAYROLL_UNLOCKED",
      "PAYROLL_STATUS_CHANGED",
      "SALARY_STRUCTURE_CREATED",
      "SALARY_STRUCTURE_UPDATED",
      "SALARY_STRUCTURE_ARCHIVED",
      "ADJUSTMENT_ADDED",
      "ADJUSTMENT_REMOVED",
    ],
    required: true,
  },
  payroll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payroll",
    default: null,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  oldValue: {
    type: Schema.Types.Mixed,
    default: null,
  },
  newValue: {
    type: Schema.Types.Mixed,
    default: null,
  },
  description: {
    type: String,
    default: "",
  },
}, { timestamps: true });

// Index for fast queries
payrollAuditLogSchema.index({ payroll: 1, createdAt: -1 });
payrollAuditLogSchema.index({ employee: 1, createdAt: -1 });
payrollAuditLogSchema.index({ performedBy: 1, createdAt: -1 });

const PayrollAuditLog = mongoose.model("PayrollAuditLog", payrollAuditLogSchema);
module.exports = PayrollAuditLog;
