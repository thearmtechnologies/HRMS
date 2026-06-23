const mongoose = require("mongoose");
const { Schema } = mongoose;

const adjustmentSchema = new Schema({
    type: {
        type: String,
        enum: ["Bonus", "Incentive", "Reimbursement", "Penalty", "Salary Correction"],
        required: true,
    },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedAt: { type: Date, default: Date.now },
}, { _id: true });

const salarySnapshotSchema = new Schema({
    basicMonthly: { type: Number, default: 0 },
    hraMonthly: { type: Number, default: 0 },
    caMonthly: { type: Number, default: 0 },
    maMonthly: { type: Number, default: 0 },
    saMonthly: { type: Number, default: 0 },
    grossMonthly: { type: Number, default: 0 },
    bonusMonthly: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    employeePFMonthly: { type: Number, default: 0 },
    employerPFMonthly: { type: Number, default: 0 },
    esiEmployee: { type: Number, default: 0 },
    esiEmployer: { type: Number, default: 0 },
    taxMonthly: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    otherDed: { type: Number, default: 0 },
}, { _id: false });

const payrollSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },

    // Status workflow: Draft → Generated → Approved → Paid
    status: {
        type: String,
        enum: ["Draft", "Generated", "Approved", "Paid"],
        default: "Draft",
    },
    isLocked: { type: Boolean, default: false },

    // Attendance summary
    totalDays: { type: Number, required: true },
    workingDays: { type: Number, required: true },
    present: { type: Number, required: true },
    absent: { type: Number, required: true },
    cl: { type: Number, default: 0 },
    finalPresent: { type: Number, required: true },
    finalAbsent: { type: Number, required: true },
    sundays: { type: Number, default: 0 },
    holidays: { type: Number, default: 0 },
    payableDays: { type: Number, required: true },
    attendancePercentage: { type: Number, default: 0 },

    // Overtime
    overtimeHours: { type: Number, default: 0 },
    overtimeAmount: { type: Number, default: 0 },

    // Leave breakdown
    paidLeaveDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    halfDayCount: { type: Number, default: 0 },
    leaveDeduction: { type: Number, default: 0 },

    // Salary
    grossSalary: { type: Number, required: true },
    earnings: { type: Number, required: true },
    professionalTax: { type: Number, default: 0 },
    otherDed: { type: Number, default: 0 },
    arrears: { type: Number, default: 0 },
    netPay: { type: Number, required: true },

    // Manual adjustments (Bonus, Penalty, etc.)
    adjustments: [adjustmentSchema],

    // Salary structure snapshot (for historical accuracy)
    salaryStructureSnapshot: { type: salarySnapshotSchema, default: () => ({}) },

    // Tracking
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },

    // Email tracking
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date, default: null },
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
const Payroll = mongoose.model("Payroll", payrollSchema);

module.exports = Payroll;


