const mongoose = require("mongoose");
const Counter = require("./Counter");

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    taskCode: {
      type: String,
      unique: true,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["BACKLOG", "TODO", "IN_PROGRESS", "CODE_REVIEW", "TESTING", "DONE"],
      default: "TODO",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    spentHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    history: [
      {
        action: { type: String, required: true },
        details: { type: String, default: "" },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Auto-generate task code based on project code
taskSchema.pre("validate", async function (next) {
  if (this.isNew && !this.taskCode && this.project) {
    try {
      // Get the project to use its code
      const Project = mongoose.model("Project");
      const project = await Project.findById(this.project);
      if (project) {
        // Find counter for this specific project
        const counterId = `task_${project._id}`;
        const counter = await Counter.findOneAndUpdate(
          { id: counterId },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        this.taskCode = `${project.projectCode}-${counter.seq}`;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
