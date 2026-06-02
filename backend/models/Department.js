const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    departmentName: { type: String, required: true },
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
