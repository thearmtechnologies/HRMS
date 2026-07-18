import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, onDelete, task, projectMembers, isManagerOrAdmin, currentUserId }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    estimatedHours: 0,
    spentHours: 0,
    assignedEmployee: "",
    status: "TODO"
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        estimatedHours: task.estimatedHours || 0,
        spentHours: task.spentHours || 0,
        assignedEmployee: task.assignedEmployee?._id || task.assignedEmployee || "",
        status: task.status || "TODO"
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        estimatedHours: 0,
        spentHours: 0,
        assignedEmployee: currentUserId || "",
        status: "TODO"
      });
    }
  }, [task, isOpen, currentUserId]);

  if (!isOpen) return null;

  const isAssignedToMe = task && (task.assignedEmployee?._id === currentUserId || task.assignedEmployee === currentUserId);
  const canEditDetails = !task || isManagerOrAdmin; 
  const canEditStatus = !task || isManagerOrAdmin || isAssignedToMe;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, task ? task._id : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
        
        <div className="flex justify-between items-center p-5 border-b border-[#e2e8f0] bg-gray-50/50">
          <h2 className="text-lg font-bold text-[#1E293B]">
            {task ? `Task: ${task.taskCode || "Edit Task"}` : "Create New Task"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#e2e8f0] rounded-full transition-colors text-[#718096]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            
            {/* Title */}
            <div>
              <label htmlFor="taskTitle" className="block text-sm font-bold text-[#2d3748] mb-1.5">Task Title *</label>
              <input
                id="taskTitle"
                name="title"
                type="text"
                required
                disabled={!canEditDetails}
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#f7fafc] border border-[#e2e8f0] rounded-lg focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all disabled:opacity-60 text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="taskDescription" className="block text-sm font-bold text-[#2d3748] mb-1.5">Description</label>
              <textarea
                id="taskDescription"
                name="description"
                disabled={!canEditDetails}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#f7fafc] border border-[#e2e8f0] rounded-lg focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all disabled:opacity-60 min-h-[100px] text-sm"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Assignee */}
              <div>
                <label htmlFor="taskAssignedEmployee" className="block text-sm font-bold text-[#2d3748] mb-1.5">Assign To</label>
                <select
                  id="taskAssignedEmployee"
                  name="assignedEmployee"
                  disabled={!canEditDetails}
                  value={formData.assignedEmployee}
                  onChange={(e) => setFormData({...formData, assignedEmployee: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f7fafc] border border-[#e2e8f0] rounded-lg focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all disabled:opacity-60 text-sm"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(member => (
                    <option key={member._id || member.employeeId} value={member._id || member.employeeId}>
                      {member.fullName || member.employeeName || "Employee"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="taskPriority" className="block text-sm font-bold text-[#2d3748] mb-1.5">Priority</label>
                <select
                  id="taskPriority"
                  name="priority"
                  disabled={!canEditDetails}
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f7fafc] border border-[#e2e8f0] rounded-lg focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all disabled:opacity-60 text-sm"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="taskDueDate" className="block text-sm font-bold text-[#2d3748] mb-1.5">Due Date *</label>
                <input
                  id="taskDueDate"
                  name="dueDate"
                  type="date"
                  required
                  disabled={!canEditDetails}
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f7fafc] border border-[#e2e8f0] rounded-lg focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all disabled:opacity-60 text-sm"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="taskStatus" className="block text-sm font-bold text-[#2d3748] mb-1.5">Status</label>
                <select
                  id="taskStatus"
                  name="status"
                  disabled={!canEditStatus}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#f7fafc] border border-[#e2e8f0] rounded-lg focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all disabled:opacity-60 text-sm font-bold text-blue-700"
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CODE_REVIEW">Code Review</option>
                  <option value="TESTING">Testing</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              {/* Hours */}
              <div>
                <label htmlFor="taskEstimatedHours" className="block text-sm font-bold text-[#2d3748] mb-1.5">Est. Hours</label>
                <input
                  id="taskEstimatedHours"
                  name="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  disabled={!canEditDetails}
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({...formData, estimatedHours: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-[#f7fafc] border border-[#e2e8f0] rounded-lg focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all disabled:opacity-60 text-sm"
                />
              </div>

              <div>
                <label htmlFor="taskSpentHours" className="block text-sm font-bold text-[#2d3748] mb-1.5">Spent Hours</label>
                <input
                  id="taskSpentHours"
                  name="spentHours"
                  type="number"
                  min="0"
                  step="0.5"
                  disabled={!canEditStatus} // Assignee can log hours
                  value={formData.spentHours}
                  onChange={(e) => setFormData({...formData, spentHours: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-[#f7fafc] border border-[#e2e8f0] rounded-lg focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all disabled:opacity-60 text-sm"
                />
              </div>
            </div>

            {/* Audit Trail Info (ReadOnly) */}
            {task && (
              <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-[#a0aec0] uppercase tracking-wider">Audit Trail</h4>
                  <div className="text-[10px] text-[#718096]">
                    Created by <span className="font-bold">{task.createdBy?.fullName || task.createdBy?.employeeName || 'Unknown'}</span> on {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto text-xs text-[#718096]">
                  {task.history?.map((h, i) => (
                    <div key={i} className="flex justify-between items-start py-1 border-b border-[#f0f3f5] last:border-0">
                      <div>
                        <span className="font-bold text-[#2d3748]">{h.action}</span>
                        {h.details && <span className="ml-1 text-[#a0aec0]">- {h.details}</span>}
                        <span className="ml-1 italic">by {h.user?.fullName || h.user?.employeeName || 'Unknown'}</span>
                      </div>
                      <div className="text-right whitespace-nowrap ml-4">
                        {new Date(h.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {(!task.history || task.history.length === 0) && <p>No history available.</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[#e2e8f0]">
            <div>
              {task && isManagerOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this task? This cannot be undone.")) {
                      onDelete(task._id);
                    }
                  }}
                  className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                >
                  Delete Task
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-[#718096] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f7fafc] hover:text-[#2d3748] transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canEditStatus && !canEditDetails}
                className="px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg text-sm font-bold hover:bg-[#1e3a8a] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {task ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
