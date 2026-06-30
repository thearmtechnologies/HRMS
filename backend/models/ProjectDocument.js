const mongoose = require("mongoose");

const projectDocumentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProjectDocument", projectDocumentSchema);
