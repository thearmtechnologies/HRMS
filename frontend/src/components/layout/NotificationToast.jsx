import React, { useContext } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Info, Calendar, DollarSign, FolderGit2 } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function NotificationToast() {
  const { latestToast, closeToast, markAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();

  if (!latestToast) return null;

  const getIcon = (type) => {
    switch (type) {
      case "leave":
      case "attendance":
      case "holiday":
        return <Calendar className="w-5 h-5 text-blue-500 shrink-0" />;
      case "payroll":
        return <DollarSign className="w-5 h-5 text-emerald-500 shrink-0" />;
      case "project":
      case "task":
        return <FolderGit2 className="w-5 h-5 text-purple-500 shrink-0" />;
      case "verification":
        return <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const handleToastClick = () => {
    if (latestToast._id) {
      markAsRead(latestToast._id);
    }
    closeToast();
    if (latestToast.link) {
      navigate(latestToast.link);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up">
      <div
        onClick={handleToastClick}
        className="cursor-pointer bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-2xl p-4 flex items-start gap-3.5 hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-0.5"
      >
        <div className="p-2.5 bg-slate-100 rounded-xl">
          {getIcon(latestToast.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {latestToast.module || latestToast.type || "Notification"}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Just now</span>
          </div>

          <h4 className="text-sm font-bold text-slate-800 mt-0.5 truncate">
            {latestToast.title}
          </h4>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {latestToast.message}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            closeToast();
          }}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
