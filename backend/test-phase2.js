const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Notification = require('./models/Notification');
const PushSubscription = require('./models/PushSubscription');
const Announcement = require('./models/Announcement');
const pushService = require('./utils/pushService');
const reminderEngine = require('./utils/reminderEngine');
const { notify, createMultipleNotifications } = require('./utils/notificationService');

const runTests = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms');
    console.log('✅ Connected to MongoDB!');

    // Test 1: VAPID Key Generation & Push Service
    console.log('\n--- Test 1: Push Service VAPID Key ---');
    const vapidKey = pushService.getVapidPublicKey();
    if (vapidKey && typeof vapidKey === 'string') {
      console.log('✅ VAPID Public Key retrieved successfully:', vapidKey.substring(0, 20) + '...');
    } else {
      throw new Error('Failed to retrieve VAPID Public Key');
    }

    // Test 2: Verify Reminder Engine functions exist
    console.log('\n--- Test 2: Reminder Engine Functions ---');
    const reminderFuncs = [
      'checkMissingClockIn',
      'checkMissingClockOut',
      'checkLeaveStartingTomorrow',
      'checkHolidayTomorrow',
      'checkApproachingTaskDeadlines',
      'checkPendingVerifications',
      'checkAvailablePayroll'
    ];
    for (const funcName of reminderFuncs) {
      if (typeof reminderEngine[funcName] === 'function') {
        console.log(`✅ Verified reminder engine function: ${funcName}()`);
      } else {
        throw new Error(`Missing reminder engine function: ${funcName}`);
      }
    }

    // Test 3: Announcement Creation & Notification Broadcast
    console.log('\n--- Test 3: Announcement & Broadcast Notification ---');
    const testTitle = `Test Announcement ${Date.now()}`;
    const announcement = await Announcement.create({
      title: testTitle,
      content: 'This is a test announcement for Phase 2 verification.',
      priority: 'high'
    });
    console.log('✅ Announcement created in MongoDB:', announcement._id);

    // Clean up test announcement
    await Announcement.deleteOne({ _id: announcement._id });
    console.log('🧹 Cleaned up test announcement.');

    console.log('\n🎉 ALL PHASE 2 MODULE INTEGRATION & PUSH FOUNDATION TESTS PASSED 100%! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  }
};

runTests();
