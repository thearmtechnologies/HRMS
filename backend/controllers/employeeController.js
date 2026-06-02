const Employee = require("../models/Employee");
const cloudinary = require("../config/cloudinary");
const ManualAtt = require("../models/ManualAtt");
const Payroll = require("../models/Payroll");
const SalaryFixed = require("../models/SalaryFixed");

const createEmployee = async (req, res) => {
  try {
    let employeeData = req.body;

    // tradeId required
    if (!employeeData.tradeId) {
      return res.status(400).json({ error: "tradeId is required." });
    }

    // Duplicate check
    const existingEmployee = await Employee.findOne({ tradeId: employeeData.tradeId });
    if (existingEmployee) {
      return res.status(409).json({
        error: `Employee with tradeId "${employeeData.tradeId}" already exists.`,
      });
    }

    // Cloudinary image (multer-storage-cloudinary)
    if (req.file) {
      employeeData.url = req.file.secure_url;     // REAL URL
      employeeData.public_id = req.file.public_id; // REAL CLOUDINARY ID
    }

    const employee = await Employee.create(employeeData);

    res.status(201).json({
      message: "Employee created successfully",
      employee,
    });

  } catch (error) {
    console.error("❌ Error creating employee:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: `Duplicate field: ${Object.keys(error.keyValue)} already exists.`,
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
    const employees = await Employee.find()
      .populate('site', 'siteName type location')
      .populate('department', 'departmentName');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEmployeeDataById = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId)
      .populate('site', 'siteName type location')
      .populate('department', 'departmentName');
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedData = req.body;

    const employee = await Employee.findByIdAndUpdate(employeeId, updatedData, { new: true });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    await SalaryFixed.deleteMany({ employeeId: employeeId });
    await Payroll.deleteMany({ employee: employeeId });
    await ManualAtt.deleteMany({ employee: employeeId });
    const deletedEmployee = await Employee.findByIdAndDelete(employeeId);
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee and associated data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error });
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
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};


const getSortedBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const allEmployees = await Employee.find({});

    const upcoming = [];
    const recent = [];

    allEmployees.forEach(emp => {
      if (!emp.dob) return; // skip if DOB missing

      const dob = new Date(emp.dob);
      const birthdayThisYear = getBirthdayThisYear(dob);

      const daysDiff = Math.floor((birthdayThisYear - today) / (1000 * 60 * 60 * 24));

      const birthdayData = {
        _id: emp._id,
        name: emp.employeeName, // use correct field
        email: emp.email,
        dob: emp.dob,
        birthdayThisYear,
        daysFromToday: daysDiff
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
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { createEmployee, getEmployees, updateEmployeeImage, getEmployeeDataById, updateEmployee, deleteEmployee, getSortedBirthdays };
