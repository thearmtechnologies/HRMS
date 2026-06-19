const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Initially false for migration, will become true later
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    fullName: {
      type: String,
      trim: true,
    },

    workLocation: {
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

    personalEmail: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
      default: null,
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

    maritalStatus: {
      type: String,
      default: null,
      enum: ["Single", "Married", "Divorced", "Widowed", "Other", null],
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

    bankStatus: { type: String, enum: ["pending", "verified", "rejected", null], default: null },
    bankVerification: {
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      verifiedAt: { type: Date, default: null },
      remarks: { type: String, default: null }
    },

    documents: {
      pan: {
        number: { type: String, uppercase: true, trim: true, default: null },
      },
      aadhaar: {
        number: { type: String, trim: true, default: null },
      }
    },
    
    panStatus: { type: String, enum: ["pending", "verified", "rejected", null], default: null },
    panVerification: {
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      verifiedAt: { type: Date, default: null },
      remarks: { type: String, default: null }
    },

    aadhaarStatus: { type: String, enum: ["pending", "verified", "rejected", null], default: null },
    aadhaarVerification: {
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      verifiedAt: { type: Date, default: null },
      remarks: { type: String, default: null }
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

    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Intern", null],
      default: "Full-time",
    },

    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
      enum: ["Active", "Inactive", "On Leave", "Resigned", "Terminated"],
      default: "Active",
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.pre('save', function(next) {
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.fullName = `${this.firstName} ${this.lastName || ''}`.trim();
  }
  next();
});

module.exports = mongoose.model("Employee", employeeSchema);