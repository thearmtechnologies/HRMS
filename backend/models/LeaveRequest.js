const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // for future workflow
  leaveType: {
    type: String,
    enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Comp Off", "Unpaid Leave", "Work From Home"],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  isHalfDay: { type: Boolean, default: false },
  reason: { type: String, required: true },
  isEmergency: { type: Boolean, default: false },
  attachmentUrl: { type: String, default: null }, // from cloudinary
  
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Cancelled"],
    default: "Pending"
  },
  hrRemarks: { type: String, default: "" },
  rejectionReason: { type: String, default: "" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  approvedDate: { type: Date, default: null },
  
  source: {
    type: String,
    enum: ["Employee Request", "WhatsApp", "Email", "Phone Call", "Manager Approval", "HR Entry"],
    default: "Employee Request"
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // could be employee themselves or HR
}, { timestamps: true });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
