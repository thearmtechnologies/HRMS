const mongoose = require("mongoose");

const leaveSettingsSchema = new mongoose.Schema({
  defaultCL: { type: Number, default: 12 },
  defaultSL: { type: Number, default: 8 },
  defaultEL: { type: Number, default: 15 },
  defaultCompOff: { type: Number, default: 0 },
  carryForwardLimitEL: { type: Number, default: 15 }, // Example future setting
  isConfigured: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("LeaveSettings", leaveSettingsSchema);
