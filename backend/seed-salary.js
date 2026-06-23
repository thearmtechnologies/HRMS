const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const SalaryFixed = require('./models/SalaryFixed');

const uri = "mongodb+srv://k2080495_db_user:ARMHRMS54321@hrms.1ialzio.mongodb.net/?appName=HRMS";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const emp = await Employee.findOne({ employeeId: 'EMP-00001', status: 'Active' });
    if (!emp) {
      console.log("Employee EMP-00001 not found.");
      return;
    }

    console.log(`Setting up salary for: ${emp.firstName} ${emp.lastName}`);

    const existingSalary = await SalaryFixed.findOne({ employeeId: emp._id, isActive: true });
    if (existingSalary) {
      console.log("Active salary already exists.");
      return;
    }

    const salary = new SalaryFixed({
      employeeId: emp._id,
      basicMonthly: 30000,
      hraMonthly: 15000,
      caMonthly: 5000,
      maMonthly: 3000,
      saMonthly: 7000,
      grossMonthly: 60000,
      bonusMonthly: 0,
      overtimeRate: 500,
      employeePFMonthly: 1800,
      employerPFMonthly: 1800,
      esiEmployee: 0,
      esiEmployer: 0,
      taxMonthly: 2000,
      professionalTax: 200,
      otherDed: 0,
      inHandMonthly: 56000,
      isActive: true,
      effectiveDate: new Date(),
    });

    await salary.save();
    console.log("Salary structure created successfully!");
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
