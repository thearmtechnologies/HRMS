const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    site: {
      type: String,
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    designation: {
      type: String,
      required: true,
      default: null,
    },

    doj: {
      type: Date,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    gender: {
      type: String,
      default: null,
      enum: ["Male", "Female", "Other", null],
    },

    dob: {
      type: Date,
      default: null,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    pan: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    aadhaar: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    bloodGroup: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      default: null,
    },

    state: {
      type: String,
      default: null,
    },

    pincode: {
      type: String,
      default: null,
    },

    bankName: {
      type: String,
      default: null,
    },

    branch: {
      type: String,
      default: null,
    },

    accountNo: {
      type: String,
      default: null,
    },

    ifscCode: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },

    kinName: {
      type: String,
      default: null,
    },

    relationship: {
      type: String,
      default: null,
    },

    kinAddress: {
      type: String,
      default: null,
    },

    kinPhone: {
      type: String,
      default: null,
    },

    employeeSignature: {
      type: String,
      default: null,
    },

    annualSalary: {
      type: Number,
      default: null,
      min: 0,
    },

    url: {
      type: String,
      default: null,
    },

    public_id: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "Resigned", "Terminated"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);