import React, { useState } from "react";
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

// --- EXPANDED INITIAL STATE & MOCK DATA ---
const INITIAL_PROJECTS = [
  {
    id: "PRJ-2026-01",
    name: "HRMS Development",
    code: "PRJ001",
    description: "Architect and develop the internal core human resource management modules including Attendance, Leave Management, and Employee Directories.",
    department: "Information Technology",
    category: "Software Development",
    priority: "High",
    status: "In Progress",
    startDate: "01 Jun 2026",
    endDate: "31 Aug 2026",
    deadline: "31 Aug 2026",
    daysRemaining: 82,
    projectManager: { name: "John Smith", role: "Project Manager", dept: "Management" },
    teamLead: { name: "David Michael", role: "Tech Lead", dept: "IT" },
    teamMembers: [
      { name: "Sarah Johnson", role: "HR Analyst", dept: "HR" },
      { name: "Rahul Kumar", role: "Frontend Dev", dept: "IT" },
      { name: "Amelie Laurent", role: "UI Designer", dept: "IT" },
      { name: "Alex Chen", role: "Backend Dev", dept: "IT" }
    ],
    milestones: [
      { name: "Database Schema Sign-off", status: "Completed", pct: 100, dueDate: "10 Jun 2026" },
      { name: "UI Design Approval", status: "Completed", pct: 100, dueDate: "15 Jun 2026" },
      { name: "Frontend Core Modules", status: "In Progress", pct: 75, dueDate: "15 Jul 2026" },
      { name: "Attendance & GPS Integration", status: "Pending", pct: 0, dueDate: "30 Jul 2026" },
      { name: "Security Architecture Review", status: "Pending", pct: 0, dueDate: "15 Aug 2026" }
    ],
    tasks: [
      { id: "TSK-01", name: "Design Live Clock Widget UI", description: "Design responsive, high-fidelity clock widget matching corporate color palettes.", priority: "High", status: "Completed", dueDate: "08 Jun 2026" },
      { id: "TSK-02", name: "Attendance Grid Logic Implementation", description: "Develop React state tables to support responsive attendance logs for employees.", priority: "High", status: "In Progress", dueDate: "15 Jun 2026" },
      { id: "TSK-03", name: "Integrate GPS Tracking Module", description: "Connect HTML5 Geolocation API with office radius boundary coordinates.", priority: "Medium", status: "To Do", dueDate: "25 Jun 2026" },
      { id: "TSK-04", name: "Regularization Request Form Workflow", description: "Build UI modal inputs permitting missed-punch regularization overrides.", priority: "Low", status: "To Do", dueDate: "10 Jul 2026" }
    ],
    timeTracking: {
      workedToday: 4.5,
      workedThisWeek: 22.0,
      loggedTotal: 110.5,
      estimatedHours: 240,
      remainingHours: 129.5
    },
    documents: [
      { name: "HRMS_Requirements_Spec.pdf", size: "4.2 MB", type: "PDF" },
      { name: "GPS_API_Endpoints.md", size: "12 KB", type: "Doc" },
      { name: "Figma_Design_Assets.url", size: "Link", type: "URL" }
    ],
    updates: [
      { action: "Milestone Completed", detail: "UI Design Approved by David Michael", time: "Today, 10:30 AM" },
      { action: "Task Status Updated", detail: "Rahul Kumar moved 'Design Live Clock Widget UI' to Completed", time: "Yesterday" },
      { action: "Document Uploaded", detail: "Sarah Johnson uploaded HRMS_Requirements_Spec.pdf", time: "05 Jun 2026" }
    ],
    discussion: [
      { sender: "David Michael (Tech Lead)", text: "Hey Team, please prioritize the Attendance Grid implementation so we can review the live state logs by Friday.", time: "Yesterday, 4:15 PM" },
      { sender: "Amelie Laurent (UI Designer)", text: "I've added the Figma design assets URL to the documents section. Tonal colors match exactly.", time: "Yesterday, 5:30 PM" }
    ],
    notes: [
      { date: "09 Jun 2026", content: "Successfully matched clock state logs to browser local times. Checked UI container scaling.", type: "Update" }
    ]
  },
  {
    id: "PRJ-2026-02",
    name: "CRM Portal Integration",
    code: "PRJ002",
    description: "Sync Sales leads pipeline seamlessly into ERP databases for marketing operations.",
    department: "Sales & Marketing",
    category: "CRM & ERP",
    priority: "Medium",
    status: "In Progress",
    startDate: "15 May 2026",
    endDate: "15 Jul 2026",
    deadline: "15 Jul 2026",
    daysRemaining: 35,
    projectManager: { name: "Lisa Wong", role: "Project Manager", dept: "Management" },
    teamLead: { name: "Marcus Brody", role: "Lead Dev", dept: "IT" },
    teamMembers: [
      { name: "Rahul Kumar", role: "Integrator", dept: "IT" }
    ],
    milestones: [
      { name: "API Key Security Layer", status: "Completed", pct: 100, dueDate: "28 May 2026" },
      { name: "Sync Lead Form Pipeline", status: "In Progress", pct: 40, dueDate: "30 Jun 2026" }
    ],
    tasks: [
      { id: "TSK-201", name: "Validate CRM Sync Webhook", description: "Ensure automated posts transfer cleanly without missing attributes.", priority: "High", status: "In Progress", dueDate: "18 Jun 2026" }
    ],
    timeTracking: {
      workedToday: 2.0,
      workedThisWeek: 12.0,
      loggedTotal: 65.0,
      estimatedHours: 150,
      remainingHours: 85.0
    },
    documents: [
      { name: "CRM_Field_Mappings.xlsx", size: "1.8 MB", type: "Sheet" }
    ],
    updates: [
      { action: "API Handshake Approved", detail: "Webhook secured using custom authorization keys.", time: "02 Jun 2026" }
    ],
    discussion: [
      { sender: "Lisa Wong (PM)", text: "Let me know if there are any blocker fields on customer validation profiles.", time: "04 Jun 2026" }
    ],
    notes: []
  },
  {
    id: "PRJ-2026-03",
    name: "Corporate Website Redesign",
    code: "PRJ003",
    description: "Overhaul corporate frontend styling to improve user conversions and modern appearance.",
    department: "Marketing",
    category: "Web Frontend",
    priority: "Low",
    status: "On Hold",
    startDate: "01 Apr 2026",
    endDate: "30 Sep 2026",
    deadline: "30 Sep 2026",
    daysRemaining: 112,
    projectManager: { name: "Lisa Wong", role: "Project Manager", dept: "Management" },
    teamLead: { name: "Amelie Laurent", role: "Lead Designer", dept: "IT" },
    teamMembers: [
      { name: "Rahul Kumar", role: "Frontend Dev", dept: "IT" }
    ],
    milestones: [
      { name: "Landing Wireframe Review", status: "Completed", pct: 100, dueDate: "15 Apr 2026" }
    ],
    tasks: [
      { id: "TSK-301", name: "Revise Brand Color Guidelines", description: "Audit current color distributions against accessibility principles.", priority: "Low", status: "To Do", dueDate: "25 Aug 2026" }
    ],
    timeTracking: {
      workedToday: 0,
      workedThisWeek: 3.5,
      loggedTotal: 34.0,
      estimatedHours: 120,
      remainingHours: 86.0
    },
    documents: [
      { name: "Redesign_Brief.pdf", size: "12.5 MB", type: "PDF" }
    ],
    updates: [
      { action: "Project On-Hold", detail: "Temporarily paused for resource alignment.", time: "10 May 2026" }
    ],
    discussion: [],
    notes: []
  }
];

