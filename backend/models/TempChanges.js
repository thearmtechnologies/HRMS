const mongoose = require("mongoose");

const TempChangesSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },

    cl: { type: Number, default: 0 },
    otherDed: { type: Number, default: 0 },
    arrears: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    
    isEdited: { type: Boolean, default: false },
}, { timestamps: true });

TempChangesSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const TempChanges = mongoose.model("TempChanges", TempChangesSchema);
module.exports = TempChanges;