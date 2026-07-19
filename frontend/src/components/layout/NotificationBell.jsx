import React, { useContext, useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Trash2, Calendar, DollarSign, FolderGit2, CheckCircle, Info } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotificationItem
  } = useContext(NotificationContext);
  const { user } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const diffSec = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "leave":
      case "attendance":
      case "holiday":
        return "bg-blue-100 text-blue-700";
      case "payroll":
        return "bg-emerald-100 text-emerald-700";
      case "project":
      case "task":
        return "bg-purple-100 text-purple-700";
      case "verification":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    setIsOpen(false);
    let targetLink = notif.link;
    if (user?.role === "admin") {
      if (targetLink === "/hr/leave-management" || notif.type === "leave" || notif.module === "leave_management") {
        targetLink = "/admin-dashboard?tab=leave-requests";
      } else if (targetLink === "/hr/attendance" || (notif.module === "attendance" && targetLink?.startsWith("/hr"))) {
        targetLink = "/admin-dashboard?tab=attendance";
      }
    }
    if (targetLink) {
      navigate(targetLink);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-[#8f9192] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-xl transition-all"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 cursor-pointer transition-colors flex items-start gap-3 group ${
                    notif.isRead
                      ? "bg-white hover:bg-slate-50"
                      : "bg-blue-50/40 hover:bg-blue-50/70"
                  }`}
                >
                  {/* Unread indicator dot */}
                  <div className="pt-1.5 shrink-0">
                    {!notif.isRead ? (
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 bg-transparent rounded-full inline-block"></span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(
                          notif.type
                        )}`}
                      >
                        {notif.module || notif.type || "System"}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-bold truncate ${
                        notif.isRead ? "text-slate-700" : "text-slate-900"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotificationItem(notif._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
