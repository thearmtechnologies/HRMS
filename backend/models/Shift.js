const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Fixed", "Flexible"],
      default: "Fixed",
    },
    startTime: {
      type: String, // e.g. "09:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "18:00"
      required: true,
    },
    weeklyOffDays: {
      type: [String], // e.g. ["Saturday", "Sunday"]
      default: ["Sunday"],
    },
    breakDuration: {
      type: Number, // in hours, e.g. 1
      default: 1,
    },
    isDefault: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shift", shiftSchema);
