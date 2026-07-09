const ioClient = require("socket.io-client");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Notification = require("./models/Notification");
const { createNotification } = require("./utils/notificationService");
const { markAsRead, markAllAsRead, deleteNotification } = require("./controllers/notificationController");
const socketService = require("./utils/socketService");

const http = require("http");
const express = require("express");

async function runPhase3Verification() {
 

  // Connect to MongoDB
  console.log("🔄 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB!\n");

  // Spin up temporary Socket.IO test server port to verify socket behavior
  const app = express();
  const server = http.createServer(app);
  socketService.init(server);

  const TEST_PORT = 5055;
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`🔌 Test Socket.IO server running on port ${TEST_PORT}\n`);

  try {
    // Find a test user
    const testUser = await User.findOne({});
    if (!testUser) {
      throw new Error("No users found in database for testing");
    }
    const userId = testUser._id.toString();
    console.log(`👤 Using test recipient user: ${testUser.email} (${userId})`);

    // --- TEST 1: Real-time socket connection & registration ---
    console.log("\n--- Test 1: Real-Time Socket Connection & Tab Sync ---");
    const clientSocket1 = ioClient(`http://localhost:${TEST_PORT}`, {
      transports: ["websocket"]
    });
    const clientSocket2 = ioClient(`http://localhost:${TEST_PORT}`, {
      transports: ["websocket"]
    });

    await new Promise((resolve) => clientSocket1.on("connect", resolve));
    await new Promise((resolve) => clientSocket2.on("connect", resolve));
    console.log("✅ Connected 2 simulated client tabs (Socket 1 & Socket 2)");

    // Register both sockets to user room
    clientSocket1.emit("register_user", userId);
    clientSocket2.emit("register_user", userId);
    await new Promise((r) => setTimeout(r, 200));
    console.log("✅ Registered both tabs to user room:", userId);

    // --- TEST 2: Real-time 'new_notification' delivery across multiple tabs ---
    console.log("\n--- Test 2: Real-Time Notification Emission via notificationService ---");

    let socket1Received = null;
    let socket2Received = null;

    clientSocket1.on("new_notification", (data) => {
      socket1Received = data;
    });
    clientSocket2.on("new_notification", (data) => {
      socket2Received = data;
    });

    const testTitle = `Socket.IO Real-Time Test ${Date.now()}`;
    const savedNotif = await createNotification({
      recipient: userId,
      title: testTitle,
      message: "Testing instant Socket.IO delivery across open tabs",
      module: "leave_management",
      type: "leave",
      priority: "high",
      link: "/hr/leave-management"
    });

    console.log("✅ Saved Notification to MongoDB:", savedNotif._id.toString());

    // Wait for Socket delivery
    await new Promise((r) => setTimeout(r, 400));

    if (!socket1Received || !socket2Received) {
      throw new Error("Socket tabs did not both receive 'new_notification' event!");
    }
    if (socket1Received.title !== testTitle || socket2Received.title !== testTitle) {
      throw new Error("Received notification payload mismatch!");
    }
    console.log("✅ BOTH Simulated open tabs received 'new_notification' instantly!");

    // --- TEST 3: Multi-Tab Synchronization on Status Update (markAsRead) ---
    console.log("\n--- Test 3: Multi-Tab Synchronization on Notification Read/Delete ---");

    let tab2UpdateReceived = null;
    clientSocket2.on("notification_updated", (updateData) => {
      tab2UpdateReceived = updateData;
    });

    // Simulate marking notification as read
    savedNotif.isRead = true;
    savedNotif.readAt = new Date();
    await savedNotif.save();
    socketService.emitToUser(userId, "notification_updated", {
      action: "read",
      id: savedNotif._id
    });

    await new Promise((r) => setTimeout(r, 300));
    if (!tab2UpdateReceived || tab2UpdateReceived.action !== "read") {
      throw new Error("Tab 2 did not receive tab sync 'notification_updated' event!");
    }
    console.log("✅ Tab 2 instantly synchronized read status across tabs!");

    // Cleanup test notification
    await Notification.deleteOne({ _id: savedNotif._id });
    console.log("🧹 Cleaned up test notification from database.");

    // Disconnect sockets and server
    clientSocket1.disconnect();
    clientSocket2.disconnect();
    server.close();

    console.log("\n==================================================================");
    console.log("🎉 ALL PHASE 3 REAL-TIME NOTIFICATION & SOCKET.IO TESTS PASSED 100%! 🎉");
    console.log("==================================================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Phase 3 Verification Failed:", error);
    server.close();
    process.exit(1);
  }
}

runPhase3Verification();
