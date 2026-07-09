const Notification = require('../models/Notification');
const pushService = require('./pushService');
const socketService = require('./socketService');

/**
 * Reusable helper function to create a single notification.
 * This is intended for internal use by backend modules and is NOT exposed as a public API.
 * 
 * @param {Object} data - Notification payload
 * @param {string|ObjectId} data.recipient - Target User ID (required)
 * @param {string|ObjectId} [data.sender] - Sender User ID (optional)
 * @param {string} data.title - Title of the notification (required)
 * @param {string} data.message - Body content of the notification (required)
 * @param {string} [data.type='system'] - Type of notification
 * @param {string} data.module - The module triggering this notification (required)
 * @param {string} [data.priority='medium'] - Priority: 'low', 'medium', 'high'
 * @param {string} [data.link] - Frontend navigation path (optional)
 * @param {Object} [data.metadata] - Additional structured data (optional)
 * @returns {Promise<Document>} Saved Notification document
 */
const createNotification = async (data) => {
  try {
    if (!data || !data.recipient || !data.title || !data.message || !data.module) {
      throw new Error('Missing required fields for notification: recipient, title, message, module');
    }

    const notification = new Notification({
      recipient: data.recipient,
      sender: data.sender || null,
      title: data.title,
      message: data.message,
      type: data.type || 'system',
      module: data.module,
      priority: data.priority || 'medium',
      link: data.link || null,
      metadata: data.metadata || {},
      isRead: false,
      readAt: null,
      isDeleted: false
    });

    const savedNotification = await notification.save();

    // Emit real-time Socket.IO notification to connected recipient across all open tabs
    socketService.emitToUser(data.recipient.toString(), 'new_notification', savedNotification);

    // Asynchronously trigger browser push notification so DB and push represent the same event
    pushService.sendPushToUser(data.recipient, {
      title: data.title,
      body: data.message,
      icon: '/logo192.png',
      url: data.link || '/',
      type: data.type || 'system',
      notificationId: savedNotification._id
    }).catch(err => console.error('Push notification trigger error:', err.message));

    return savedNotification;
  } catch (error) {
    console.error('❌ Error in createNotification service:', error.message);
    throw error;
  }
};

/**
 * Reusable helper function to create multiple notifications in bulk.
 * This is intended for internal use by backend modules and is NOT exposed as a public API.
 * 
 * @param {Array<Object>} dataArray - Array of notification payload objects
 * @returns {Promise<Array<Document>>} Array of inserted Notification documents
 */
const createMultipleNotifications = async (dataArray) => {
  try {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }

    const notificationsToInsert = dataArray.map(data => {
      if (!data || !data.recipient || !data.title || !data.message || !data.module) {
        throw new Error('Missing required fields in one or more items for createMultipleNotifications');
      }
      return {
        recipient: data.recipient,
        sender: data.sender || null,
        title: data.title,
        message: data.message,
        type: data.type || 'system',
        module: data.module,
        priority: data.priority || 'medium',
        link: data.link || null,
        metadata: data.metadata || {},
        isRead: false,
        readAt: null,
        isDeleted: false
      };
    });

    const insertedNotifications = await Notification.insertMany(notificationsToInsert);

    // Emit real-time Socket.IO notifications and trigger push notifications
    insertedNotifications.forEach(notif => {
      socketService.emitToUser(notif.recipient.toString(), 'new_notification', notif);

      pushService.sendPushToUser(notif.recipient, {
        title: notif.title,
        body: notif.message,
        icon: '/logo192.png',
        url: notif.link || '/',
        type: notif.type || 'system',
        notificationId: notif._id
      }).catch(err => console.error('Bulk push notification trigger error:', err.message));
    });

    return insertedNotifications;
  } catch (error) {
    console.error('❌ Error in createMultipleNotifications service:', error.message);
    throw error;
  }
};

/**
 * Clean alias helper for triggering notifications across backend controllers.
 * Example usage:
 *   await notify({
 *     recipient: userId,
 *     title: 'Leave Approved',
 *     message: 'Your leave request has been approved.',
 *     module: 'leave_management',
 *     type: 'leave',
 *     link: '/hr/leave-management'
 *   });
 */
const notify = async (data) => {
  return createNotification(data);
};

module.exports = {
  createNotification,
  createMultipleNotifications,
  notify
};