export default function EmployeeProject() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState("PRJ-2026-01");
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks", "milestones", "time-tracking", "discussion"
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Interaction State
  const [taskInput, setTaskInput] = useState("");
  const [taskDescriptionInput, setTaskDescriptionInput] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [noteContentInput, setNoteContentInput] = useState("");
  const [noteType, setNoteType] = useState("Update");
  const [commentInput, setCommentInput] = useState("");

  // Select Currently Active Project Data
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Helper Stats Computed Dynamically
  const totalAssignedCount = projects.length;
  const activeCount = projects.filter(p => p.status === "In Progress").length;
  const completedCount = projects.filter(p => p.status === "Completed").length;
  const pendingCount = projects.filter(p => p.status === "Not Started" || p.status === "On Hold").length;
  const overdueCount = projects.filter(p => p.daysRemaining < 0 && p.status !== "Completed").length;
  const upcomingDeadlinesCount = projects.reduce((acc, p) => acc + p.tasks.filter(t => t.status !== "Completed").length, 0);

  // Filter Projects for Left Column Sidebar List
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "All" || p.priority === filterPriority;
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Calculate Overall Progress of active project
  const calculateProgress = (project) => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    const completedCount = project.milestones.filter(m => m.status === "Completed").length;
    return Math.round((completedCount / project.milestones.length) * 100);
  };

  // Add Task to Active Project
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const newTask = {
      id: `TSK-${Date.now()}`,
      name: taskInput,
      description: taskDescriptionInput || "No description provided.",
      priority: taskPriority,
      status: "To Do",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }) // Due in 7 days
    };

    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          tasks: [newTask, ...p.tasks],
          updates: [{ action: "Task Created", detail: `You added task '${newTask.name}'`, time: "Just now" }, ...p.updates]
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setTaskInput("");
    setTaskDescriptionInput("");
  };

  // Toggle Task Status
  const handleUpdateTaskStatus = (taskId, nextStatus) => {
    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        const updatedTasks = p.tasks.map(t => {
          if (t.id === taskId) {
            return { ...t, status: nextStatus };
          }
          return t;
        });

        const changedTask = p.tasks.find(t => t.id === taskId);
        const log = {
          action: "Task Updated",
          detail: `You moved '${changedTask.name}' to ${nextStatus}`,
          time: "Just now"
        };

        return { ...p, tasks: updatedTasks, updates: [log, ...p.updates] };
      }
      return p;
    });

    setProjects(updatedProjects);
  };

  // Add Employee Work Note / Blocker
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteContentInput.trim()) return;

    const newNote = {
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      content: noteContentInput,
      type: noteType
    };

    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          notes: [newNote, ...p.notes],
          updates: [{ action: "Note Added", detail: `Added a self-note: ${newNote.content.substring(0, 30)}...`, time: "Just now" }, ...p.updates]
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setNoteContentInput("");
  };

  // Add Comment on Project Discussion Board
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      sender: "Rahul Kumar (Frontend Dev - You)",
      text: commentInput,
      time: "Just now"
    };

    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          discussion: [...p.discussion, newComment],
          updates: [{ action: "New Comment", detail: `You posted a comment: ${newComment.text.substring(0, 30)}...`, time: "Just now" }, ...p.updates]
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setCommentInput("");
  };

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
          <div className="w-9 h-9 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-sm shadow-inner">
            RK
          </div>
          <div className="text-left pr-2">
            <p className="text-sm font-bold text-[#2d3748] leading-none">Rahul Kumar</p>
            <p className="text-[11px] text-[#718096] mt-0.5">Frontend Developer (IT)</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: PROJECT OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Assigned", value: totalAssignedCount, text: "Projects", color: "text-[#1E293B]" },
          { label: "Active", value: activeCount, text: "Running", color: "text-[#2d3748]" },
          { label: "Completed", value: completedCount, text: "Finished", color: "text-[#2d3748]" },
          { label: "On Hold/Pending", value: pendingCount, text: "Paused", color: "text-[#2d3748]" },
          { label: "Overdue", value: overdueCount, text: "Over Deadline", color: "text-rose-600" },
          { label: "My Open Tasks", value: upcomingDeadlinesCount, text: "Remaining", color: "text-[#1E293B]", bg: "bg-blue-50/50" }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${stat.bg || ''}`}>
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">{stat.label}</span>
            <div className="flex items-baseline gap-2 mt-3">
              <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
              <span className={`text-[11px] font-semibold ${stat.label === 'Overdue' ? 'text-rose-600' : 'text-[#718096]'}`}>{stat.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* LEFT COLUMN: PROJECT DIRECTORY & INTERACTIVE PANEL */}
        <div className="xl:col-span-2 space-y-8">

          {/* PROJECT FILTERING & LIST */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-[#2d3748] flex items-center gap-2">
                <FolderKanban size={20} className="text-[#1E293B]" />
                Select Project Workspace
              </h2>
              
              {/* Responsive Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aec0]" />
                  <input
                    type="text"
                    placeholder="Search project..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 w-40 md:w-52 bg-[#f7fafc] text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#a0aec0]"
                  />
                </div>
                
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-[#f7fafc] border-[#e2e8f0] text-sm rounded-lg py-2 px-3 text-[#2d3748] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] cursor-pointer transition-all"
                >
                  <option value="All">Priority: All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#f7fafc] border-[#e2e8f0] text-sm rounded-lg py-2 px-3 text-[#2d3748] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] cursor-pointer transition-all"
                >
                  <option value="All">Status: All</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* PROJECT CARDS HORIZONTAL/GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredProjects.length === 0 ? (
                <div className="col-span-3 text-center py-10 text-[#718096] text-sm font-medium bg-[#f7fafc] rounded-xl border border-dashed border-[#e2e8f0]">
                  No projects match your current filters.
                </div>
              ) : (
                filteredProjects.map((p) => {
                  const progress = calculateProgress(p);
                  const isSelected = p.id === activeProject.id;
                  
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveProjectId(p.id)}
                      className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
                        isSelected 
                          ? "border-[#3B82F6] bg-blue-50/40 shadow-md ring-2 ring-[#3B82F6]/10" 
                          : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">{p.code}</span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          p.priority === "High" ? "bg-rose-100 text-rose-700" :
                          p.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-[#718096]"
                        }`}>
                          {p.priority}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-[#2d3748] line-clamp-1 mb-1.5">{p.name}</h3>
                      <p className="text-xs text-[#718096] line-clamp-2 h-8 mb-4 leading-relaxed">{p.description}</p>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-[#718096]">
                          <span>Progress</span>
                          <span className={isSelected ? "text-[#1E293B]" : ""}>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ease-out ${isSelected ? "bg-[#3B82F6]" : "bg-[#94a3b8]"}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e2e8f0] text-xs text-[#718096]">
                        <span className="font-bold text-[#2d3748]">{p.status}</span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock size={13} className={isSelected ? "text-[#1E293B]" : ""} /> {p.daysRemaining} days
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ACTIVE WORKSPACE WORKBENCH */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-md overflow-hidden">
            
            {/* Workbench Header */}
            <div className="bg-blue-50/30 border-b border-[#e2e8f0] p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#3B82F6] text-white text-[11px] px-2.5 py-1 rounded-md font-black shadow-sm">{activeProject.id}</span>
                    <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">{activeProject.category}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#2d3748] leading-tight">{activeProject.name}</h2>
                  <p className="text-sm text-[#718096] mt-1.5 max-w-2xl">{activeProject.description}</p>
                </div>

                <div className="text-left md:text-right bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm">
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Project Manager</p>
                  <p className="text-base font-bold text-[#2d3748]">{activeProject.projectManager.name}</p>
                  <p className="text-xs text-[#718096] mt-0.5">{activeProject.projectManager.role}</p>
                </div>
              </div>

              {/* Quick Workbench Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#e2e8f0]/60">
                <div>
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Timeline</p>
                  <p className="text-sm font-bold text-[#2d3748]">{activeProject.startDate} - {activeProject.endDate}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Est. Hours</p>
                  <p className="text-sm font-bold text-[#2d3748]">{activeProject.timeTracking.estimatedHours} hrs</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Logged Hours</p>
                  <p className="text-sm font-bold text-[#1E293B]">{activeProject.timeTracking.loggedTotal} hrs</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider mb-1">Time Left</p>
                  <p className="text-sm font-bold text-rose-600">{activeProject.daysRemaining} days remaining</p>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-[#e2e8f0] bg-white overflow-x-auto">
              {[
                { id: "tasks", label: "My Tasks", icon: CheckSquare, count: activeProject.tasks.length },
                { id: "milestones", label: "Milestones", icon: Award, count: activeProject.milestones.length },
                { id: "time-tracking", label: "Time & Notes", icon: Clock },
                { id: "discussion", label: "Discussions", icon: MessageSquare, count: activeProject.discussion.length }
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
                <div className="space-y-6">
                  
                  {/* Task Actions */}
                  <form onSubmit={handleAddTask} className="bg-[#f7fafc] p-5 rounded-xl border border-[#e2e8f0] space-y-4">
                    <p className="text-sm font-bold text-[#2d3748]">Add a personal/assigned sub-task scope</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input
                        type="text"
                        placeholder="Task Name (e.g. Code Review Page Layout)..."
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        className="md:col-span-3 px-4 py-2.5 text-sm bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                      />
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                        className="px-3 py-2.5 text-sm bg-white border border-[#e2e8f0] rounded-lg text-[#2d3748] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all cursor-pointer"
                      >
                        <option value="High">Priority: High</option>
                        <option value="Medium">Priority: Medium</option>
                        <option value="Low">Priority: Low</option>
                      </select>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        placeholder="Description of work details..."
                        value={taskDescriptionInput}
                        onChange={(e) => setTaskDescriptionInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                      />
                      <button type="submit" className="px-6 py-2.5 bg-[#3B82F6] text-white rounded-lg text-sm font-bold hover:bg-[#1e3a8a] flex items-center justify-center gap-2 shrink-0 transition-colors shadow-sm">
                        <Plus size={16} /> Add Task
                      </button>
                    </div>
                  </form>

                  {/* Task List */}
                  <div className="space-y-3">
                    {activeProject.tasks.map((task) => (
                      <div key={task.id} className="p-4 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#cbd5e1] hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="mt-1 shrink-0">
                            {task.status === "Completed" ? (
                              <CheckCircle className="text-emerald-500 fill-emerald-50" size={20} />
                            ) : (
                              <div className="w-5 h-5 rounded-md border-2 border-[#cbd5e1] bg-[#f7fafc]"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                              <span className={`text-sm font-bold ${task.status === "Completed" ? "line-through text-[#a0aec0]" : "text-[#2d3748]"}`}>
                                {task.name}
                              </span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                task.priority === "High" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                task.priority === "Medium" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                "bg-slate-50 text-slate-600 border border-slate-200"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs text-[#718096] mb-2 leading-relaxed">{task.description}</p>
                            <span className="text-[11px] font-medium text-[#a0aec0] flex items-center gap-1">
                              <Calendar size={12} /> Due: {task.dueDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className="bg-[#f7fafc] text-xs font-bold text-[#2d3748] py-2 px-3 rounded-lg border border-[#e2e8f0] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none cursor-pointer transition-all"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">In Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    {activeProject.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex gap-5 relative">
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
                              <h4 className="text-sm font-bold text-[#2d3748]">{milestone.name}</h4>
                              <p className="text-xs font-medium text-[#718096] mt-1">Due Date: {milestone.dueDate}</p>
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
                              <span className={milestone.status === "In Progress" ? "text-[#1E293B]" : ""}>{milestone.pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ease-out ${
                                milestone.status === "Completed" ? "bg-emerald-500" : "bg-[#3B82F6]"
                              }`} style={{ width: `${milestone.pct}%` }}></div>
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
                      <p className="text-[11px] text-[#718096] font-bold uppercase tracking-wider">Hours Worked Today</p>
                      <h4 className="text-3xl font-black text-[#1E293B] mt-2">{activeProject.timeTracking.workedToday}h</h4>
                      <p className="text-xs text-[#718096] mt-2 font-medium">Logged on active branch</p>
                    </div>
                    <div className="bg-[#f7fafc] p-5 rounded-xl border border-[#e2e8f0]">
                      <p className="text-[11px] text-[#718096] font-bold uppercase tracking-wider">Logged This Week</p>
                      <h4 className="text-3xl font-black text-[#2d3748] mt-2">{activeProject.timeTracking.workedThisWeek}h</h4>
                      <p className="text-xs text-[#718096] mt-2 font-medium">Goal: 40 hrs total standard</p>
                    </div>
                    <div className="bg-[#f7fafc] p-5 rounded-xl border border-[#e2e8f0]">
                      <p className="text-[11px] text-[#718096] font-bold uppercase tracking-wider">Remaining (Estimate)</p>
                      <h4 className="text-3xl font-black text-[#718096] mt-2">{activeProject.timeTracking.remainingHours}h</h4>
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
                    {activeProject.notes.length === 0 ? (
                      <p className="text-sm text-[#718096] italic p-4 bg-[#f7fafc] rounded-lg text-center border border-dashed border-[#e2e8f0]">No daily notes logged for this project yet.</p>
                    ) : (
                      activeProject.notes.map((note, idx) => (
                        <div key={idx} className="p-4 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#cbd5e1] transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-[#718096] flex items-center gap-1.5"><Calendar size={12}/> {note.date}</span>
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                              note.type === "Blocker" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                              note.type === "Issue" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                              "bg-blue-50 text-[#1E293B] border border-blue-100"
                            }`}>
                              {note.type}
                            </span>
                          </div>
                          <p className="text-sm text-[#2d3748] leading-relaxed">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: DISCUSSION BOARD */}
              {activeTab === "discussion" && (
                <div className="space-y-6 flex flex-col h-[400px]">
                  <div className="space-y-4 flex-1 overflow-y-auto pr-3">
                    {activeProject.discussion.map((msg, idx) => (
                      <div key={idx} className="p-4 bg-[#f7fafc] border border-[#e2e8f0] rounded-2xl rounded-tl-sm space-y-1.5 hover:border-[#cbd5e1] transition-colors w-[90%]">
                        <div className="flex justify-between items-center text-[11px] font-bold text-[#718096]">
                          <span className="text-[#1E293B]">{msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="text-sm text-[#2d3748] leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

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
                    <p className="text-sm font-bold text-[#2d3748]">{activeProject.projectManager.name}</p>
                    <p className="text-[11px] font-medium text-[#718096]">Project Manager ({activeProject.projectManager.dept})</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-2 hover:bg-[#f7fafc] rounded-lg transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E293B] font-bold text-sm shrink-0">
                    TL
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2d3748]">{activeProject.teamLead.name}</p>
                    <p className="text-[11px] font-medium text-[#718096]">Team Lead / Tech Lead</p>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="border-t border-[#e2e8f0] pt-4">
                <p className="text-[11px] font-bold text-[#a0aec0] uppercase tracking-wider mb-3 px-2">Team Members ({activeProject.teamMembers.length})</p>
                <div className="space-y-1">
                  {activeProject.teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 p-2 hover:bg-[#f7fafc] rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#f7fafc] border border-[#e2e8f0] flex items-center justify-center text-[#718096] font-bold text-xs shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#2d3748] truncate">{member.name}</p>
                        <p className="text-[11px] font-medium text-[#718096]">{member.role} ({member.dept})</p>
                      </div>
                    </div>
                  ))}
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
                  {activeProject.tasks.filter(t => t.status === "Completed").length}
                </p>
              </div>
              <div className="bg-[#f7fafc] p-4 rounded-xl border border-[#e2e8f0]">
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Tasks Pending</p>
                <p className="text-2xl font-black text-[#2d3748] mt-1.5">
                  {activeProject.tasks.filter(t => t.status !== "Completed").length}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 rounded hover:bg-[#f7fafc]">
                <span className="text-[#718096] font-medium">Task Completion Rate</span>
                <span className="font-bold text-[#1E293B]">
                  {activeProject.tasks.length > 0 
                    ? Math.round((activeProject.tasks.filter(t => t.status === "Completed").length / activeProject.tasks.length) * 100) 
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
            <h3 className="text-base font-bold text-[#2d3748] flex items-center gap-2.5 mb-5 border-b border-[#e2e8f0] pb-3">
              <Paperclip size={18} className="text-[#1E293B]" />
              Project Files & Docs
            </h3>

            <div className="space-y-2.5">
              {activeProject.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#f7fafc] rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-white transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-blue-50 p-2 rounded-lg text-[#1E293B] shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#2d3748] truncate">{doc.name}</p>
                      <span className="text-[11px] font-medium text-[#718096]">{doc.size} • {doc.type}</span>
                    </div>
                  </div>
                  <button className="text-[11px] font-bold text-[#1E293B] opacity-0 group-hover:opacity-100 transition-opacity hover:underline shrink-0 px-2">
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* UPCOMING DEADLINES WIDGET */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
            <h3 className="text-base font-bold text-[#2d3748] flex items-center gap-2.5 mb-5 border-b border-[#e2e8f0] pb-3">
              <AlertTriangle size={18} className="text-rose-600" />
              Immediate Deadlines
            </h3>

            <div className="space-y-3.5">
              {activeProject.tasks.filter(t => t.status !== "Completed").slice(0, 3).map((task) => (
                <div key={task.id} className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2 hover:border-rose-200 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-bold text-rose-800 line-clamp-2">{task.name}</span>
                    <span className="shrink-0 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">{task.dueDate}</span>
                  </div>
                  <p className="text-[11px] font-medium text-rose-600/80 leading-none">Project: {activeProject.name}</p>
                </div>
              ))}
              {activeProject.tasks.filter(t => t.status !== "Completed").length === 0 && (
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
              {activeProject.updates.map((update, idx) => (
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

      </div>
    </div>
  );
}