const mongoose = require('mongoose');

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
    enum: ['admin', 'hr', 'project_manager', 'department_manager', 'employee'],
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

