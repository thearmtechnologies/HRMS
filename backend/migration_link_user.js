require("dotenv").config();
const mongoose = require("mongoose");
const Employee = require("./models/Employee");
const User = require("./models/User");

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for migration");

    const employees = await Employee.find({ user: { $exists: false } });
    console.log(`Found ${employees.length} employees without a linked user.`);

    let linkedCount = 0;
    for (const emp of employees) {
      // Find matching user by employeeId
      const user = await User.findOne({ employeeId: emp.employeeId });
      if (user) {
        emp.user = user._id;
        await emp.save();
        linkedCount++;
        console.log(`Linked employee ${emp.employeeId} to user ${user._id}`);
      } else {
        // Fallback to email
        const userByEmail = await User.findOne({ email: emp.email });
        if (userByEmail) {
          emp.user = userByEmail._id;
          await emp.save();
          linkedCount++;
          console.log(`Linked employee ${emp.employeeId} to user ${userByEmail._id} (by email)`);
        } else {
          console.log(`No user found for employee ${emp.employeeId}`);
        }
      }
    }

    console.log(`Migration complete. Linked ${linkedCount} employees.`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    mongoose.disconnect();
  }
}

runMigration();
