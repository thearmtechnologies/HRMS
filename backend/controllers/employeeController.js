const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Shift = require("../models/Shift");
const { createCompanyRecord, findCompanyRecords, updateCompanyRecord, deleteCompanyRecord, findOneCompanyRecord } = require("../utils/tenantUtils");
const cloudinary = require("../config/cloudinary");
const ManualAtt = require("../models/ManualAtt");
const Payroll = require("../models/Payroll");
const SalaryFixed = require("../models/SalaryFixed");
const User = require("../models/User");
const Company = require("../models/Company");
const Counter = require("../models/Counter");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { notify } = require("../utils/notificationService");
const { initializeLeaveBalance } = require("./leaveController");

// Time calculation constants
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_DAY =
  MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;
// Email/OTP imports — disabled for now, credentials shown in success modal
// const { generateOtp } = require("../utils/otp");
// const {
//   sendAccountCreationEmail,
//   sendOtpEmail,
// } = require("../config/emailService");

const generateRandomPassword = () => {
  return (
    Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
  );
};

const calculateProfileCompletion = (emp) => {
  const fields = [
    emp.firstName,
    emp.lastName,
    emp.email,
    emp.personalEmail,
    emp.mobile,
    emp.dob,
    emp.gender,
    emp.maritalStatus,
    emp.bloodGroup,
    emp.address,
    emp.city,
    emp.state,
    emp.pincode,
    emp.kinName,
    emp.kinPhone,
    emp.kinAddress,
    emp.relationship,
    emp.documents?.pan?.number,
    emp.documents?.aadhaar?.number,
    emp.bankName || emp.pendingBankDetails?.bankName,
    emp.accountNo || emp.pendingBankDetails?.accountNo,
    emp.ifscCode || emp.pendingBankDetails?.ifscCode,
    emp.branch || emp.pendingBankDetails?.branch,
  ];
  const filled = fields.filter(
    (f) => f !== null && f !== undefined && f !== "",
  ).length;
  return Math.round((filled / fields.length) * 100);
};

const toStringId = (value) => {
  if (!value) return null;
  if (typeof value === "object" && value._id) return value._id.toString();
  return value.toString();
};

