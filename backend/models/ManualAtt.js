const mongoose = require("mongoose");

const manualattSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["present", "absent", "first_half", "second_half"],
            default: "absent",
        },

        remarks: { type: String }
    },
    { timestamps: true }
);

manualattSchema.index({ employee: 1, date: 1 }, { unique: true });

const ManualAtt = mongoose.model("ManualAtt", manualattSchema);
module.exports = ManualAtt; 