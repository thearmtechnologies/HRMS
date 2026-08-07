const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Shift = require('../models/Shift');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { findCompanyRecords } = require('../utils/tenantUtils');
const { normalizeLower, normalizeString, normalizeLookupKey, normalizeDate } = require('./employeeImportHelper');

const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/;

const buildLookupMap = (records, key = 'name') => {
  const map = new Map();
  records.forEach((record) => {
    const value = normalizeLookupKey(record[key] || record.departmentName || record.name || record.siteName);
    if (value) map.set(value, record);
  });
  return map;
};

const validateEmployeeImportRows = async (rows, companyId) => {
  const departments = await findCompanyRecords(Department, {}, companyId);
  const designations = await findCompanyRecords(Designation, { isActive: { $ne: false } }, companyId);
  const shifts = await findCompanyRecords(Shift, {}, companyId);

  const departmentMap = buildLookupMap(departments, 'departmentName');
  const designationMap = buildLookupMap(designations, 'name');
  const shiftMap = buildLookupMap(shifts, 'name');

  const emailCounts = new Map();
  rows.forEach((row) => {
    const email = normalizeLower(row.email);
    if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
  });

  const emailList = [...emailCounts.keys()];
  const existingUsers = await User.find({ email: { $in: emailList } }).select('email');
  const existingEmployees = await Employee.find({ company: companyId, email: { $in: emailList } }).select('email');
  const existingEmailSet = new Set([
    ...existingUsers.map((user) => normalizeLower(user.email)),
    ...existingEmployees.map((employee) => normalizeLower(employee.email)),
  ]);

  const validatedRows = [];
  const invalidRows = [];

  for (const row of rows) {
    const errors = [];
    const firstName = normalizeString(row.firstName);
    const lastName = normalizeString(row.lastName);
    const email = normalizeLower(row.email);
    const phone = normalizeString(row.phone);
    const gender = normalizeString(row.gender);
    const doj = normalizeDate(row.doj);
    const dob = normalizeDate(row.dob);
    const department = normalizeLookupKey(row.department);
    const designation = normalizeLookupKey(row.designation);
    const shift = normalizeLookupKey(row.shift);
    const workLocation = normalizeString(row.workLocation);
    const rawEmploymentType = normalizeString(row.employmentType);
    const reportingManager = normalizeString(row.reportingManager);

    // Normalize gender to title case to match Mongoose enum: Male, Female, Other
    const GENDER_MAP = { 'male': 'Male', 'female': 'Female', 'other': 'Other' };
    const normalizedGender = gender ? (GENDER_MAP[gender.toLowerCase()] || gender) : null;

    // Normalize employment type to match expected values
    const EMPLOYMENT_TYPE_MAP = {
      'full-time': 'Full-time', 'fulltime': 'Full-time', 'full time': 'Full-time',
      'part-time': 'Part-time', 'parttime': 'Part-time', 'part time': 'Part-time',
      'contract': 'Contract',
      'intern': 'Intern', 'internship': 'Intern',
    };
    const employmentType = rawEmploymentType ? (EMPLOYMENT_TYPE_MAP[rawEmploymentType.toLowerCase()] || rawEmploymentType) : 'Full-time';

    if (!firstName) errors.push('First Name is required');
    if (!lastName) errors.push('Last Name is required');
    if (!email) errors.push('Work Email is required');
    if (!phone) errors.push('Phone is required');
    if (!doj || Number.isNaN(doj.getTime())) errors.push('Joining Date is invalid');
    if (!department) errors.push('Department is required');
    if (!designation) errors.push('Designation is required');
    if (!shift) errors.push('Shift is required');
    if (!workLocation) errors.push('Work Location is required');
    if (phone && !PHONE_REGEX.test(phone)) errors.push('Phone number is invalid');
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push('Email is invalid');
    if (dob && Number.isNaN(dob.getTime())) errors.push('Date of Birth is invalid');
    if (dob && dob > new Date()) errors.push('Date of Birth cannot be in the future');
    if (normalizedGender && !['Male', 'Female', 'Other'].includes(normalizedGender)) errors.push('Gender must be Male, Female, or Other');
    if (employmentType && !['Full-time', 'Part-time', 'Contract', 'Intern'].includes(employmentType)) errors.push('Employment Type must be Full-time, Part-time, Contract, or Intern');

    if (email) {
      const count = emailCounts.get(email) || 0;
      if (count > 1) errors.push('Duplicate Email inside Excel');
      if (existingEmailSet.has(email)) errors.push('Email already exists');
    }

    if (department && !departmentMap.has(department)) errors.push('Department does not exist');
    if (designation && !designationMap.has(designation)) errors.push('Designation does not exist');
    if (shift && !shiftMap.has(shift)) errors.push('Shift does not exist');

    let reportingManagerId = null;
    if (reportingManager) {
      const normalizedManager = normalizeLookupKey(reportingManager);
      const managerUser = await User.findOne({
        $or: [
          { email: normalizeLower(reportingManager) },
          { employeeId: reportingManager },
        ],
      }).select('_id');

      if (managerUser) {
        reportingManagerId = managerUser._id;
      } else {
        const managerEmployees = await Employee.find({ company: companyId }).select('user employeeId fullName');
        const managerEmployee = managerEmployees.find((employee) =>
          normalizeLookupKey(employee.employeeId) === normalizedManager ||
          normalizeLookupKey(employee.fullName) === normalizedManager
        );

        if (managerEmployee?.user) {
          reportingManagerId = managerEmployee.user;
        } else {
          errors.push('Reporting Manager does not exist');
        }
      }
    }

    const resolvedRow = {
      ...row,
      firstName,
      lastName,
      email,
      phone,
      gender: normalizedGender,
      dob: dob && !Number.isNaN(dob.getTime()) ? dob : null,
      doj,
      department: departmentMap.get(department)?._id,
      designation: designationMap.get(designation)?.name,
      shift: shiftMap.get(shift)?._id,
      reportingManager: reportingManagerId,
      employmentType: employmentType || 'Full-time',
      workLocation,
    };

    if (errors.length) {
      invalidRows.push({ rowNumber: row.rowNumber, row: resolvedRow, errors });
    } else {
      validatedRows.push(resolvedRow);
    }
  }

  return { validatedRows, invalidRows };
};

module.exports = { validateEmployeeImportRows };