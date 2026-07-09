/**
 * Frontend helper for managing Web Push Notification subscriptions.
 */

// Helper to convert VAPID URL-safe base64 string to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Register service worker and subscribe to browser push notifications.
 * @param {string} token - Auth JWT token
 */
export const subscribeToPushNotifications = async (token = localStorage.getItem('token')) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported by this browser.');
    return { success: false, message: 'Push notifications not supported' };
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Notification permission denied' };
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // 3. Get VAPID public key from backend
    const res = await fetch('http://localhost:5000/api/notifications/push/vapid-key', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success || !data.publicKey) {
      throw new Error('Failed to retrieve VAPID public key');
    }

    const convertedVapidKey = urlBase64ToUint8Array(data.publicKey);

    // 4. Subscribe to push manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    // 5. Send subscription to backend
    const saveRes = await fetch('http://localhost:5000/api/notifications/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        deviceInfo: navigator.userAgent
      })
    });

    const saveData = await saveRes.json();
    return saveData;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Unsubscribe from browser push notifications.
 * @param {string} token - Auth JWT token
 */
export const unsubscribeFromPushNotifications = async (token = localStorage.getItem('token')) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await fetch('http://localhost:5000/api/notifications/push/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ endpoint })
      });
    }
    return { success: true, message: 'Unsubscribed successfully' };
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return { success: false, message: error.message };
  }
};
