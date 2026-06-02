const mongoose = require("mongoose");
const { Schema } = mongoose;

const payrollSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    
    totalDays: { type: Number, required: true },
    workingDays: { type: Number, required: true },
    present: { type: Number, required: true },
    absent: { type: Number, required: true },
    cl: { type: Number, default: 0 },
    finalPresent: { type: Number, required: true },
    finalAbsent: { type: Number, required: true },
    sundays: { type: Number, default: 0 },
    holidays: { type: Number, default: 0 },
    payableDays: { type: Number, required: true },
    attendancePercentage: { type: Number, default: 0 },
   
    grossSalary: { type: Number, required: true },
    earnings: { type: Number, required: true },
    professionalTax: { type: Number, default: 0 },
    otherDed: { type: Number, default: 0 },
    arrears: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
const Payroll = mongoose.model("Payroll", payrollSchema);

module.exports = Payroll;


