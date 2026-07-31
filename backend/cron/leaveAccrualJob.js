const cron = require("node-cron");
const mongoose = require("mongoose");
const LeaveType = require("../models/LeaveType");
const LeaveBalance = require("../models/LeaveBalance");
const LeaveSettings = require("../models/LeaveSettings");

const LEGACY_MAPPING = {
  "Casual Leave": "casualLeave",
  "Sick Leave": "sickLeave",
  "Earned Leave": "earnedLeave",
  "Comp Off": "compOff"
};

// Run daily at midnight (00:00)
const startLeaveAccrualJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron] Running daily leave accrual job...");
    try {
      await processLeaveAccruals();
      console.log("[Cron] Leave accrual job completed.");
    } catch (error) {
      console.error("[Cron] Error running leave accrual job:", error);
    }
  });
};

const processLeaveAccruals = async () => {
  const settings = await LeaveSettings.findOne() || new LeaveSettings();
  const lastRunDateStr = settings.lastAccrualDate ? settings.lastAccrualDate.toISOString().split('T')[0] : null;
  
  const today = new Date();
  today.setHours(0,0,0,0); 

  let targetDate = new Date(today);
  if (lastRunDateStr) {
      targetDate = new Date(lastRunDateStr);
      targetDate.setDate(targetDate.getDate() + 1); // Start from day after last run
  } else {
      // First time running, just run for today
      targetDate = new Date(today);
  }

  // Cap the recovery at 30 days to avoid infinite loops if it hasn't run in years
  const diffTime = Math.abs(today - targetDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 30 && targetDate < today) {
      targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - 30);
  }

  // Iterate over each missed day up to today (Cron Recovery)
  while (targetDate <= today) {
     await processAccrualsForDate(targetDate);
     
     // Update settings after each successful day
     settings.lastAccrualDate = new Date(targetDate);
     await settings.save();

     targetDate.setDate(targetDate.getDate() + 1);
  }
};

const processAccrualsForDate = async (processDate) => {
  const dayOfMonth = processDate.getDate();
  const month = processDate.getMonth();
  const year = processDate.getFullYear();

  const isFirstDayOfMonth = dayOfMonth === 1;
  const isLastDayOfMonth = dayOfMonth === new Date(year, month + 1, 0).getDate();
  const isJanFirst = month === 0 && dayOfMonth === 1;

  const activeLeaveTypes = await LeaveType.find({ isActive: true });
  const leaveBalances = await LeaveBalance.find();

  for (const lb of leaveBalances) {
    let hasChanges = false;
    for (const lt of activeLeaveTypes) {
      const name = lt.name;
      const alloc = Number(lt.allocation || 0);

      const isLegacy = !!LEGACY_MAPPING[name];
      const balanceKey = LEGACY_MAPPING[name];

      let balanceData = isLegacy ? lb[balanceKey] : lb.dynamicBalances?.get(name);
      let isNewlyInitialized = false;

      if (!balanceData) {
         isNewlyInitialized = true;
         // Handle Initialization Mode for existing employee missing this leave type
         let initialAvailable = 0;
         let initialTotal = alloc;

         if (lt.initializationMode === 'From Today') {
             initialAvailable = 0;
         } else if (lt.initializationMode === 'Full Allocation') {
             initialAvailable = alloc;
         } else if (lt.initializationMode === 'Pro-rated') {
             // Example: 7 months passed -> 7 * (alloc/12)
             const monthsPassed = month + (dayOfMonth > 15 ? 1 : 0); // rough prorata based on middle of month
             initialAvailable = parseFloat(((monthsPassed / 12) * alloc).toFixed(2));
         }

         if (!isLegacy) {
             if (!lb.dynamicBalances) lb.dynamicBalances = new Map();
             lb.dynamicBalances.set(name, { total: initialTotal, available: initialAvailable, used: 0 });
             balanceData = lb.dynamicBalances.get(name);
             hasChanges = true;
         } else {
             lb[balanceKey] = { total: initialTotal, available: initialAvailable, used: 0 };
             balanceData = lb[balanceKey];
             hasChanges = true;
         }

         if (initialAvailable > 0) {
             lb.transactions.push({
               type: "Credit",
               amount: initialAvailable,
               leaveType: name,
               reason: `Initial Allocation (${lt.initializationMode})`,
               date: processDate
             });
         }
      }

      // Handle Accrual
      if (lt.accrualType === "Monthly") {
        const isCustomDateMatch = lt.monthlyCreditOn === "Custom Date" && dayOfMonth === (lt.customCreditDate || 1);
        
        if ( (lt.monthlyCreditOn === "First day of month" && isFirstDayOfMonth) || 
             (lt.monthlyCreditOn === "Last working day" && isLastDayOfMonth) ||
             isCustomDateMatch ) {
          
          if (!isNewlyInitialized || lt.initializationMode !== 'Pro-rated') { 
              // Avoid double dip on first month if already pro-rated during initialization
              const creditAmount = parseFloat((alloc / 12).toFixed(2)); // Support decimals 
              balanceData.available += creditAmount;
              balanceData.total += creditAmount; 
              
              lb.transactions.push({
                type: "Credit",
                amount: creditAmount,
                leaveType: name,
                reason: "Monthly Accrual",
                date: processDate
              });
              hasChanges = true;
          }
        }
      } else if (lt.accrualType === "Yearly" && isJanFirst && !isNewlyInitialized) {
        // Yearly reset / accrual
        // First handle Carry Forward
        if (lt.carryForward) {
          if (lt.maxCarryForwardDays > 0 && balanceData.available > lt.maxCarryForwardDays) {
             balanceData.available = lt.maxCarryForwardDays;
          }
        } else {
          balanceData.available = 0; // Lapses if no carry forward
        }
        
        balanceData.available += alloc;
        
        // Reset usage tracking for the new year
        balanceData.used = 0;
        balanceData.total = balanceData.available; 

        lb.transactions.push({
          type: "Reset",
          amount: alloc,
          leaveType: name,
          reason: "Yearly Allocation & Carry Forward",
          date: processDate
        });
        hasChanges = true;
      }

      // Cap at Max Balance (Support Decimals)
      if (lt.maxBalance > 0 && balanceData.available > lt.maxBalance) {
          balanceData.available = lt.maxBalance;
          hasChanges = true;
      }
      
      // Keep Synchronization perfect (total = available + used)
      // This is crucial for UI consistency when manual adjustments, caps, or carry forwards happen.
      const currentTotal = parseFloat((balanceData.available + (balanceData.used || 0)).toFixed(2));
      if (balanceData.total !== currentTotal) {
          balanceData.total = currentTotal;
          hasChanges = true;
      }

      // Format available strictly to 2 decimals
      balanceData.available = parseFloat(balanceData.available.toFixed(2));
    }

    if (hasChanges) {
      await lb.save();
    }
  }
};

module.exports = { startLeaveAccrualJob, processLeaveAccruals };
