const mongoose = require("mongoose");

const projectMilestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
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
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-complete progress if status is Completed
projectMilestoneSchema.pre("save", function (next) {
  if (this.status === "Completed") {
    this.progress = 100;
  }
  next();
});

module.exports = mongoose.model("ProjectMilestone", projectMilestoneSchema);
