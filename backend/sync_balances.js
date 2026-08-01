const mongoose = require("mongoose");
const LeaveBalance = require("./models/LeaveBalance");
const LeaveType = require("./models/LeaveType");
const dotenv = require("dotenv");

dotenv.config();

const LEGACY_MAPPING = {
  "Casual Leave": "casualLeave",
  "Sick Leave": "sickLeave",
  "Earned Leave": "earnedLeave",
  "Comp Off": "compOff",
  "Unpaid Leave": "unpaidLeave",
  "Work From Home": "wfh"
};

async function syncAllBalances() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hrms");
    
    const leaveTypes = await LeaveType.find({ isActive: true });
    
    const balances = await LeaveBalance.find({});
    let updatedCount = 0;
    
    for (const b of balances) {
      let isModified = false;
      
      for (const lt of leaveTypes) {
        const name = lt.name;
        const targetAlloc = lt.allocation || 0;
        
        if (LEGACY_MAPPING[name]) {
          const field = LEGACY_MAPPING[name];
          if (["casualLeave", "sickLeave", "earnedLeave", "compOff"].includes(field)) {
            if (b[field] && b[field].total !== targetAlloc) {
              const diff = targetAlloc - (b[field].total || 0);
              b[field].total = targetAlloc;
              b[field].available = (b[field].available || 0) + diff;
              isModified = true;
            }
          }
        }
      }
      
      if (isModified) {
        await b.save();
        updatedCount++;
      }
    }
    
    console.log(`Successfully updated ${updatedCount} employee balances to match LeaveType allocations.`);
    process.exit(0);
  } catch (error) {
    console.error("Error syncing balances:", error);
    process.exit(1);
  }
}

syncAllBalances();
