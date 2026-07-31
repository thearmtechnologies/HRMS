const mongoose = require("mongoose");
const LeaveBalance = require("./models/LeaveBalance");
const LeaveType = require("./models/LeaveType");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

async function syncEarnedLeave() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    const earnedLeave = await LeaveType.findOne({ name: "Earned Leave" });
    if (!earnedLeave) {
      console.log("Earned Leave template not found");
      process.exit(0);
    }
    
    console.log(`Target allocation for Earned Leave: ${earnedLeave.allocation}`);
    
    const balances = await LeaveBalance.find({});
    let updatedCount = 0;
    
    for (const b of balances) {
      if (b.earnedLeave && b.earnedLeave.total !== earnedLeave.allocation) {
        const diff = earnedLeave.allocation - (b.earnedLeave.total || 0);
        
        b.earnedLeave.total = earnedLeave.allocation;
        b.earnedLeave.available = (b.earnedLeave.available || 0) + diff;
        
        await b.save();
        updatedCount++;
      }
    }
    
    console.log(`Successfully updated ${updatedCount} employee balances.`);
  } catch (error) {
    console.error("Error syncing balances:", error);
  } finally {
    mongoose.disconnect();
  }
}

syncEarnedLeave();
