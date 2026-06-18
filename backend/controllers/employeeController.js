const Employee = require("../models/Employee");
const cloudinary = require("../config/cloudinary");
const ManualAtt = require("../models/ManualAtt");
const Payroll = require("../models/Payroll");
const SalaryFixed = require("../models/SalaryFixed");
const User = require("../models/User");
const Counter = require("../models/Counter");
const bcrypt = require("bcryptjs");
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
    emp.firstName, emp.lastName, emp.email, emp.personalEmail, emp.mobile,
    emp.dob, emp.gender, emp.maritalStatus, emp.bloodGroup, emp.address,
    emp.city, emp.state, emp.pincode, emp.kinName, emp.kinPhone,
    emp.kinAddress, emp.relationship, emp.documents?.pan?.number,
    emp.documents?.aadhaar?.number, 
    emp.bankName || emp.pendingBankDetails?.bankName, 
    emp.accountNo || emp.pendingBankDetails?.accountNo,
    emp.ifscCode || emp.pendingBankDetails?.ifscCode, 
    emp.branch || emp.pendingBankDetails?.branch
  ];
  const filled = fields.filter(f => f !== null && f !== undefined && f !== '').length;
  return Math.round((filled / fields.length) * 100);
};

const createEmployee = async (req, res) => {
  try {
    let employeeData = req.body;

    if (!employeeData.email || !employeeData.firstName || !employeeData.lastName) {
      return res
        .status(400)
        .json({
          error:
            "Email, First Name, and Last Name are required to create a system account.",
        });
    }

    // Duplicate check in User
    const existingUser = await User.findOne({ email: employeeData.email });
    if (existingUser) {
      return res
        .status(409)
        .json({
          error: `User with email "${employeeData.email}" already exists.`,
        });
    }

    // Auto-generate employeeId using Counter collection
    const counter = await Counter.findOneAndUpdate(
      { id: 'employeeId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    employeeData.employeeId = `EMP-${String(counter.seq).padStart(5, '0')}`;

    // Cloudinary image (multer-storage-cloudinary)
    if (req.file) {
      employeeData.url = req.file.secure_url;
      employeeData.public_id = req.file.public_id;
    }

    const employee = await Employee.create(employeeData);

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
      createdBy: req.user ? req.user.userId : null,
      isActive: true,
      isFirstLogin: true,
      isVerified: true, // Auto-verified when created by Admin/HR
    });

    await newUser.save();

    // Link the created User to the Employee
    employee.user = newUser._id;
    await employee.save();

    // Email sending disabled for now — credentials shown in success modal only
    // sendAccountCreationEmail(newUser.email, firstName, randomPassword).catch(
    //   (err) => console.error("❌ Account creation email failed:", err),
    // );

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
        return res
          .status(500)
          .json({
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
      
      return res
        .status(409)
        .json({
          error: `An employee with the ${label} "${value}" already exists. Please use a different one.`,
        });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

const updateEmployeeImage = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    if (employee.public_id) {
      await cloudinary.uploader.destroy(employee.public_id);
    }
    employee.url = req.file.path;
    employee.public_id = req.file.filename;

    await employee.save();

    res.status(200).json({ message: "Image updated successfully", employee });
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
    const employees = await Employee.find(filter)
      .populate("department", "departmentName");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEmployeeDataById = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId)
      .populate("department", "departmentName");
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmployeeAdmin = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedData = req.body;

    let employee = await Employee.findByIdAndUpdate(employeeId, updatedData, {
      new: true,
    });
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
      "mobile", "personalEmail", "gender", "dob", "bloodGroup",
      "address", "city", "state", "pincode", "maritalStatus",
      "kinName", "relationship", "kinAddress", "kinPhone", "profileImage"
    ];

    const updatedData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updatedData[key] = req.body[key];
      }
    });

    let employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Handle standard fields
    Object.assign(employee, updatedData);

    // Handle Bank Details
    if (req.body.bankDetails) {
      if (req.body.bankDetails.bankName !== undefined) employee.bankName = req.body.bankDetails.bankName;
      if (req.body.bankDetails.branch !== undefined) employee.branch = req.body.bankDetails.branch;
      if (req.body.bankDetails.accountNo !== undefined) employee.accountNo = req.body.bankDetails.accountNo;
      if (req.body.bankDetails.ifscCode !== undefined) employee.ifscCode = req.body.bankDetails.ifscCode;
      
      employee.bankStatus = "pending";
      employee.bankVerification = { verifiedBy: null, verifiedAt: null, remarks: null };
    }

    // Handle PAN / Aadhaar (Documents)
    if (req.body.documents) {
      if (!employee.documents) employee.documents = {};
      
      if (req.body.documents.pan && req.body.documents.pan.number) {
        if (employee.panStatus !== "verified") {
          employee.documents.pan = { number: req.body.documents.pan.number };
          employee.panStatus = "pending";
          employee.panVerification = { verifiedBy: null, verifiedAt: null, remarks: null };
        }
      }
      
      if (req.body.documents.aadhaar && req.body.documents.aadhaar.number) {
        if (employee.aadhaarStatus !== "verified") {
          employee.documents.aadhaar = { number: req.body.documents.aadhaar.number };
          employee.aadhaarStatus = "pending";
          employee.aadhaarVerification = { verifiedBy: null, verifiedAt: null, remarks: null };
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
    const employee = await Employee.findOne({
      $or: [{ user: req.user.userId }, { email: req.user.email }]
    }).populate("department", "departmentName");
    
    if (!employee) return res.status(404).json({ error: "Employee profile not found for this user." });
    
    // Auto-link user to employee if it's missing
    if (!employee.user) {
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
    const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, { status: "Terminated" }, { new: true });
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Also disable the user account
    await User.findOneAndUpdate({ employeeId: updatedEmployee.employeeId }, { isActive: false });

    res
      .status(200)
      .json({ message: "Employee terminated successfully" });
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

      const daysDiff = Math.floor(
        (birthdayThisYear - today) / (1000 * 60 * 60 * 24),
      );

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

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployeeImage,
  getEmployeeDataById,
  updateEmployeeAdmin,
  updateEmployeeSelf,
  deleteEmployee,
  getSortedBirthdays,
  getEmployeeProfileMe
};
