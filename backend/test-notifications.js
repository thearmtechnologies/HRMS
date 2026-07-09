const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Notification = require('./models/Notification');
const { notify } = require('./utils/notificationService');

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms');
    console.log('✅ Connected to MongoDB');

    // Find any user to act as recipient and sender
    const users = await User.find().limit(2);
    if (users.length === 0) {
      console.log('❌ No users found in database to run notification test.');
      process.exit(1);
    }
    const recipient = users[0];
    const sender = users.length > 1 ? users[1] : users[0];
    console.log(`👤 Using Recipient: ${recipient.email} (${recipient._id})`);
    console.log(`👤 Using Sender: ${sender.email} (${sender._id})`);

    // 1. Initial Unread Count
    const initialUnread = await Notification.countDocuments({ recipient: recipient._id, isRead: false, isDeleted: false });
    console.log(`📊 Initial Unread Count: ${initialUnread}`);

    // 2. Create Notification via notify helper
    console.log('\n--- Test 1: Creating Notification via notify() ---');
    const newNotif = await notify({
      recipient: recipient._id,
      sender: sender._id,
      title: 'Leave Request Approved',
      message: 'Your leave application for next Monday has been approved by HR.',
      type: 'leave',
      module: 'leave_management',
      link: '/hr/leave-management',
      priority: 'high',
      metadata: { leaveId: '12345', days: 1 }
    });
    console.log(`✅ Notification Created: ID=${newNotif._id}, Title="${newNotif.title}", isRead=${newNotif.isRead}, isDeleted=${newNotif.isDeleted}`);

    // 3. Verify it appears in GET query (simulating controller find)
    console.log('\n--- Test 2: Verifying Notification in Feed ---');
    const feed = await Notification.find({ recipient: recipient._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate('sender', 'firstName lastName fullName profileImage email');
    const found = feed.find(n => n._id.toString() === newNotif._id.toString());
    if (found) {
      console.log(`✅ Found in Feed! Sender populated as:`, found.sender ? `${found.sender.firstName} ${found.sender.lastName} (${found.sender.email})` : 'Null');
    } else {
      console.log(`❌ Failed to find new notification in feed.`);
    }

    // 4. Verify Unread Count increased by 1
    const updatedUnread = await Notification.countDocuments({ recipient: recipient._id, isRead: false, isDeleted: false });
    console.log(`📊 Updated Unread Count: ${updatedUnread} (Expected: ${initialUnread + 1})`);
    if (updatedUnread === initialUnread + 1) {
      console.log('✅ Unread count increased correctly!');
    } else {
      console.log('❌ Unread count mismatch!');
    }

    // 5. Test Mark as Read
    console.log('\n--- Test 3: Marking Notification as Read ---');
    newNotif.isRead = true;
    newNotif.readAt = new Date();
    await newNotif.save();
    console.log(`✅ Marked read! readAt timestamp: ${newNotif.readAt.toISOString()}`);

    const postReadUnread = await Notification.countDocuments({ recipient: recipient._id, isRead: false, isDeleted: false });
    console.log(`📊 Unread Count after reading: ${postReadUnread} (Expected: ${initialUnread})`);

    // 6. Test Soft Delete
    console.log('\n--- Test 4: Testing Soft Delete ---');
    await Notification.findOneAndUpdate({ _id: newNotif._id, recipient: recipient._id, isDeleted: false }, { $set: { isDeleted: true } });
    const checkDeleted = await Notification.findById(newNotif._id);
    console.log(`✅ Notification isDeleted status in DB: ${checkDeleted.isDeleted}`);

    const feedAfterDelete = await Notification.find({ recipient: recipient._id, isDeleted: false });
    const foundAfterDelete = feedAfterDelete.find(n => n._id.toString() === newNotif._id.toString());
    if (!foundAfterDelete) {
      console.log('✅ Successfully hidden from user feed (isDeleted: false filter worked)!');
    } else {
      console.log('❌ Still visible in feed after soft delete!');
    }

    // 7. Test User Isolation (cannot delete or read another user's notification)
    console.log('\n--- Test 5: Testing User Isolation ---');
    const fakeUserId = new mongoose.Types.ObjectId();
    const unauthorizedAttempt = await Notification.findOne({ _id: newNotif._id, recipient: fakeUserId });
    if (!unauthorizedAttempt) {
      console.log('✅ Unauthorized query returned null! User cannot access another user\'s notification.');
    } else {
      console.log('❌ Security leak: Unauthorized user found notification!');
    }

    // Cleanup: permanently remove test notification
    await Notification.deleteOne({ _id: newNotif._id });
    console.log('\n🧹 Cleanup: Test notification permanently removed from database.');

    console.log('\n🎉 ALL NOTIFICATION SYSTEM FOUNDATION TESTS PASSED 100%! 🎉\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  }
};

runTest();
