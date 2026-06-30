import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const PRIORITY_COLORS = {
  Critical: "bg-rose-100 text-rose-700 border-rose-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200"
};

export default function KanbanCard({ task, onClick, onDragStart, isDraggable }) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "DONE";
  const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  let dueDateColor = "text-[#718096]";
  let dueDateText = new Date(task.dueDate).toLocaleDateString();
  
  if (isOverdue) {
    dueDateColor = "text-rose-600 font-bold";
    dueDateText = "Overdue";
  } else if (daysLeft === 0) {
    dueDateColor = "text-orange-600 font-bold";
    dueDateText = "Today";
  } else if (daysLeft === 1) {
    dueDateColor = "text-amber-600 font-bold";
    dueDateText = "Tomorrow";
  } else if (daysLeft <= 3) {
    dueDateColor = "text-amber-600 font-bold";
    dueDateText = `${daysLeft} Days Left`;
  }

  return (
    <div 
      draggable={isDraggable}
      onDragStart={(e) => {
        if (isDraggable) onDragStart(e, task);
      }}
      onClick={() => onClick(task)}
      className={`bg-white border ${isDraggable ? "cursor-grab active:cursor-grabbing hover:border-[#3B82F6]" : "cursor-pointer"} border-[#e2e8f0] p-3 rounded-lg shadow-sm mb-3 transition-all group`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-[#718096] bg-[#f7fafc] px-1.5 py-0.5 rounded border border-[#e2e8f0]">
          {task.taskCode || "TSK"}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}>
          {task.priority}
        </span>
      </div>
      
      <h4 className="text-sm font-bold text-[#2d3748] mb-1 leading-tight group-hover:text-[#3B82F6] transition-colors">{task.title}</h4>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#f0f3f5]">
        <div className="flex items-center gap-1.5">
          {task.assignedEmployee ? (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold" title={task.assignedEmployee?.fullName || "Assigned"}>
              {(task.assignedEmployee?.fullName?.[0] || "U").toUpperCase()}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] border border-dashed border-gray-300" title="Unassigned">
              ?
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-1 text-[11px] ${dueDateColor}`}>
          {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
          {dueDateText}
        </div>
      </div>
    </div>
  );
}
