const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const SalaryFixed = require('./models/SalaryFixed');

const uri = "mongodb+srv://k2080495_db_user:ARMHRMS54321@hrms.1ialzio.mongodb.net/?appName=HRMS";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const employees = await Employee.find({ status: 'Active' });
    console.log(`Found ${employees.length} active employees.`);

    for (const emp of employees) {
      console.log(`\nEmployee: ${emp.firstName} ${emp.lastName} (${emp.employeeId})`);
      const salary = await SalaryFixed.findOne({ employeeId: emp._id, isActive: true });
      if (salary) {
        console.log(`  - Has active salary structure. Gross: ${salary.grossMonthly}`);
      } else {
        console.log(`  - NO active salary structure found! Payroll generation will skip this employee.`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
