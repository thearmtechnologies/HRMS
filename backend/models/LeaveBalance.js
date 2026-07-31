const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema({
  available: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  carryForward: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  assignedDate: { type: Date, default: null },
  deactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  deactivatedDate: { type: Date, default: null },
  remarks: { type: String, default: "" }
}, { _id: false });

const leaveTransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["Credit", "Debit", "Reset", "CarryForward"], required: true },
  amount: { type: Number, required: true },
  leaveType: { type: String, required: true },
  reason: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null } // null means system/auto
}, { _id: false });

const leaveBalanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
    unique: true
  },
  casualLeave: { type: balanceSchema, default: () => ({}) },
  sickLeave: { type: balanceSchema, default: () => ({}) },
  earnedLeave: { type: balanceSchema, default: () => ({}) },
  compOff: { type: balanceSchema, default: () => ({}) },
  unpaidLeave: { // only tracks used, total/available is infinity basically
    used: { type: Number, default: 0 }
  },
  wfh: { // tracks taken WFH days
    used: { type: Number, default: 0 }
  },
  dynamicBalances: {
    type: Map,
    of: balanceSchema,
    default: {}
  },
  transactions: [leaveTransactionSchema]
}, { timestamps: true });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
