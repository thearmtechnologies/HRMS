const Notification = require('../models/Notification');
const pushService = require('../utils/pushService');
const socketService = require('../utils/socketService');

// Helper to extract current user ID from req.user
const getUserId = (req) => {
  if (!req.user) return null;
  return req.user.userId || req.user._id || req.user.id || null;
};

// 1. Get my notifications
const getMyNotifications = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: true, message: 'User authentication required' });
    }

    const { isRead, type, limit = 50, skip = 0 } = req.query;
    const filter = { recipient: userId, isDeleted: false };

    if (isRead !== undefined && isRead !== '') {
      filter.isRead = isRead === 'true';
    }
    if (type && type !== '') {
      filter.type = type;
    }

    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skipNum = parseInt(skip, 10) || 0;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .populate("sender", "firstName lastName fullName profileImage email");

    const totalCount = await Notification.countDocuments(filter);

    return res.status(200).json({
      success: true,
      error: false,
      count: notifications.length,
      totalCount,
      notifications,
      message: 'Notifications retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error in getMyNotifications:', error);
    return res.status(500).json({ success: false, error: true, message: 'Internal Server Error', details: error.message });
  }
};

// 2. Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: true, message: 'User authentication required' });
    }

    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
      isDeleted: false
    });

    return res.status(200).json({
      success: true,
      error: false,
      count,
      message: 'Unread count retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error in getUnreadCount:', error);
    return res.status(500).json({ success: false, error: true, message: 'Internal Server Error', details: error.message });
  }
};

// 3. Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: true, message: 'User authentication required' });
    }

    const { id } = req.params;

    // Secure query ensuring recipient matches req.user and is not soft deleted
    const notification = await Notification.findOne({ _id: id, recipient: userId, isDeleted: false });
    if (!notification) {
      return res.status(404).json({ success: false, error: true, message: 'Notification not found or access denied' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
      socketService.emitToUser(userId.toString(), 'notification_updated', { action: 'read', id: notification._id });
    }

    return res.status(200).json({
      success: true,
      error: false,
      notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Error in markAsRead:', error);
    return res.status(500).json({ success: false, error: true, message: 'Internal Server Error', details: error.message });
  }
};

// 4. Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: true, message: 'User authentication required' });
    }

    const result = await Notification.updateMany(
      { recipient: userId, isRead: false, isDeleted: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    socketService.emitToUser(userId.toString(), 'notification_updated', { action: 'read_all' });

    return res.status(200).json({
      success: true,
      error: false,
      modifiedCount: result.modifiedCount,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Error in markAllAsRead:', error);
    return res.status(500).json({ success: false, error: true, message: 'Internal Server Error', details: error.message });
  }
};

// 5. Delete a notification (Soft Delete)
const deleteNotification = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: true, message: 'User authentication required' });
    }

    const { id } = req.params;

    // Soft delete: set isDeleted to true for logged-in user's notification
    const deleted = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, error: true, message: 'Notification not found or access denied' });
    }

    socketService.emitToUser(userId.toString(), 'notification_updated', { action: 'delete', id });

    return res.status(200).json({
      success: true,
      error: false,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in deleteNotification:', error);
    return res.status(500).json({ success: false, error: true, message: 'Internal Server Error', details: error.message });
  }
};

// 6. Delete all read notifications (Soft Delete)
const deleteAllReadNotifications = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: true, message: 'User authentication required' });
    }

    // Soft delete: set isDeleted to true for all read notifications of the logged-in user
    const result = await Notification.updateMany(
      { recipient: userId, isRead: true, isDeleted: false },
      { $set: { isDeleted: true } }
    );

    socketService.emitToUser(userId.toString(), 'notification_updated', { action: 'delete_read_all' });

    return res.status(200).json({
      success: true,
      error: false,
      deletedCount: result.modifiedCount,
      message: 'All read notifications deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error in deleteAllReadNotifications:', error);
    return res.status(500).json({ success: false, error: true, message: 'Internal Server Error', details: error.message });
  }
};

// 7. Get VAPID public key
const getVapidKey = async (req, res) => {
  try {
    const publicKey = pushService.getVapidPublicKey();
    return res.status(200).json({ success: true, error: false, publicKey });
  } catch (error) {
    console.error('❌ Error in getVapidKey:', error);
    return res.status(500).json({ success: false, error: true, message: 'Internal Server Error' });
  }
};

// 8. Register or update browser push subscription
const subscribeToPush = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: true, message: 'User authentication required' });
    }

    const { subscription, deviceInfo } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, error: true, message: 'Valid push subscription is required' });
    }

    const saved = await pushService.saveSubscription(userId, subscription, deviceInfo || 'Browser');
    return res.status(200).json({ success: true, error: false, message: 'Subscribed to push notifications', subscription: saved });
  } catch (error) {
    console.error('❌ Error in subscribeToPush:', error);
    return res.status(500).json({ success: false, error: true, message: 'Failed to save push subscription', details: error.message });
  }
};

// 9. Unsubscribe from browser push notifications
const unsubscribeFromPush = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: true, message: 'User authentication required' });
    }

    const { endpoint } = req.body;
    const filter = endpoint ? { endpoint, user: userId } : { user: userId };
    await pushService.removeSubscription(filter);

    return res.status(200).json({ success: true, error: false, message: 'Unsubscribed from push notifications' });
  } catch (error) {
    console.error('❌ Error in unsubscribeFromPush:', error);
    return res.status(500).json({ success: false, error: true, message: 'Failed to unsubscribe from push notifications' });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getVapidKey,
  subscribeToPush,
  unsubscribeFromPush
};