const createEmployee = async (req, res) => {
  try {
    let employeeData = req.body;

    if (
      !employeeData.email ||
      !employeeData.firstName ||
      !employeeData.lastName
    ) {
      return res.status(400).json({
        error:
          "Email, First Name, and Last Name are required to create a system account.",
      });
    }

    const companyId = req.company;
    if (!companyId) {
      return res.status(400).json({ error: "Company context is missing from the session." });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: "Invalid Company ID format." });
    }

    const existingCompany = await Company.findOne({ _id: companyId, isDeleted: { $ne: true } });
    if (!existingCompany) {
      return res.status(400).json({ error: "Company not found or suspended." });
    }

    // Duplicate check in User
    const existingUser = await User.findOne({ email: employeeData.email });
    if (existingUser) {
      return res.status(409).json({
        error: `User with email "${employeeData.email}" already exists.`,
      });
    }

    // Auto-generate employeeId using Counter collection
    const counter = await Counter.findOneAndUpdate(
      { id: "employeeId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    employeeData.employeeId = `EMP-${String(counter.seq).padStart(5, "0")}`;

    // Cloudinary image (multer-storage-cloudinary)
    if (req.file) {
      employeeData.url = req.file.secure_url;
      employeeData.public_id = req.file.public_id;
    }

    employeeData.company = companyId;

    
    if (employeeData.department) {
      const dept = await findOneCompanyRecord(Department, { _id: employeeData.department }, companyId);
      if (!dept) return res.status(400).json({ error: "Invalid Department for this company." });
    }
    if (employeeData.shift) {
      const shiftObj = await findOneCompanyRecord(Shift, { _id: employeeData.shift }, companyId);
      if (!shiftObj) return res.status(400).json({ error: "Invalid Shift for this company." });
    }
    const employee = await createCompanyRecord(Employee, employeeData, companyId);
    

    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    const newUser = new User({
      firstName: employeeData.firstName.trim(),
      lastName: employeeData.lastName.trim(),
      email: employeeData.email,
      password: hashedPassword,
      role: req.body.role || "employee",
      department: employeeData.department,
      designation: employeeData.designation,
      phoneNumber: employeeData.mobile,
      joiningDate: employeeData.doj,
      employeeId: employeeData.employeeId,
      company: existingCompany._id,
      createdBy: req.user ? req.user.userId : null,
      isActive: true,
      isFirstLogin: true,
      isVerified: true, // Auto-verified when created by Admin/HR
    });

    await newUser.save();

    // Link the created User to the Employee
    employee.user = newUser._id;
    await employee.save();

    // Automatically initialize leave balances based on active Leave Templates
    await initializeLeaveBalance(employee._id);

    // Email sending disabled for now — credentials shown in success modal only
    // sendAccountCreationEmail(newUser.email, firstName, randomPassword).catch(
    //   (err) => console.error("❌ Account creation email failed:", err),
    // );

    await notify({
      recipient: newUser._id,
      sender: req.user ? req.user.userId : null,
      title: "Welcome to HRMS!",
      message: `Your employee profile and login credentials have been generated. Welcome aboard!`,
      type: "employee",
      module: "employee_management",
      link: "/employee/profile",
    }).catch(() => {});

    res.status(201).json({
      message: "Employee and User account created successfully.",
      employee,
      user: { id: newUser._id, email: newUser.email },
      // Return temp password so Admin/HR can share credentials via success modal
      tempPassword: randomPassword,
    });
  } catch (error) {
    console.error("❌ Error creating employee:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    if (error.code === 11000) {
      let field = Object.keys(error.keyValue)[0];
      let value = error.keyValue[field];

      if (field === "tradeId") field = "employeeId";

      // If the duplicate value is null/empty, it's a stale index issue — not a real duplicate
      if (value === null || value === undefined || value === "") {
        return res.status(500).json({
          error: `A database index issue occurred. Please contact the administrator.`,
        });
      }

      const fieldLabels = {
        email: "Email address",
        mobile: "Phone number",
        pan: "PAN number",
        aadhaar: "Aadhaar number",
        employeeId: "Employee ID",
        accountNo: "Bank account number",
      };

      const label = fieldLabels[field] || field;

      return res.status(409).json({
        error: `An employee with the ${label} "${value}" already exists. Please use a different one.`,
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

const updateEmployeeImage = async (req, res) => {
  try {
    const requestedEmployeeId = req.params.id;

    const requestedEmployee = await findOneCompanyRecord(Employee, { _id: requestedEmployeeId }, req.company);
    if (!requestedEmployee)
      return res.status(404).json({ error: "Employee not found" });

    const requestedUserId = toStringId(requestedEmployee.user);
    const userEmail = (req.user.email || "").toLowerCase();
    const employeeEmail = (requestedEmployee.email || "").toLowerCase();
    const personalEmail = (requestedEmployee.personalEmail || "").toLowerCase();
    const isSelf =
      (requestedUserId && requestedUserId === req.user.userId) ||
      (employeeEmail && employeeEmail === userEmail) ||
      (personalEmail && personalEmail === userEmail);

    if (!isSelf && req.user.role !== "admin" && req.user.role !== "hr") {
      return res
        .status(403)
        .json({
          error: "Access denied. You can only update your own profile photo.",
        });
    }

    // Repair the link if it is missing so future self-service requests stay consistent.
    if (isSelf && (!requestedUserId || requestedUserId !== req.user.userId)) {
      requestedEmployee.user = req.user.userId;
    }

    if (requestedEmployee.public_id) {
      await cloudinary.uploader.destroy(requestedEmployee.public_id);
    }
    requestedEmployee.url = req.file.path;
    requestedEmployee.public_id = req.file.filename;

    await requestedEmployee.save();

    if (requestedEmployee.user || requestedEmployee.email) {
      await User.findOneAndUpdate(
        {
          $or: [
            { _id: requestedEmployee.user },
            { email: requestedEmployee.email },
          ],
        },
        { profileImage: req.file.path },
      );
    }

    res
      .status(200)
      .json({
        message: "Image updated successfully",
        employee: requestedEmployee,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateCurrentEmployeeImage = async (req, res) => {
  try {
    const userEmail = (req.user.email || "").toLowerCase();
    const employee = await findOneCompanyRecord(Employee, {
      $or: [
        { user: req.user.userId },
        { email: userEmail },
        { personalEmail: userEmail },
      ],
    }, req.company);

    if (!employee) {
      return res
        .status(404)
        .json({ error: "Employee profile not found for this user." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }

    if (employee.public_id) {
      await cloudinary.uploader.destroy(employee.public_id);
    }
    employee.url = req.file.path;
    employee.public_id = req.file.filename;

    const empUserId = toStringId(employee.user);
    if (!empUserId || empUserId !== req.user.userId) {
      employee.user = req.user.userId;
    }

    await employee.save();

    await User.findOneAndUpdate(
      { $or: [{ _id: req.user.userId }, { email: employee.email }] },
      { profileImage: req.file.path },
    );

    res
      .status(200)
      .json({ message: "Profile photo updated successfully", employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const uploadEmployeeDocument = async (req, res) => {
  try {
    const docType = (req.params.docType || "").toLowerCase();
    if (docType !== "pan" && docType !== "aadhaar") {
      return res
        .status(400)
        .json({ error: "Invalid document type. Must be 'pan' or 'aadhaar'." });
    }

    let employee;
    if (req.params.id && req.params.id !== "me") {
      employee = await findOneCompanyRecord(Employee, { _id: req.params.id }, req.company);
    } else {
      const userEmail = (req.user.email || "").toLowerCase();
      employee = await findOneCompanyRecord(Employee, {
        $or: [
          { user: req.user.userId },
          { email: userEmail },
          { personalEmail: userEmail },
        ],
      }, req.company);
    }

    if (!employee) {
      return res.status(404).json({ error: "Employee not found." });
    }

    const empUserId = toStringId(employee.user);
    const userEmail = (req.user.email || "").toLowerCase();
    const employeeEmail = (employee.email || "").toLowerCase();
    const personalEmail = (employee.personalEmail || "").toLowerCase();
    const isSelf =
      (empUserId && empUserId === req.user.userId) ||
      (employeeEmail && employeeEmail === userEmail) ||
      (personalEmail && personalEmail === userEmail);

    if (!isSelf && req.user.role !== "admin" && req.user.role !== "hr") {
      return res
        .status(403)
        .json({
          error: "Access denied. You can only upload your own documents.",
        });
    }

    const currentStatus =
      docType === "pan" ? employee.panStatus : employee.aadhaarStatus;
    if (
      currentStatus === "verified" &&
      req.user.role !== "admin" &&
      req.user.role !== "hr"
    ) {
      return res
        .status(403)
        .json({
          error: `Cannot upload or replace ${docType.toUpperCase()} document as it is already verified.`,
        });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No document file provided." });
    }

    if (!employee.documents) employee.documents = {};
    if (!employee.documents[docType]) employee.documents[docType] = {};

    if (employee.documents[docType].publicId) {
      await cloudinary.uploader.destroy(employee.documents[docType].publicId);
    }

    employee.documents[docType].fileUrl = req.file.path;
    employee.documents[docType].publicId = req.file.filename;
    employee.documents[docType].originalName = req.file.originalname;
    employee.documents[docType].mimeType = req.file.mimetype;
    employee.documents[docType].uploadedAt = new Date();

    if (docType === "pan") {
      employee.panStatus = "pending";
      employee.panVerification = {
        verifiedBy: null,
        verifiedAt: null,
        remarks: null,
      };
    } else {
      employee.aadhaarStatus = "pending";
      employee.aadhaarVerification = {
        verifiedBy: null,
        verifiedAt: null,
        remarks: null,
      };
    }

    if (isSelf && (!empUserId || empUserId !== req.user.userId)) {
      employee.user = req.user.userId;
    }

    await employee.save();

    res
      .status(200)
      .json({
        message: `${docType.toUpperCase()} document uploaded successfully`,
        employee,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getEmployees = async (req, res) => {
  try {
    const filter = {};
    if (req.query.employeeId) {
      filter.employeeId = req.query.employeeId;
    }
    const employees = await Employee.find(filter).populate(
      "department",
      "departmentName",
    );
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEmployeeDataById = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await findOneCompanyRecord(
      Employee, 
      { _id: employeeId }, 
      req.company,
      [
        { path: "department", select: "departmentName" },
        { path: "user", select: "role permissionOverrides" },
        { path: "shift" },
        { path: "shiftHistory.shift" },
        { path: "shiftHistory.assignedBy", select: "firstName lastName email" }
      ]
    );
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Ownership check
    const empUserId = employee.user?._id
      ? employee.user._id.toString()
      : employee.user?.toString();
    const isSelf =
      (empUserId && empUserId === req.user.userId) ||
      (employee.email &&
        req.user.email &&
        employee.email.toLowerCase() === req.user.email.toLowerCase()) ||
      (employee.personalEmail &&
        req.user.email &&
        employee.personalEmail.toLowerCase() === req.user.email.toLowerCase());

    if (!isSelf && req.user.role !== "admin" && req.user.role !== "hr") {
      return res
        .status(403)
        .json({ error: "Access denied. Cannot view another employee's data." });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmployeeAdmin = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedData = { ...req.body };
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === "") updatedData[key] = null;
    });

    if (updatedData.department) {
      const dept = await findOneCompanyRecord(Department, { _id: updatedData.department }, req.company);
      if (!dept) return res.status(400).json({ error: "Invalid Department for this company." });
    }
    if (updatedData.shift) {
      const shiftObj = await findOneCompanyRecord(Shift, { _id: updatedData.shift }, req.company);
      if (!shiftObj) return res.status(400).json({ error: "Invalid Shift for this company." });
    }

    let employee = await updateCompanyRecord(Employee, employeeId, req.company, updatedData, { new: true });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Update profile completion percentage
    employee.profileCompletion = calculateProfileCompletion(employee);
    employee.profileCompleted = employee.profileCompletion === 100;
    await employee.save();

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmployeeSelf = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const allowedFields = [
      "mobile",
      "personalEmail",
      "gender",
      "dob",
      "bloodGroup",
      "address",
      "city",
      "state",
      "pincode",
      "maritalStatus",
      "kinName",
      "relationship",
      "kinAddress",
      "kinPhone",
      "profileImage",
    ];

    let employee = await findOneCompanyRecord(Employee, { _id: employeeId }, req.company);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Strict ownership validation
    const empUserId = employee.user?._id
      ? employee.user._id.toString()
      : employee.user?.toString();
    const isSelf =
      (empUserId && empUserId === req.user.userId) ||
      (employee.email &&
        req.user.email &&
        employee.email.toLowerCase() === req.user.email.toLowerCase()) ||
      (employee.personalEmail &&
        req.user.email &&
        employee.personalEmail.toLowerCase() === req.user.email.toLowerCase());

    if (!isSelf && req.user.role !== "admin" && req.user.role !== "hr") {
      return res
        .status(403)
        .json({
          error: "Access denied. You can only update your own profile.",
        });
    }

    // Repair link if mismatched
    if (isSelf && (!empUserId || empUserId !== req.user.userId)) {
      employee.user = req.user.userId;
    }

    const updatedData = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updatedData[key] = req.body[key] === "" ? null : req.body[key];
      }
    });

    Object.assign(employee, updatedData);

    // Handle Bank Details
    if (req.body.bankDetails) {
      if (req.body.bankDetails.bankName !== undefined)
        employee.bankName = req.body.bankDetails.bankName;
      if (req.body.bankDetails.branch !== undefined)
        employee.branch = req.body.bankDetails.branch;
      if (req.body.bankDetails.accountNo !== undefined)
        employee.accountNo = req.body.bankDetails.accountNo;
      if (req.body.bankDetails.ifscCode !== undefined)
        employee.ifscCode = req.body.bankDetails.ifscCode;

      employee.bankStatus = "pending";
      employee.bankVerification = {
        verifiedBy: null,
        verifiedAt: null,
        remarks: null,
      };
    }

    // Handle PAN / Aadhaar (Documents)
    if (req.body.documents) {
      if (!employee.documents) employee.documents = {};

      if (req.body.documents.pan && req.body.documents.pan.number) {
        if (employee.panStatus !== "verified") {
          if (!employee.documents.pan) employee.documents.pan = {};
          employee.documents.pan.number = req.body.documents.pan.number;
          employee.panStatus = "pending";
          employee.panVerification = {
            verifiedBy: null,
            verifiedAt: null,
            remarks: null,
          };
        }
      }

      if (req.body.documents.aadhaar && req.body.documents.aadhaar.number) {
        if (employee.aadhaarStatus !== "verified") {
          if (!employee.documents.aadhaar) employee.documents.aadhaar = {};
          employee.documents.aadhaar.number = req.body.documents.aadhaar.number;
          employee.aadhaarStatus = "pending";
          employee.aadhaarVerification = {
            verifiedBy: null,
            verifiedAt: null,
            remarks: null,
          };
        }
      }
    }

    employee.profileCompletion = calculateProfileCompletion(employee);
    employee.profileCompleted = employee.profileCompletion === 100;

    await employee.save();

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEmployeeProfileMe = async (req, res) => {
  try {
    const employee = await findOneCompanyRecord(Employee, {
      $or: [{ user: req.user.userId }, { email: req.user.email }],
    }).populate("department", "departmentName");

    if (!employee)
      return res
        .status(404)
        .json({ error: "Employee profile not found for this user." });

    // Auto-link user to employee if it's missing or mismatched
    const empUserId = employee.user?._id
      ? employee.user._id.toString()
      : employee.user?.toString();
    if (!empUserId || empUserId !== req.user.userId) {
      employee.user = req.user.userId;
      await employee.save();
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedEmployee = await updateCompanyRecord(Employee, employeeId, req.company, { status: "Terminated" }, { new: true });
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Also disable the user account
    await User.findOneAndUpdate(
      { employeeId: updatedEmployee.employeeId },
      { isActive: false },
    );

    res.status(200).json({ message: "Employee terminated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const getBirthdayThisYear = (dob) => {
  const today = new Date();
  const thisYear = today.getFullYear();
  let birthdayThisYear = new Date(dob);
  birthdayThisYear.setFullYear(thisYear);

  if (dob.getDate() === 29 && dob.getMonth() === 1 && !isLeapYear(thisYear)) {
    birthdayThisYear.setDate(28);
  }
  return birthdayThisYear;
};

const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const getSortedBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const allEmployees = await Employee.find({});

    const upcoming = [];
    const recent = [];

    allEmployees.forEach((emp) => {
      if (!emp.dob) return; // skip if DOB missing

      const dob = new Date(emp.dob);
      const birthdayThisYear = getBirthdayThisYear(dob);

      const daysDiff = Math.floor((birthdayThisYear - today) / MS_PER_DAY);

      const birthdayData = {
        _id: emp._id,
        name: emp.employeeName, // use correct field
        email: emp.email,
        dob: emp.dob,
        birthdayThisYear,
        daysFromToday: daysDiff,
      };

      if (daysDiff >= 0 && daysDiff <= 60) {
        upcoming.push(birthdayData);
      } else if (daysDiff < 0 && daysDiff >= -60) {
        recent.push(birthdayData);
      }
    });

    // Sort lists
    upcoming.sort((a, b) => a.daysFromToday - b.daysFromToday);
    recent.sort((a, b) => b.daysFromToday - a.daysFromToday);

    res.json({ upcoming, recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateEmployeePermissions = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { permissions } = req.body;

    // permissions is either an array (to override) or null (to reset to default)
    if (permissions !== null && !Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ message: "Permissions must be an array or null to reset." });
    }

    const employee = await findOneCompanyRecord(Employee, { _id: employeeId }, req.company);
    if (!employee)
      return res.status(404).json({ message: "Employee not found." });

    const user = await User.findOne({ email: employee.email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User account not found for this employee." });

    const oldPermissions = user.permissionOverrides || [];

    if (permissions === null) {
      user.permissionOverrides = [];
    } else {
      user.permissionOverrides = permissions;
    }

    await user.save();

    // Log Audit (Assuming req.user is populated by authenticate middleware)
    const adminId = req.user ? req.user.userId : null;
    if (adminId) {
      try {
        await AuditLog.create({
          action: "UPDATE_USER_PERMISSIONS",
          entityType: "User",
          entityId: user._id,
          changedBy: adminId,
          oldValue: oldPermissions,
          newValue: user.permissionOverrides,
          description: `Updated permissions for employee ${employee.firstName} ${employee.lastName}`,
        });
      } catch (err) {
        console.error("Failed to log audit for user permission override:", err);
      }
    }

    res
      .status(200)
      .json({
        message: "Employee permissions updated successfully.",
        overrides: user.permissionOverrides,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployeeImage,
  getEmployeeDataById,
  updateEmployeeAdmin,
  updateEmployeeSelf,
  deleteEmployee,
  getSortedBirthdays,
  getEmployeeProfileMe,
  updateEmployeePermissions,
  updateCurrentEmployeeImage,
  uploadEmployeeDocument,
};
