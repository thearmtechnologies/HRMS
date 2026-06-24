const mongoose = require("mongoose");
const Counter = require("./Counter");

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "On Hold", "Completed", "Cancelled", "Archived"],
      default: "Planning",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate projectCode and auto-complete progress
projectSchema.pre("validate", async function (next) {
  if (this.isNew && !this.projectCode) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "projectId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.projectCode = `PRJ-${String(counter.seq).padStart(5, "0")}`;
    } catch (error) {
      return next(error);
    }
  }

  // Ensure progress is 100 if completed
  if (this.status === "Completed") {
    this.progressPercentage = 100;
  }

  // Ensure end date is after start date
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error("End date must be after or equal to start date."));
  }

  next();
});

module.exports = mongoose.model("Project", projectSchema);
