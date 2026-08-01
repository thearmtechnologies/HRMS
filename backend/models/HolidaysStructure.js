const mongoose = require('mongoose');

// Enterprise Holiday Schema
const HolidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['National', 'Company', 'Regional', 'Optional', 'Festival', 'Emergency Closure'],
        default: 'Company'
    },
    description: {
        type: String,
        default: ''
    },
    startDate: {
        type: String, // YYYY-MM-DD
        required: true
    },
    endDate: {
        type: String, // YYYY-MM-DD
        required: true
    },
    durationType: {
        type: String,
        enum: ['Single Day', 'Multiple Days', 'Half Day'],
        default: 'Single Day'
    },
    halfDayType: {
        type: String,
        enum: ['First Half', 'Second Half', 'Custom Time'],
        default: 'First Half'
    },
    customTime: {
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '13:00' }
    },
    isPaid: {
        type: Boolean,
        default: true
    },
    allowCheckIn: {
        type: Boolean,
        default: true
    },
    repeatEveryYear: {
        type: Boolean,
        default: false
    },
    excludedYears: {
        type: [Number],
        default: []
    },
    excludedDates: {
        type: [String], // YYYY-MM-DD for occurrences deleted/overridden
        default: []
    },
    appliesTo: {
        type: String,
        enum: ['Entire Company', 'Selected Departments', 'Selected Locations', 'Selected Employees'],
        default: 'Entire Company'
    },
    applicableDepartments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }],
    applicableLocations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site'
    }],
    applicableEmployees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    year: {
        type: Number,
        required: true,
        index: true
    }
}, { timestamps: true });

// Legacy schemas for backward compatibility during auto-migration
const HolidayEntrySchema = new mongoose.Schema({
    date: String,
    name: String,
    type: String,
    description: String,
    isPaid: Boolean,
    isActive: Boolean
});

const MonthHolidaySchema = new mongoose.Schema({
    month: String,
    holidays: [HolidayEntrySchema]
}, { _id: false });

const HolidayConfigSchema = new mongoose.Schema({
    year: { type: Number, required: true, unique: true },
    holidays: [MonthHolidaySchema]
}, { timestamps: true });

const Holiday = mongoose.model('Holiday', HolidaySchema);
const HolidayConfig = mongoose.model('HolidayConfig', HolidayConfigSchema);

module.exports = Holiday;
module.exports.Holiday = Holiday;
module.exports.HolidayConfig = HolidayConfig;
