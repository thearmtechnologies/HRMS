const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// VAPID keys setup
// In production, these should be set via environment variables VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY
// For seamless development and testing out of the box without breaking, fallback keys are provided or generated if env vars are missing.
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'UUx3eR5W21f92eD103Hw1y2a8h23_29d_J_e412389a';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@hrms-system.local';

try {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} catch (err) {
  console.warn('⚠️ Could not set VAPID details for web-push:', err.message);
}

/**
 * Return public VAPID key for frontend push subscription registration.
 */
const getVapidPublicKey = () => {
  return VAPID_PUBLIC_KEY;
};

/**
 * Register or update a browser push subscription for a user.
 */
const saveSubscription = async (userId, subscription, deviceInfo = 'Browser') => {
  try {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new Error('Invalid push subscription data');
    }

    const updated = await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        user: userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        deviceInfo
      },
      { upsert: true, new: true }
    );
    return updated;
  } catch (error) {
    console.error('❌ Error saving push subscription:', error.message);
    throw error;
  }
};

/**
 * Remove a push subscription by endpoint or userId.
 */
const removeSubscription = async (filter) => {
  try {
    return await PushSubscription.deleteMany(filter);
  } catch (error) {
    console.error('❌ Error removing push subscription:', error.message);
    throw error;
  }
};

/**
 * Send browser push notification to a specific user.
 * Asynchronously checks all registered browser endpoints for the user and sends web push payload.
 * Automatically cleans up expired/invalid subscriptions (404 / 410).
 */
const sendPushToUser = async (userId, payload) => {
  try {
    const subscriptions = await PushSubscription.find({ user: userId });
    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const payloadString = JSON.stringify(payload);
    let sent = 0;
    let failed = 0;

    const promises = subscriptions.map(async (sub) => {
      try {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: sub.keys
        };
        await webpush.sendNotification(pushConfig, payloadString);
        sent++;
      } catch (error) {
        failed++;
        // If subscription is expired or unsubscribed, delete from DB
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id }).catch(() => {});
        } else {
          console.error(`❌ Push delivery failed for endpoint ${sub.endpoint}:`, error.message);
        }
      }
    });

    await Promise.allSettled(promises);
    return { sent, failed };
  } catch (error) {
    console.error('❌ Error in sendPushToUser:', error.message);
    return { sent: 0, failed: 0 };
  }
};

module.exports = {
  getVapidPublicKey,
  saveSubscription,
  removeSubscription,
  sendPushToUser
};
