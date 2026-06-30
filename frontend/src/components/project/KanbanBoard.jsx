import React, { useState } from 'react';
import KanbanCard from './KanbanCard';

const COLUMNS = [
  { id: "BACKLOG", label: "Backlog", color: "border-[#e2e8f0] bg-[#f7fafc]", text: "text-[#718096]" },
  { id: "TODO", label: "To Do", color: "border-blue-200 bg-blue-50/50", text: "text-blue-700" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-amber-200 bg-amber-50/50", text: "text-amber-700" },
  { id: "CODE_REVIEW", label: "Code Review", color: "border-purple-200 bg-purple-50/50", text: "text-purple-700" },
  { id: "TESTING", label: "Testing", color: "border-orange-200 bg-orange-50/50", text: "text-orange-700" },
  { id: "DONE", label: "Done", color: "border-emerald-200 bg-emerald-50/50", text: "text-emerald-700" }
];

export default function KanbanBoard({ tasks, onTaskMove, onTaskClick, isManagerOrAdmin, currentUserId }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [dragOverTask, setDragOverTask] = useState(null);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, colId, taskId = null) => {
    e.preventDefault();
    setDragOverCol(colId);
    setDragOverTask(taskId);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    
    if (!draggedTask) return;
    
    const colTasks = tasks.filter(t => t.status === colId).sort((a, b) => a.order - b.order);
    let targetIndex = colTasks.length;
    
    if (dragOverTask) {
      const hoverIndex = colTasks.findIndex(t => t._id === dragOverTask);
      if (hoverIndex !== -1) {
        targetIndex = hoverIndex;
      }
    }
    
    if (draggedTask.status !== colId || draggedTask._id !== dragOverTask) {
      onTaskMove(draggedTask._id, colId, targetIndex);
    }
    
    setDragOverCol(null);
    setDragOverTask(null);
    setDraggedTask(null);
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-dashed border-[#cbd5e1] min-h-[400px]">
        <h3 className="text-lg font-bold text-[#475569] mb-2">No tasks have been created yet.</h3>
        <p className="text-sm text-[#94a3b8] mb-6">Create your first task to start organizing your project.</p>
        {isManagerOrAdmin && (
          <button 
            onClick={() => onTaskClick(null)}
            className="px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg text-sm font-bold hover:bg-[#2563eb] transition-colors shadow-sm"
          >
            Create First Task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start min-h-[500px]">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id).sort((a, b) => a.order - b.order);
        
        return (
          <div 
            key={col.id}
            className={`flex-shrink-0 w-72 rounded-xl border-t-[3px] shadow-sm flex flex-col bg-[#fdfdfe] border-x border-b border-[#e2e8f0] ${
              dragOverCol === col.id ? "ring-2 ring-blue-400 bg-blue-50/20" : ""
            }`}
            style={{ borderTopColor: col.color.includes('blue') ? '#3B82F6' : col.color.includes('amber') ? '#F59E0B' : col.color.includes('purple') ? '#8B5CF6' : col.color.includes('orange') ? '#F97316' : col.color.includes('emerald') ? '#10B981' : '#94A3B8' }}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => {
              setDragOverCol(null);
              setDragOverTask(null);
            }}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="p-3 border-b border-[#e2e8f0] flex justify-between items-center bg-gray-50/50 rounded-t-xl">
              <h3 className={`text-sm font-bold ${col.text}`}>{col.label}</h3>
              <span className="bg-white border border-[#e2e8f0] text-[11px] font-bold text-[#718096] px-2 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>
            
            <div className="p-3 flex-1 flex flex-col gap-1 min-h-[150px]">
              {colTasks.length === 0 ? (
                <div className="flex-1 border-2 border-dashed border-[#e2e8f0] rounded-lg flex items-center justify-center text-xs font-medium text-[#a0aec0] bg-[#f7fafc]/50 p-4 text-center">
                  Drop Tasks Here
                </div>
              ) : (
                colTasks.map(task => {
                  const isAssignedToMe = task.assignedEmployee?._id === currentUserId || task.assignedEmployee === currentUserId;
                  const isDraggable = isManagerOrAdmin || isAssignedToMe;
                  const isDragOver = dragOverTask === task._id;
                  
                  return (
                    <div 
                      key={task._id}
                      onDragOver={(e) => {
                        e.stopPropagation();
                        handleDragOver(e, col.id, task._id);
                      }}
                      className={isDragOver ? "border-t-2 border-blue-500 pt-1" : ""}
                    >
                      <KanbanCard 
                        task={task} 
                        onClick={onTaskClick}
                        onDragStart={handleDragStart}
                        isDraggable={isDraggable}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
