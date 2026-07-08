import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  User,
  Users,
  Paperclip,
  Plus,
  Send,
  CheckSquare,
  Calendar,
  Search,
  BookOpen,
  Filter,
  TrendingUp,
  FileText,
  MessageSquare,
  HelpCircle,
  Activity,
  Award
} from "lucide-react";
import KanbanBoard from "../../components/project/KanbanBoard";
import TaskModal from "../../components/project/TaskModal";

// --- EXPANDED INITIAL STATE & MOCK DATA ---


import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ProjectDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = new URLSearchParams(location.search).get("projectId");
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks", "milestones", "time-tracking", "discussion"
  const [loading, setLoading] = useState(true);

  // Interaction State
  const [kanbanSearch, setKanbanSearch] = useState("");
  const [kanbanPriority, setKanbanPriority] = useState("All");
  const [kanbanAssignee, setKanbanAssignee] = useState("All");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [noteContentInput, setNoteContentInput] = useState("");
  const [noteType, setNoteType] = useState("Daily Status Update");
  const [hoursWorkedInput, setHoursWorkedInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    setIsUploadingDoc(true);
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setProject(prev => ({
          ...prev,
          documents: [data.document, ...(prev.documents || [])]
        }));
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading document');
    } finally {
      setIsUploadingDoc(false);
      e.target.value = null;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails(projectId);
    }
  }, [projectId]);


  const fetchProjectDetails = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/projects/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProject({
          ...data.project,
          tasks: data.tasks || [],
          milestones: data.milestones || [],
          workLogs: data.workLogs || [],
          discussions: data.discussions || [],
          documents: data.documents || []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const globalOpenTasks = project?.tasks?.filter(t => t.status !== "Completed").length || 0;
  const upcomingDeadlinesCount = globalOpenTasks;

  const calculateDaysRemaining = (end) => {
    const diff = Math.ceil((new Date(end) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Calculate Overall Progress of active project
  const calculateProgress = (project) => {
    return project?.progressPercentage || 0;
  };

  const isManagerOrAdmin = Boolean(
    user?.role === "admin" ||
    user?.role === "hr" ||
    user?.designation?.toLowerCase().includes("project manager") ||
    (project?.projectManager && user && (
      (project.projectManager._id === user._id) ||
      (project.projectManager.employeeId === user.employeeId) || 
      (project.projectManager === user.employeeId) ||
      (project.projectManager._id === user.employeeId) ||
      (project.projectManager === user._id)
    ))
  );

  const canUploadDoc = Boolean(
    isManagerOrAdmin ||
    (project?.assignedEmployees && user && project.assignedEmployees.some(emp => 
      emp._id === user._id || emp.employeeId === user.employeeId || emp === user._id || emp === user.employeeId
    ))
  );

  // Filter logic for Kanban Board
  const getFilteredTasks = () => {
    if (!project?.tasks) return [];
    return project.tasks.filter(t => {
      const matchesSearch = t.title?.toLowerCase().includes(kanbanSearch.toLowerCase()) || t.taskCode?.toLowerCase().includes(kanbanSearch.toLowerCase());
      const matchesPriority = kanbanPriority === "All" || t.priority === kanbanPriority;
      const currentEmployeeId = user?.employeeId || user?.employee?._id || user?._id;
      const matchesAssignee = kanbanAssignee === "All" || (
         kanbanAssignee === "Unassigned" ? !t.assignedEmployee :
         kanbanAssignee === currentEmployeeId ? ((t.assignedEmployee?._id || t.assignedEmployee) === currentEmployeeId) :
         ((t.assignedEmployee?._id || t.assignedEmployee) === kanbanAssignee)
      );
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  };

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (formData, taskId) => {
    try {
      const url = taskId 
        ? `http://localhost:5000/api/projects/tasks/${taskId}/edit`
        : `http://localhost:5000/api/projects/${project._id}/tasks`;
      
      const method = taskId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
        fetchProjectDetails(project._id);
      } else {
        alert(data.message || "Failed to save task");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskMove = async (taskId, newStatus, targetIndex) => {
    if (!project) return;
    
    let newTasks = [...(project.tasks || [])];
    const taskIndex = newTasks.findIndex(t => t._id === taskId);
    if (taskIndex === -1) return;
    
    const taskToMove = { ...newTasks[taskIndex], status: newStatus };
    newTasks.splice(taskIndex, 1);
    
    const colTasks = newTasks.filter(t => t.status === newStatus).sort((a,b) => a.order - b.order);
    if (targetIndex !== undefined) {
       colTasks.splice(targetIndex, 0, taskToMove);
    } else {
       colTasks.push(taskToMove);
    }
    
    colTasks.forEach((t, idx) => { t.order = idx; });
    
    const calculatedUpdates = colTasks.map(t => ({
      taskId: t._id,
      order: t.order,
      status: t.status
    }));
    
    newTasks = newTasks.filter(t => t.status !== newStatus).concat(colTasks);
    setProject(prev => ({ ...prev, tasks: newTasks }));

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${project._id}/tasks/order`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ updates: calculatedUpdates })
      });
      if (res.ok) {
        fetchProjectDetails(project._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
        fetchProjectDetails(project._id);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete task");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Employee Work Note / Blocker
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContentInput.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${project._id}/worklogs`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          type: noteType,
          note: noteContentInput,
          hoursWorked: Number(hoursWorkedInput) || 0
        })
      });
      if (res.ok) {
        setNoteContentInput("");
        setHoursWorkedInput("");
        fetchProjectDetails(project._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Comment on Project Discussion Board
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${project._id}/discussions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ message: commentInput })
      });
      if (res.ok) {
        setCommentInput("");
        fetchProjectDetails(project._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !project) {
    return <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center font-bold text-[#718096]">Loading Workspace...</div>;
  }

  // Calculate Metrics for Active Project
  const loggedHours = project?.workLogs?.reduce((acc, log) => acc + (log.hoursWorked || 0), 0) || 0;
  const estimatedHours = project?.estimatedHours || 0;
  const timeLeft = Math.max(0, estimatedHours - loggedHours);

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#2d3748] p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">My Assigned Projects</h1>
          <p className="text-sm text-[#718096] mt-1">
            Review requirements, coordinate tasks, log hours, and communicate on your specific projects.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full border border-[#e2e8f0] shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-sm shadow-inner uppercase">
            {user?.employee?.firstName?.[0] || user?.name?.[0] || "E"}
          </div>
          <div className="text-left pr-2">
            <p className="text-sm font-bold text-[#2d3748] leading-none">{user?.employee?.fullName || user?.name || "Employee"}</p>
            <p className="text-[11px] text-[#718096] mt-0.5">{user?.employee?.designation || "Staff"}</p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-[#f7fafc] p-4 sm:p-8">
      {project && (
        <>
          <div className="mb-4">
            <button onClick={() => navigate('?tab=projects')} className="flex items-center gap-1 text-sm font-bold text-[#3B82F6] hover:underline">
              <ArrowLeft size={16} /> Back to Projects
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-md overflow-hidden w-full max-w-7xl mx-auto">
            
            {/* Workbench Header */}
            <div className="bg-blue-50/30 border-b border-[#e2e8f0] p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#3B82F6] text-white text-[11px] px-2.5 py-1 rounded-md font-black shadow-sm">{project.projectCode}</span>
                    <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">{project.department?.departmentName || "General"}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#2d3748] leading-tight">{project.projectName}</h2>
                  <p className="text-sm text-[#718096] mt-1.5 max-w-2xl">{project.description}</p>
                </div>

                <div className="text-left md:text-right bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm">
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Project Manager</p>
                  <p className="text-base font-bold text-[#2d3748]">{project.projectManager ? (project.projectManager.employeeName || project.projectManager.fullName || (project.projectManager.firstName ? `${project.projectManager.firstName} ${project.projectManager.lastName}` : "Unnamed Manager")) : "Not Assigned"}</p>
                  <p className="text-xs text-[#718096] mt-0.5">{project.projectManager?.designation}</p>
                </div>
              </div>

              {/* Quick Workbench Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#e2e8f0]/60">
                <div>
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Timeline</p>
                  <p className="text-sm font-bold text-[#2d3748]">{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Est. Hours</p>
                  <p className="text-sm font-bold text-[#2d3748]">{estimatedHours} hrs</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Logged Hours</p>
                  <p className="text-sm font-bold text-[#1E293B]">{loggedHours} hrs</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Time Left</p>
                  <p className="text-sm font-bold text-rose-600">{timeLeft} days remaining</p>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-[#e2e8f0] bg-white overflow-x-auto">
              {[
                { id: "tasks", label: "My Tasks", icon: CheckSquare, count: project.tasks?.length || 0 },
                { id: "milestones", label: "Milestones", icon: Award, count: project.milestones?.length || 0 },
                { id: "time-tracking", label: "Time & Notes", icon: Clock },
                { id: "discussion", label: "Discussions", icon: MessageSquare, count: project.discussions?.length || 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[130px] py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id 
                      ? "border-[#3B82F6] text-[#1E293B] bg-blue-50/30" 
                      : "border-transparent text-[#718096] hover:text-[#2d3748] hover:bg-[#f7fafc]"
                  }`}
                >
                  <tab.icon size={16} /> {tab.label} {tab.count !== undefined && `(${tab.count})`}
                </button>
              ))}
            </div>

      {/* TAB CONTENTS */}
            <div className="p-6 sm:p-8 bg-white">
              
              {/* TAB 1: MY TASKS */}
              {activeTab === "tasks" && (
                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <h3 className="text-base font-bold text-[#2d3748]">Project Tasks Kanban</h3>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-[#a0aec0]" />
                        <input 
                          type="text" 
                          placeholder="Search tasks..." 
                          className="w-48 pl-8 pr-3 py-1.5 bg-[#f7fafc] border border-[#e2e8f0] rounded-lg text-xs focus:outline-none focus:border-[#3B82F6] transition-all"
                          value={kanbanSearch}
                          onChange={(e) => setKanbanSearch(e.target.value)}
                        />
                      </div>
                      
                      <select 
                        className="bg-[#f7fafc] border border-[#e2e8f0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#4a5568] focus:outline-none focus:border-[#3B82F6]"
                        value={kanbanAssignee}
                        onChange={(e) => setKanbanAssignee(e.target.value)}
                      >
                        <option value="All">All Assignees</option>
                        <option value={user?.employeeId || user?.employee?._id || user?._id}>Assigned to Me</option>
                        <option value="Unassigned">Unassigned</option>
                        {project.assignedEmployees?.map((e, index) => (
                           <option key={e._id || e.employeeId || `emp-${index}`} value={e._id || e.employeeId || e}>{e.employeeName || e.fullName || (e.firstName ? `${e.firstName} ${e.lastName}` : (typeof e === 'string' ? e : "Unknown"))}</option>
                        ))}
                      </select>

                      <select 
                        className="bg-[#f7fafc] border border-[#e2e8f0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#4a5568] focus:outline-none focus:border-[#3B82F6]"
                        value={kanbanPriority}
                        onChange={(e) => setKanbanPriority(e.target.value)}
                      >
                        <option value="All">All Priorities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>

                      {isManagerOrAdmin && (
                        <button 
                          onClick={openNewTaskModal}
                          className="px-4 py-1.5 bg-[#3B82F6] text-white rounded-lg text-xs font-bold hover:bg-[#2563eb] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Plus size={14} /> New Task
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <KanbanBoard 
                    tasks={getFilteredTasks()} 
                    onTaskMove={handleTaskMove}
                    onTaskClick={openEditTaskModal}
                    isManagerOrAdmin={isManagerOrAdmin}
                    currentUserId={user?.employeeId || user?.employee?._id || user?._id}
                  />

                  <TaskModal 
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleSaveTask}
                    onDelete={handleDeleteTask}
                    task={selectedTask}
                    projectMembers={project.assignedEmployees || []}
                    isManagerOrAdmin={isManagerOrAdmin}
                    currentUserId={user?.employeeId || user?.employee?._id || user?._id}
                  />
                </div>
              )}

              {/* TAB 2: MILESTONES */}
              {activeTab === "milestones" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-[#2d3748]">Project Execution Roadmap</h3>
                    <span className="text-sm text-[#718096] font-medium">Track major goals</span>
                  </div>

                  <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e8f0]">
                    {project.milestones?.length === 0 ? (
                      <p className="text-sm text-[#718096] italic p-4 bg-[#f7fafc] rounded-lg text-center border border-dashed border-[#e2e8f0]">No Milestones Found</p>
                    ) : (project.milestones || []).map((milestone) => (
                      <div key={milestone._id} className="flex gap-5 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm border ${
                          milestone.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          milestone.status === "In Progress" ? "bg-blue-50 text-[#1E293B] border-blue-200" :
                          "bg-white text-[#a0aec0] border-[#e2e8f0]"
                        }`}>
                          {milestone.status === "Completed" ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        
                        <div className="flex-1 bg-[#f7fafc] p-5 rounded-xl border border-[#e2e8f0] hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                            <div>
                              <h4 className="text-sm font-bold text-[#2d3748]">{milestone.title}</h4>
                              <p className="text-xs font-medium text-[#718096] mt-1">Due Date: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              milestone.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                              milestone.status === "In Progress" ? "bg-blue-100 text-[#1E293B]" :
                              "bg-[#e2e8f0] text-[#718096]"
                            }`}>
                              {milestone.status}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-[#718096]">
                              <span>Status Completion</span>
                              <span className={milestone.status === "In Progress" ? "text-[#1E293B]" : ""}>{milestone.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ease-out ${
                                milestone.status === "Completed" ? "bg-emerald-500" : "bg-[#3B82F6]"
                              }`} style={{ width: `${milestone.progress}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: TIME TRACKING & DAILY WORK NOTES */}
              {activeTab === "time-tracking" && (
                <div className="space-y-8">
                  
                  {/* Time Performance Widget */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-[#f7fafc] p-5 rounded-xl border border-[#e2e8f0]">
                      <p className="text-[11px] text-[#718096] font-bold uppercase tracking-wider">Total Logged Hours</p>
                      <h4 className="text-3xl font-black text-[#1E293B] mt-2">{loggedHours}h</h4>
                      <p className="text-xs text-[#718096] mt-2 font-medium">Logged on active branch</p>
                    </div>
                    <div className="bg-[#f7fafc] p-5 rounded-xl border border-[#e2e8f0]">
                      <p className="text-[11px] text-[#718096] font-bold uppercase tracking-wider">Estimated Budget</p>
                      <h4 className="text-3xl font-black text-[#2d3748] mt-2">{estimatedHours}h</h4>
                      <p className="text-xs text-[#718096] mt-2 font-medium">Total expected hours</p>
                    </div>
                    <div className="bg-[#f7fafc] p-5 rounded-xl border border-[#e2e8f0]">
                      <p className="text-[11px] text-[#718096] font-bold uppercase tracking-wider">Remaining (Estimate)</p>
                      <h4 className="text-3xl font-black text-[#718096] mt-2">{timeLeft}h</h4>
                      <p className="text-xs text-[#718096] mt-2 font-medium">Est. Completion Budget</p>
                    </div>
                  </div>

                  {/* Add Work note/Blocker form */}
                  <form onSubmit={handleAddNote} className="space-y-5 bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
                    <h3 className="text-base font-bold text-[#2d3748]">Log Daily Work Note / Blockers</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        className="sm:col-span-1 p-2.5 text-sm bg-[#f7fafc] border border-[#e2e8f0] rounded-lg outline-none text-[#2d3748] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] cursor-pointer transition-all"
                      >
                        <option value="Update">Daily Status Update</option>
                        <option value="Blocker">Blocker (Requires PM Help)</option>
                        <option value="Issue">Tech Issue Faced</option>
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Write details of what you completed, or issues faced..."
                        value={noteContentInput}
                        onChange={(e) => setNoteContentInput(e.target.value)}
                        className="sm:col-span-2 px-4 py-2.5 text-sm bg-[#f7fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg text-sm font-bold hover:bg-[#1e3a8a] transition-colors shadow-sm">
                        Add Daily Note
                      </button>
                    </div>
                  </form>

                  {/* Logged Notes feed */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#a0aec0] uppercase tracking-wider border-b border-[#e2e8f0] pb-2">Recent Work Logs</h4>
                    {project.workLogs?.length === 0 ? (
                      <p className="text-sm text-[#718096] italic p-4 bg-[#f7fafc] rounded-lg text-center border border-dashed border-[#e2e8f0]">No daily notes logged yet.</p>
                    ) : (project.workLogs || []).map((note) => (
                      <div key={note._id} className="p-4 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#cbd5e1] transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] font-bold text-[#718096] flex items-center gap-1.5"><Calendar size={12}/> {new Date(note.createdAt).toLocaleDateString()}</span>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 text-[10px] font-bold bg-gray-100 text-gray-700 rounded-md">Hrs: {note.hoursWorked}</span>
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                              note.type === "Blocker" ? "bg-rose-50 text-rose-600" :
                              note.type === "Tech Issue" ? "bg-amber-50 text-amber-600" :
                              "bg-blue-50 text-[#1E293B]"
                            }`}>
                              {note.type}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-[#2d3748] leading-relaxed">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: DISCUSSION BOARD */}
              {activeTab === "discussion" && (
                <div className="space-y-6 flex flex-col h-[400px]">
                  
                  {/* Messages Area */}
                  {project.discussions?.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-[#718096] italic bg-[#f7fafc] rounded-xl border border-dashed border-[#e2e8f0]">No Messages Found</div>
                  ) : (
                  <div className="space-y-4 flex-1 overflow-y-auto pr-3 custom-scrollbar">
                    {(project.discussions || []).map((msg) => (
                      <div key={msg._id} className={`p-4 bg-[#f7fafc] border border-[#e2e8f0] rounded-2xl rounded-tl-sm space-y-1.5 hover:border-[#cbd5e1] transition-colors w-[90%]`}>
                        <div className="flex justify-between items-center text-[11px] font-bold text-[#718096]">
                          <span className="text-[#1E293B]">{msg.sender?.fullName || "Employee"}</span>
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-[#2d3748] leading-relaxed">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  )}

                  {/* Send Message Form */}
                  <form onSubmit={handleAddComment} className="flex gap-3 pt-4 border-t border-[#e2e8f0] mt-auto">
                    <input
                      type="text"
                      placeholder="Ask tech lead, query project manager, or send update to team..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="flex-1 px-4 py-3 text-sm bg-[#f7fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                    />
                    <button type="submit" className="px-5 py-3 bg-[#3B82F6] text-white rounded-xl hover:bg-[#1e3a8a] shrink-0 transition-colors shadow-sm flex items-center justify-center gap-2 font-bold text-sm">
                      Send <Send size={16} />
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        {/* RIGHT COLUMN: TEAM INFO, DOCS, RECENT UPDATES, DEADLINES */}
        <div className="space-y-8">

          {/* TEAM MEMBERS SECTION */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
            <h3 className="text-base font-bold text-[#2d3748] flex items-center gap-2.5 mb-5 border-b border-[#e2e8f0] pb-3">
              <Users size={18} className="text-[#1E293B]" />
              Project Team
            </h3>

            <div className="space-y-5">
              
              {/* Leaders */}
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-2 hover:bg-[#f7fafc] rounded-lg transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E293B] font-bold text-sm shrink-0">
                    PM
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2d3748]">{project.projectManager?.fullName || "Not Assigned"}</p>
                    <p className="text-[11px] font-medium text-[#718096]">Project Manager</p>
                  </div>
                </div>

                {/* Team Lead */}
                <div className="flex items-center gap-3.5 p-2 hover:bg-[#f7fafc] rounded-lg transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E293B] font-bold text-sm shrink-0">
                    TL
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2d3748]">Not Assigned</p>
                    <p className="text-[11px] font-medium text-[#718096]">Team Lead / Tech Lead</p>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="border-t border-[#e2e8f0] pt-4">
                <p className="text-[11px] font-bold text-[#a0aec0] uppercase tracking-wider mb-3 px-2">Team Members ({project.assignedEmployees?.length || 0})</p>
                <div className="space-y-1">
                  {(project.assignedEmployees || []).map((member, index) => {
                    const memName = member.employeeName || member.fullName || (member.firstName ? `${member.firstName} ${member.lastName}` : (typeof member === 'string' ? member : "Unknown Member"));
                    return (
                    <div key={member._id || member.employeeId || `mem-${index}`} className="flex items-center gap-3.5 p-2 hover:bg-[#f7fafc] rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#f7fafc] border border-[#e2e8f0] flex items-center justify-center text-[#718096] font-bold text-xs shrink-0">
                        {memName.charAt(0) || "E"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#2d3748] truncate">{memName}</p>
                        <p className="text-[11px] font-medium text-[#718096]">{member.designation || "Member"} ({member.department?.departmentName || "Dept"})</p>
                      </div>
                    </div>
                  )})}
                </div>
              </div>

            </div>
          </div>

          {/* PROJECT PERFORMANCE */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
            <h3 className="text-base font-bold text-[#2d3748] flex items-center gap-2.5 mb-5 border-b border-[#e2e8f0] pb-3">
              <TrendingUp size={18} className="text-[#1E293B]" />
              My Project Performance
            </h3>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-[#f7fafc] p-4 rounded-xl border border-[#e2e8f0]">
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Tasks Done</p>
                <p className="text-2xl font-black text-[#2d3748] mt-1.5">
                  {project.tasks?.filter(t => t.status === "Completed").length || 0}
                </p>
              </div>
              <div className="bg-[#f7fafc] p-4 rounded-xl border border-[#e2e8f0]">
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Tasks Pending</p>
                <p className="text-2xl font-black text-[#2d3748] mt-1.5">
                  {project.tasks?.filter(t => t.status !== "Completed").length || 0}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 rounded hover:bg-[#f7fafc]">
                <span className="text-[#718096] font-medium">Task Completion Rate</span>
                <span className="font-bold text-[#1E293B]">
                  {project.tasks?.length > 0 
                    ? Math.round((project.tasks.filter(t => t.status === "Completed").length / project.tasks.length) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-[#f7fafc]">
                <span className="text-[#718096] font-medium">Productivity Score</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  94/100 <Activity size={14} />
                </span>
              </div>
            </div>
          </div>

          {/* PROJECT DOCUMENTS */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
            <div className="flex justify-between items-center mb-5 border-b border-[#e2e8f0] pb-3">
              <h3 className="text-base font-bold text-[#2d3748] flex items-center gap-2.5">
                <Paperclip size={18} className="text-[#1E293B]" />
                Project Files & Docs
              </h3>
              {canUploadDoc && (
                <div>
                  <input type="file" id="docUpload" className="hidden" onChange={handleDocumentUpload} disabled={isUploadingDoc} />
                  <label htmlFor="docUpload" className="text-sm font-bold bg-[#3B82F6] text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors flex items-center gap-1">
                    {isUploadingDoc ? 'Uploading...' : <><Plus size={16} /> Upload</>}
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {(project.documents || []).length === 0 ? (
                <p className="text-sm text-[#718096] italic text-center py-5 bg-[#f7fafc] rounded-xl border border-dashed border-[#e2e8f0]">No documents uploaded yet.</p>
              ) : (
                (project.documents || []).map((doc, idx) => (
                  <div key={doc._id || idx} className="flex items-center justify-between p-3 bg-[#f7fafc] rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-white transition-all cursor-pointer group" onClick={() => window.open(doc.fileUrl || doc.url, '_blank')}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-blue-50 p-2 rounded-lg text-[#1E293B] shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#2d3748] truncate">{doc.name}</p>
                        <span className="text-[11px] font-medium text-[#718096]">
                          {doc.sizeBytes ? (doc.sizeBytes / 1024).toFixed(2) + ' KB' : (doc.size || 'Unknown size')} &bull; {doc.format || doc.type || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <button className="text-[11px] font-bold text-[#1E293B] opacity-0 group-hover:opacity-100 transition-opacity hover:underline shrink-0 px-2">
                      Open
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* UPCOMING DEADLINES WIDGET */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
            <h3 className="text-base font-bold text-[#2d3748] flex items-center gap-2.5 mb-5 border-b border-[#e2e8f0] pb-3">
              <AlertTriangle size={18} className="text-rose-600" />
              Immediate Deadlines
            </h3>

            <div className="space-y-3.5">
              {project.tasks?.filter(t => t.status !== "Completed").slice(0, 3).map((task) => (
                <div key={task._id} className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2 hover:border-rose-200 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-bold text-rose-800 line-clamp-2">{task.title}</span>
                    <span className="shrink-0 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] font-medium text-rose-600/80 leading-none">Project: {project.projectName}</p>
                </div>
              ))}
              {project.tasks?.filter(t => t.status !== "Completed").length === 0 && (
                <p className="text-sm text-[#718096] italic text-center py-5 bg-[#f7fafc] rounded-xl border border-dashed border-[#e2e8f0]">No pending tasks for this project.</p>
              )}
            </div>
          </div>

          {/* RECENT PROJECT UPDATES (TIMELINE) */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
            <h3 className="text-base font-bold text-[#2d3748] flex items-center gap-2.5 mb-5 border-b border-[#e2e8f0] pb-3">
              <Activity size={18} className="text-[#1E293B]" />
              Recent Updates & Activity
            </h3>

            <div className="space-y-5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e8f0]">
              {(project.updates || []).map((update, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-[#3B82F6] flex items-center justify-center shrink-0 z-10 text-[9px] font-black text-[#1E293B] shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-bold text-[#2d3748] leading-tight">{update.action}</p>
                    <p className="text-xs text-[#718096] leading-relaxed mt-1">{update.detail}</p>
                    <span className="text-[10px] font-medium text-[#a0aec0] mt-1.5 block flex items-center gap-1"><Clock size={10}/>{update.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        </>
        )}
      </div>
    </div>
  );
}
