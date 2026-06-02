const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  tradeId: { type: String },
  employeeName: { type: String },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
  designation: String,
  doj: Date,
  email: String,
  gender: String,
  dob: Date,
  mobile: String,
  pan: String,
  aadhaar: String,
  bloodGroup: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  bankName: String,
  branch: String,
  accountNo: String,
  ifscCode: String,
  kinName: String,
  relationship: String,
  kinAddress: String,
  kinPhone: String,
  employeeSignature: String,
  annualSalary: String,
  url: String,
  public_id: String,
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;



