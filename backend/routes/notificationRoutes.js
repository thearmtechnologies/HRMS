const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  getVapidKey,
  subscribeToPush,
  unsubscribeFromPush
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Secure all notification routes with existing authentication middleware
router.use(authenticate);

// Static / aggregate routes MUST be registered before dynamic /:id routes
router.get('/unread/count', getUnreadCount);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/read', deleteAllReadNotifications);
router.delete('/read-all', deleteAllReadNotifications);

// Browser push notification endpoints
router.get('/push/vapid-key', getVapidKey);
router.post('/push/subscribe', subscribeToPush);
router.delete('/push/unsubscribe', unsubscribeFromPush);

// Get logged-in user's notifications
router.get('/', getMyNotifications);

// Dynamic notification ID routes
router.patch('/:id/read', markAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
