const mongoose = require("mongoose");

const projectWorkLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: ["Daily Status Update", "Blocker", "Tech Issue"],
      default: "Daily Status Update",
    },
    note: {
      type: String,
      required: true,
    },
    hoursWorked: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProjectWorkLog", projectWorkLogSchema);
