const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Shift = require('../models/Shift');
const User = require('../models/User');
const Company = require('../models/Company');
const Counter = require('../models/Counter');
const { createCompanyRecord, findOneCompanyRecord } = require('../utils/tenantUtils');
const { notify } = require('../utils/notificationService');
const { initializeLeaveBalance } = require('../controllers/leaveController');
const { generateTempPassword, hashPassword } = require('../imports/employeeCredentialGenerator');

const normalizeEmail = (value) => (value || '').trim().toLowerCase();

const createEmployeeAccount = async ({ employeeData, req, companyId, role = 'employee', reqFile = null, tempPassword: providedTempPassword = null }) => {
  if (!employeeData.email || !employeeData.firstName || !employeeData.lastName) {
    const error = new Error('Email, First Name, and Last Name are required to create a system account.');
    error.statusCode = 400;
    throw error;
  }

  if (!companyId) {
    const error = new Error('Company context is missing from the session.');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    const error = new Error('Invalid Company ID format.');
    error.statusCode = 400;
    throw error;
  }

  const existingCompany = await Company.findOne({ _id: companyId, isDeleted: { $ne: true } });
  if (!existingCompany) {
    const error = new Error('Company not found or suspended.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = normalizeEmail(employeeData.email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error(`User with email "${employeeData.email}" already exists.`);
    error.statusCode = 409;
    throw error;
  }

  if (employeeData.department) {
    const dept = await findOneCompanyRecord(Department, { _id: employeeData.department }, companyId);
    if (!dept) {
      const error = new Error('Invalid Department for this company.');
      error.statusCode = 400;
      throw error;
    }
  }

  if (employeeData.shift) {
    const shiftObj = await findOneCompanyRecord(Shift, { _id: employeeData.shift }, companyId);
    if (!shiftObj) {
      const error = new Error('Invalid Shift for this company.');
      error.statusCode = 400;
      throw error;
    }
  }

  const counter = await Counter.findOneAndUpdate(
    { id: 'employeeId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const employeePayload = { ...employeeData };
  employeePayload.email = normalizedEmail;
  employeePayload.employeeId = `EMP-${String(counter.seq).padStart(5, '0')}`;
  employeePayload.company = companyId;

  if (reqFile) {
    employeePayload.url = reqFile.secure_url;
    employeePayload.public_id = reqFile.public_id;
  }

  const employee = await createCompanyRecord(Employee, employeePayload, companyId);
  const tempPassword = providedTempPassword || generateTempPassword();
  const hashedPassword = await hashPassword(tempPassword);

  const newUser = new User({
    firstName: employeePayload.firstName.trim(),
    lastName: employeePayload.lastName.trim(),
    email: employeePayload.email,
    password: hashedPassword,
    role,
    department: employeePayload.department,
    designation: employeePayload.designation,
    phoneNumber: employeePayload.mobile,
    joiningDate: employeePayload.doj,
    employeeId: employeePayload.employeeId,
    company: existingCompany._id,
    createdBy: req?.user ? req.user.userId : null,
    isActive: true,
    isFirstLogin: true,
    isVerified: true,
  });

  await newUser.save();

  employee.user = newUser._id;
  await employee.save();

  await initializeLeaveBalance(employee._id);

  await notify({
    recipient: newUser._id,
    sender: req?.user ? req.user.userId : null,
    title: 'Welcome to HRMS!',
    message: 'Your employee profile and login credentials have been generated. Welcome aboard!',
    type: 'employee',
    module: 'employee_management',
    link: '/employee/profile',
  }).catch(() => {});

  return { employee, user: newUser, tempPassword, company: existingCompany };
};

module.exports = { createEmployeeAccount };