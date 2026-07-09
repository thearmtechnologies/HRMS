import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import * as notificationApi from "../services/notificationService";
import { subscribeToPushNotifications } from "../utils/pushHelper";

export const NotificationContext = createContext();

const SOCKET_URL = "http://localhost:5000";

export const NotificationProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestToast, setLatestToast] = useState(null);
  const socketRef = useRef(null);

  // Load initial notifications and count when logged in
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationApi.getMyNotifications(40).catch(() => null),
        notificationApi.getUnreadCount().catch(() => null)
      ]);

      if (notifRes?.notifications) {
        setNotifications(notifRes.notifications);
      }
      if (typeof countRes?.count === "number") {
        setUnreadCount(countRes.count);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    // Request & Register Service Worker Web Push subscription for Desktop/Laptop alerts even when closed
    subscribeToPushNotifications(token).catch((err) =>
      console.warn("Push notification registration info:", err.message)
    );

    // Initialize Socket.IO connection
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Ensure user room join
      if (user?._id || user?.userId || user?.id) {
        socket.emit("register_user", user._id || user.userId || user.id);
      }
    });

    // Real-time event: new notification created
    socket.on("new_notification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger online in-app toast notification
      setLatestToast(newNotif);

      // Also display OS Desktop/Laptop native notification if permission granted
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new window.Notification(newNotif.title, {
            body: newNotif.message,
            icon: "/favicon.ico"
          });
        }
      } catch (e) {
        console.warn("Desktop notification display error:", e);
      }
    });

    // Real-time tab sync: notification status updated from another tab/window
    socket.on("notification_updated", (update) => {
      if (update.action === "read" && update.id) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === update.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else if (update.action === "read_all") {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else if (update.action === "delete" && update.id) {
        setNotifications((prev) => {
          const target = prev.find((n) => n._id === update.id);
          const wasUnread = target && !target.isRead;
          if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1));
          return prev.filter((n) => n._id !== update.id);
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!latestToast) return;
    const timer = setTimeout(() => {
      setLatestToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [latestToast]);

  const markAsRead = async (id) => {
    try {
      const target = notifications.find((n) => n._id === id);
      if (target && !target.isRead) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      await notificationApi.markAsRead(id);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotificationItem = async (id) => {
    try {
      const target = notifications.find((n) => n._id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const closeToast = () => setLatestToast(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        latestToast,
        markAsRead,
        markAllAsRead,
        deleteNotificationItem,
        closeToast,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
