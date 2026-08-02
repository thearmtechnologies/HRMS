const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },
  view: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  approve: { type: Boolean, default: false },
  export: { type: Boolean, default: false },
  regularize: { type: Boolean, default: false },
  generate: { type: Boolean, default: false },
  mark_paid: { type: Boolean, default: false },
  assign: { type: Boolean, default: false },
  archive: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String }, // Can be computed pre-save
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'hr', 'employee', 'finance'],
    required: true
  },
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String },
  phoneNumber: { type: String },
  profileImage: { type: String },
  joiningDate: { type: Date },
  isActive: { type: Boolean, default: true },
  isFirstLogin: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: [true, 'Company reference is required'] },
  permissionOverrides: [permissionSchema],
  otp: String,
  otpExpires: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

UserSchema.pre('save', function(next) {
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;

