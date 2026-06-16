const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentName: { type: String, required: true },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: { type: String, default: null },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    budget: {
      annual: { type: Number, default: 0 },
      used: { type: Number, default: 0 }
    },
    skills: [{ type: String }],
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
