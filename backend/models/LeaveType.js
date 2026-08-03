const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    sparse: true,
    trim: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    enum: ["Paid", "Unpaid"],
    required: true,
  },
  accrualType: {
    type: String,
    enum: ["Monthly", "Yearly", "One-Time"],
    required: true,
  },
  monthlyCreditOn: {
    type: String,
    enum: ["First day of month", "Last working day", "Custom Date"],
    default: "First day of month",
  },
  customCreditDate: {
    type: Number,
    min: [1, "Custom date must be between 1 and 28"],
    max: [28, "Custom date must be between 1 and 28"],
  },
  initializationMode: {
    type: String,
    enum: ["From Today", "Pro-rated", "Full Allocation"],
    default: "Full Allocation", // Defines how existing employees receive this leave type
  },
  allocation: {
    type: Number,
    required: true,
    min: [0, "Allocation cannot be negative"],
  },
  maxBalance: {
    type: Number,
    min: [0, "Max Balance cannot be negative"],
  },
  carryForward: {
    type: Boolean,
    default: false,
  },
  maxCarryForwardDays: {
    type: Number,
    min: [0, "Max Carry Forward Days cannot be negative"],
  },
  allowNegativeBalance: {
    type: Boolean,
    default: false,
  },
  encashment: {
    type: Boolean,
    default: false,
  },
  requireApproval: {
    type: Boolean,
    default: true,
  },
  requireSupportingDocument: {
    type: Boolean,
    default: false,
  },
  minimumNoticePeriod: {
    type: Number,
    min: [0, "Minimum Notice Period cannot be negative"],
  },
  maxConsecutiveDays: {
    type: Number,
    min: [0, "Max Consecutive Days cannot be negative"],
  },
  allowHalfDay: {
    type: Boolean,
    default: true,
  },
  countWeekends: {
    type: Boolean,
    default: false,
  },
  countHolidays: {
    type: Boolean,
    default: false,
  },
  probationEligibility: {
    type: Boolean,
    default: false,
  },
  genderRestriction: {
    type: String,
    enum: ["All", "Male", "Female"],
    default: "All",
  },
  employmentType: {
    type: [String],
    default: ["All"],
  },
  departments: {
    type: [String],
    default: ["All"],
  },
  designations: {
    type: [String],
    default: ["All"],
  },
  payrollImpact: {
    type: String,
    enum: ["Paid Leave", "Unpaid Leave", "Half Paid Leave"],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
}, { timestamps: true });

leaveTypeSchema.index({ name: 1, company: 1 }, { unique: true });
leaveTypeSchema.index({ code: 1, company: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("LeaveType", leaveTypeSchema);
