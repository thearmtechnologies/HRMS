import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  Download,
  Edit,
  FileText,
  Filter,
  FolderKanban,
  Grid,
  Laptop,
  List,
  MoreVertical,
  Paperclip,
  Play,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Target,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";

// --- MOCK DATA ---
const PROJECTS = [
  {
    id: "PRJ001",
    name: "HRMS Development",
    department: "IT",
    manager: "John Smith",
    priority: "High",
    status: "Active",
    progress: 75,
    budget: { allocated: 1200000, used: 750000 },
    timeline: { created: "15 May 2026", start: "01 Jun 2026", deadline: "31 Aug 2026", expected: "28 Aug 2026" },
    basic: { desc: "Core HRMS internal portal development", client: "Internal", type: "Software Development" },
    tasks: { completed: 120, pending: 25, blocked: 5 },
    assignments: { leads: ["David Wilson", "Michael Chang"], members: 15 },
    resources: { laptops: 20, licenses: 15, cloud: "AWS Production Server" },
    milestones: [
      { name: "Project Initiated", status: "Completed" },
      { name: "Requirements Completed", status: "Completed" },
      { name: "UI Design Approved", status: "Completed" },
      { name: "Development Completed", status: "In Progress" },
      { name: "Testing Completed", status: "Pending" },
    ],
    risks: [
      { name: "Developer Shortage", severity: "High", owner: "John Smith", status: "Open" },
      { name: "Budget Overrun", severity: "Medium", owner: "Finance Dept", status: "Mitigated" },
    ],
    documents: [
      { name: "Requirements_v2.pdf", size: "2.4 MB" },
      { name: "Architecture_Diagram.png", size: "1.1 MB" },
    ]
  },
  {
    id: "PRJ002",
    name: "CRM Portal Migration",
    department: "Operations",
    manager: "Sarah Johnson",
    priority: "Critical",
    status: "Overdue",
    progress: 90,
    budget: { allocated: 800000, used: 850000 },
    timeline: { created: "10 Jan 2026", start: "01 Feb 2026", deadline: "30 May 2026", expected: "15 Jun 2026" },
    basic: { desc: "Migrating legacy CRM to new cloud infrastructure", client: "Sales Dept", type: "Infrastructure" },
    tasks: { completed: 300, pending: 12, blocked: 8 },
    assignments: { leads: ["Emily Chen"], members: 8 },
    resources: { laptops: 8, licenses: 10, cloud: "Azure Migration Hub" },
    milestones: [
      { name: "Data Mapping", status: "Completed" },
      { name: "Database Migration", status: "Completed" },
      { name: "UAT Testing", status: "In Progress" },
    ],
    risks: [
      { name: "Data Loss during transfer", severity: "Critical", owner: "Sarah Johnson", status: "Open" },
      { name: "Missed Deadline", severity: "Critical", owner: "Sarah Johnson", status: "Realized" },
    ],
    documents: [
      { name: "Migration_Strategy.docx", size: "4.5 MB" },
    ]
  },
  {
    id: "PRJ003",
    name: "Employee Wellness App",
    department: "HR",
    manager: "David Wilson",
    priority: "Medium",
    status: "Planning",
    progress: 10,
    budget: { allocated: 300000, used: 25000 },
    timeline: { created: "01 Jun 2026", start: "15 Jul 2026", deadline: "15 Dec 2026", expected: "10 Dec 2026" },
    basic: { desc: "Mobile app for employee mental and physical wellness tracking", client: "Internal", type: "Mobile App" },
    tasks: { completed: 5, pending: 45, blocked: 0 },
    assignments: { leads: [], members: 4 },
    resources: { laptops: 4, licenses: 4, cloud: "Pending" },
    milestones: [
      { name: "Vendor Selection", status: "Completed" },
      { name: "Wireframing", status: "In Progress" },
    ],
    risks: [
      { name: "Low Employee Adoption", severity: "Medium", owner: "HR Head", status: "Open" },
    ],
    documents: [
      { name: "Vendor_Contract.pdf", size: "1.8 MB" },
    ]
  },
];

const ANALYTICS = {
  byStatus: [
    { label: "Active", value: 18, color: "bg-[#3d766d]" },
    { label: "Completed", value: 10, color: "bg-[#3d766d]/60" },
    { label: "On Hold", value: 2, color: "bg-yellow-500" },
    { label: "Overdue", value: 2, color: "bg-red-500" },
  ],
  byDept: [
    { label: "IT", value: 12, color: "bg-[#3d766d]" },
    { label: "Operations", value: 8, color: "bg-[#3d766d]/80" },
    { label: "Marketing", value: 5, color: "bg-[#3d766d]/60" },
    { label: "HR", value: 4, color: "bg-[#3d766d]/40" },
    { label: "Finance", value: 3, color: "bg-[#3d766d]/20" },
  ],
};

const ACTIVITIES = [
  { time: "10:30 AM", desc: "Priority changed from Medium to High for CRM Portal", type: "priority" },
  { time: "11:15 AM", desc: "New employee assigned to HRMS Development", type: "assignment" },
  { time: "02:00 PM", desc: "Budget increased by ₹2,00,000 for Office Expansion", type: "budget" },
  { time: "Yesterday", desc: "Project Completed: Annual Audit 2025", type: "status" },
];

// --- REUSABLE COMPONENTS ---
const Card = ({ children, className = "", noPadding = false }) => (
  <div className={`bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden ${className}`}>
    <div className={noPadding ? "" : "p-5"}>{children}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    "Active": "bg-[#3d766d]/10 text-[#3d766d]",
    "Completed": "bg-blue-100 text-blue-700",
    "On Hold": "bg-yellow-100 text-yellow-700",
    "Overdue": "bg-red-100 text-red-700",
    "Planning": "bg-[#f0f3f5] text-[#8f9192]",
    "Pending": "bg-gray-100 text-gray-600",
    "In Progress": "bg-[#3d766d]/10 text-[#3d766d]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || styles["Planning"]}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    "Critical": "bg-red-100 text-red-700 border-red-200",
    "High": "bg-orange-100 text-orange-700 border-orange-200",
    "Medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Low": "bg-[#f0f3f5] text-[#8f9192] border-[#d6d9df]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-bold ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const ProgressBar = ({ progress, colorClass = "bg-[#3d766d]" }) => (
  <div className="w-full h-2 bg-[#f0f3f5] rounded-full overflow-hidden">
    <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
  </div>
);

// --- MAIN COMPONENT ---
export default function ProjectManagement() {
  const [viewMode, setViewMode] = useState("list");
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount) => "₹" + amount.toLocaleString("en-IN");

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12 font-sans text-[#8f9192]">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3d766d]">Project Management</h1>
          <p className="text-sm mt-1">Create, monitor, and control projects across the organization</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#3d766d] rounded-lg text-sm font-semibold hover:bg-[#f0f3f5] transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3d766d] text-[#fdfdfe] rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all shadow-sm">
            <Plus size={16} /> Create Project
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: "Total Projects", value: "32", icon: FolderKanban, color: "text-[#3d766d]" },
          { title: "Active", value: "18", icon: Activity, color: "text-[#3d766d]" },
          { title: "Completed", value: "10", icon: CheckCircle2, color: "text-blue-600" },
          { title: "On Hold", value: "2", icon: Clock, color: "text-yellow-600" },
          { title: "Overdue", value: "2", icon: AlertCircle, color: "text-red-600" },
          { title: "High Priority", value: "6", icon: AlertTriangle, color: "text-orange-600" },
        ].map((stat, idx) => (
          <Card key={idx} className="p-4 flex flex-col justify-center items-center text-center hover:border-[#bdc2c7] transition-colors">
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-[#3d766d] leading-none mb-1">{stat.value}</p>
            <p className="text-xs font-medium text-[#8f9192]">{stat.title}</p>
          </Card>
        ))}
      </div>

      {/* 4. SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#fdfdfe] p-4 rounded-xl border border-[#d6d9df] shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#bdc2c7] group-focus-within:text-[#3d766d]" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm focus:outline-none focus:bg-[#fdfdfe] focus:border-[#3d766d] focus:ring-2 focus:ring-[#3d766d]/20 transition-all placeholder:text-[#bdc2c7]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 border border-[#d6d9df] text-[#8f9192] rounded-lg hover:bg-[#f0f3f5] hover:text-[#3d766d] transition-colors flex items-center gap-2">
            <Filter size={18} /> <span className="hidden sm:inline text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* View Toggles */}
        <div className="flex items-center p-1 bg-[#f0f3f5] rounded-lg border border-[#d6d9df]">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "list" ? "bg-[#fdfdfe] text-[#3d766d] shadow-sm" : "text-[#bdc2c7] hover:text-[#8f9192]"
            }`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "grid" ? "bg-[#fdfdfe] text-[#3d766d] shadow-sm" : "text-[#bdc2c7] hover:text-[#8f9192]"
            }`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* 3 & 5. PROJECT DIRECTORY / TABLE */}
      {viewMode === "list" ? (
        <Card noPadding className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#f0f3f5] border-b border-[#d6d9df] text-[#8f9192] text-xs uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Project Code</th>
                <th className="px-5 py-4 font-semibold">Project Name</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Priority</th>
                <th className="px-5 py-4 font-semibold text-center">Status</th>
                <th className="px-5 py-4 font-semibold w-32">Progress</th>
                <th className="px-5 py-4 font-semibold">Deadline</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6d9df] text-sm">
              {PROJECTS.map((proj) => (
                <tr key={proj.id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-[#8f9192]">{proj.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#3d766d]">{proj.name}</p>
                    <p className="text-xs text-[#bdc2c7]">Mgr: {proj.manager}</p>
                  </td>
                  <td className="px-5 py-4">{proj.department}</td>
                  <td className="px-5 py-4"><PriorityBadge priority={proj.priority} /></td>
                  <td className="px-5 py-4 text-center"><StatusBadge status={proj.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-8 text-right">{proj.progress}%</span>
                      <ProgressBar progress={proj.progress} colorClass={proj.progress === 100 ? "bg-blue-500" : "bg-[#3d766d]"} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#8f9192]">{proj.timeline.deadline}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedProject(proj)}
                      className="text-[#3d766d] font-semibold hover:underline text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((proj) => (
            <Card key={proj.id} className="flex flex-col group p-5">
              <div className="flex items-start justify-between mb-3">
                <PriorityBadge priority={proj.priority} />
                <StatusBadge status={proj.status} />
              </div>
              <h3 className="text-lg font-bold text-[#3d766d] leading-tight mb-1">{proj.name}</h3>
              <p className="text-xs text-[#bdc2c7] mb-4">{proj.id} • {proj.department}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Progress</span>
                  <span className="text-[#3d766d]">{proj.progress}%</span>
                </div>
                <ProgressBar progress={proj.progress} />
              </div>

              <div className="flex items-center justify-between text-xs text-[#8f9192] mb-4">
                <div className="flex items-center gap-1"><Calendar size={14} /> {proj.timeline.deadline}</div>
                <div className="flex items-center gap-1"><Users size={14} /> {proj.assignments.members} Mem</div>
              </div>

              <button
                onClick={() => setSelectedProject(proj)}
                className="w-full mt-auto px-4 py-2 bg-[#f0f3f5] border border-[#d6d9df] text-[#3d766d] rounded-lg text-sm font-semibold hover:bg-[#3d766d] hover:text-[#fdfdfe] transition-colors"
              >
                View Project Details
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* 9, 14 & 15. ANALYTICS, TIMELINE & DEADLINES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Charts */}
        <Card className="lg:col-span-2 p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#3d766d] flex items-center gap-2">
              <BarChart3 size={20} /> Project Analytics
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-auto">
            <div>
              <p className="text-sm font-semibold mb-4 border-b border-[#d6d9df] pb-2">Projects by Department</p>
              <div className="space-y-3">
                {ANALYTICS.byDept.map((item, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <span className="w-20 shrink-0 font-medium">{item.label}</span>
                    <div className="flex-1 h-3 bg-[#f0f3f5] rounded-full overflow-hidden mx-3">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / 15) * 100}%` }}></div>
                    </div>
                    <span className="w-8 text-right font-bold text-[#3d766d]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4 border-b border-[#d6d9df] pb-2">Projects by Status</p>
              <div className="space-y-3">
                {ANALYTICS.byStatus.map((item, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <span className="w-20 shrink-0 font-medium">{item.label}</span>
                    <div className="flex-1 h-3 bg-[#f0f3f5] rounded-full overflow-hidden mx-3">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / 20) * 100}%` }}></div>
                    </div>
                    <span className="w-8 text-right font-bold text-[#3d766d]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[#3d766d] flex items-center gap-2 mb-6">
            <Activity size={20} /> Recent Activity
          </h2>
          <div className="relative border-l-2 border-[#d6d9df] ml-3 space-y-6">
            {ACTIVITIES.map((item, idx) => (
              <div key={idx} className="relative pl-6">
                <div className="absolute w-3 h-3 bg-[#3d766d] rounded-full -left-1.75 top-1.5 shadow-[0_0_0_4px_#fdfdfe]"></div>
                <p className="text-xs font-bold text-[#bdc2c7] mb-0.5">{item.time}</p>
                <p className="text-sm font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 6. PROJECT DETAILS MODAL DRAWER */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#3d766d]/20 backdrop-blur-sm" onClick={() => setSelectedProject(null)}></div>
          
          <div className="bg-[#fdfdfe] w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="shrink-0 p-5 sm:p-6 border-b border-[#d6d9df] flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-[#fdfdfe]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-[#3d766d]">{selectedProject.name}</h2>
                  <StatusBadge status={selectedProject.status} />
                  <PriorityBadge priority={selectedProject.priority} />
                </div>
                <p className="text-sm">Project Code: <span className="font-semibold text-[#8f9192]">{selectedProject.id}</span> • Department: <span className="font-semibold text-[#8f9192]">{selectedProject.department}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#3d766d] text-[#fdfdfe] rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors">
                  <Edit size={16} /> Edit Project
                </button>
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[#d6d9df] rounded-lg text-sm font-semibold hover:bg-[#f0f3f5] transition-colors">
                  <Settings size={16} /> Actions
                </button>
                <button onClick={() => setSelectedProject(null)} className="p-2 text-[#bdc2c7] hover:text-[#3d766d] hover:bg-[#f0f3f5] rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#f0f3f5]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left/Main Column (col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Basic Info & Progress Tracking */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-5">
                      <h3 className="text-sm font-bold text-[#3d766d] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2">Basic Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Description</span> <span className="font-semibold text-[#8f9192] text-right max-w-[60%]">{selectedProject.basic.desc}</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Project Type</span> <span className="font-semibold text-[#8f9192]">{selectedProject.basic.type}</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Client</span> <span className="font-semibold text-[#8f9192]">{selectedProject.basic.client}</span></div>
                      </div>
                    </Card>
                    
                    <Card className="p-5">
                      <h3 className="text-sm font-bold text-[#3d766d] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2">Progress Tracking</h3>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-[#8f9192]">Overall Completion</span>
                          <span className="text-[#3d766d]">{selectedProject.progress}%</span>
                        </div>
                        <ProgressBar progress={selectedProject.progress} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-green-50 p-2 rounded border border-green-100">
                          <p className="font-bold text-green-700 text-lg">{selectedProject.tasks.completed}</p>
                          <p className="text-green-600">Completed</p>
                        </div>
                        <div className="bg-[#f0f3f5] p-2 rounded border border-[#d6d9df]">
                          <p className="font-bold text-[#8f9192] text-lg">{selectedProject.tasks.pending}</p>
                          <p className="text-[#bdc2c7]">Pending</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded border border-red-100">
                          <p className="font-bold text-red-700 text-lg">{selectedProject.tasks.blocked}</p>
                          <p className="text-red-600">Blocked</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Assignments & Resources */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-[#d6d9df] pb-2">
                        <h3 className="text-sm font-bold text-[#3d766d] uppercase tracking-wider flex items-center gap-2"><Users size={16}/> Assignments</h3>
                        <button className="text-xs font-bold text-[#3d766d] hover:underline">Manage</button>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Project Manager</span> <span className="font-bold text-[#3d766d] bg-[#3d766d]/10 px-2 py-0.5 rounded">{selectedProject.manager}</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Team Leads</span> <span className="font-semibold text-[#8f9192]">{selectedProject.assignments.leads.join(", ") || "None"}</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Team Members</span> <span className="font-semibold text-[#8f9192]">{selectedProject.assignments.members} Employees</span></div>
                      </div>
                    </Card>

                    <Card className="p-5">
                      <h3 className="text-sm font-bold text-[#3d766d] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2"><Laptop size={16}/> Resources</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Laptops Assigned</span> <span className="font-semibold text-[#8f9192]">{selectedProject.resources.laptops}</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Software Licenses</span> <span className="font-semibold text-[#8f9192]">{selectedProject.resources.licenses}</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Cloud Infrastructure</span> <span className="font-semibold text-[#8f9192] flex items-center gap-1"><Cloud size={14}/> {selectedProject.resources.cloud}</span></div>
                      </div>
                    </Card>
                  </div>

                  {/* Risk Management Table */}
                  <Card noPadding>
                    <div className="p-5 border-b border-[#d6d9df] flex justify-between items-center">
                      <h3 className="text-sm font-bold text-[#3d766d] uppercase tracking-wider flex items-center gap-2"><ShieldAlert size={16}/> Risk Management</h3>
                      <button className="text-xs font-bold bg-[#f0f3f5] px-2 py-1 rounded text-[#3d766d] hover:bg-[#d6d9df] transition-colors">+ Add Risk</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                        <thead>
                          <tr className="bg-[#f0f3f5] text-[#8f9192] text-xs uppercase">
                            <th className="px-5 py-3 font-semibold">Risk</th>
                            <th className="px-5 py-3 font-semibold text-center">Severity</th>
                            <th className="px-5 py-3 font-semibold">Owner</th>
                            <th className="px-5 py-3 font-semibold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d6d9df]">
                          {selectedProject.risks.map((risk, i) => (
                            <tr key={i} className="hover:bg-[#f0f3f5]/50">
                              <td className="px-5 py-3 font-bold text-[#3d766d]">{risk.name}</td>
                              <td className="px-5 py-3 text-center">
                                <span className={`text-xs font-bold ${risk.severity === 'Critical' ? 'text-red-600' : risk.severity === 'High' ? 'text-orange-600' : 'text-yellow-600'}`}>{risk.severity}</span>
                              </td>
                              <td className="px-5 py-3 text-[#8f9192]">{risk.owner}</td>
                              <td className="px-5 py-3 text-right">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${risk.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{risk.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                </div>

                {/* Right Column (col-span-1) */}
                <div className="space-y-6">
                  
                  {/* Budget Allocation */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#3d766d] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                      <Wallet size={16} /> Budget Management
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-[#bdc2c7] font-semibold uppercase mb-1">Allocated Budget</p>
                        <p className="text-xl font-bold text-[#3d766d]">{formatCurrency(selectedProject.budget.allocated)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f0f3f5] p-3 rounded-lg">
                          <p className="text-xs text-[#bdc2c7] font-semibold uppercase mb-1">Used</p>
                          <p className="text-sm font-bold text-orange-600">{formatCurrency(selectedProject.budget.used)}</p>
                        </div>
                        <div className="bg-[#f0f3f5] p-3 rounded-lg">
                          <p className="text-xs text-[#bdc2c7] font-semibold uppercase mb-1">Remaining</p>
                          <p className="text-sm font-bold text-[#3d766d]">{formatCurrency(selectedProject.budget.allocated - selectedProject.budget.used)}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-[#8f9192]">Budget Utilized</span>
                          <span className="text-orange-600">{Math.round((selectedProject.budget.used / selectedProject.budget.allocated) * 100)}%</span>
                        </div>
                        <ProgressBar progress={(selectedProject.budget.used / selectedProject.budget.allocated) * 100} colorClass="bg-orange-500" />
                      </div>
                    </div>
                  </Card>

                  {/* Timeline & Deadlines */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#3d766d] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                      <Clock size={16} /> Timeline & Deadlines
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f0f3f5] rounded-md text-[#8f9192]"><Play size={16}/></div>
                        <div>
                          <p className="text-xs text-[#bdc2c7] font-bold uppercase">Start Date</p>
                          <p className="text-sm font-bold text-[#3d766d]">{selectedProject.timeline.start}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 border border-red-100 rounded-md text-red-600"><AlertCircle size={16}/></div>
                        <div>
                          <p className="text-xs text-[#bdc2c7] font-bold uppercase">Hard Deadline</p>
                          <p className="text-sm font-bold text-red-600">{selectedProject.timeline.deadline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f0f3f5] rounded-md text-[#8f9192]"><Target size={16}/></div>
                        <div>
                          <p className="text-xs text-[#bdc2c7] font-bold uppercase">Expected Completion</p>
                          <p className="text-sm font-bold text-[#8f9192]">{selectedProject.timeline.expected}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Milestones */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#3d766d] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Milestones
                    </h3>
                    <div className="space-y-3">
                      {selectedProject.milestones.map((ms, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`mt-0.5 shrink-0 ${ms.status === 'Completed' ? 'text-green-500' : ms.status === 'In Progress' ? 'text-blue-500' : 'text-[#bdc2c7]'}`}>
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${ms.status === 'Completed' ? 'text-[#8f9192] line-through decoration-[#bdc2c7]' : 'text-[#3d766d]'}`}>{ms.name}</p>
                            <p className="text-xs text-[#bdc2c7]">{ms.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Documents */}
                  <Card className="p-5">
                    <div className="flex justify-between items-center mb-4 border-b border-[#d6d9df] pb-2">
                      <h3 className="text-sm font-bold text-[#3d766d] uppercase tracking-wider flex items-center gap-2"><Paperclip size={16} /> Documents</h3>
                      <button className="text-[#3d766d] hover:bg-[#f0f3f5] p-1 rounded transition-colors"><Plus size={16}/></button>
                    </div>
                    <div className="space-y-2">
                      {selectedProject.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-[#f0f3f5] rounded-lg border border-transparent hover:border-[#d6d9df] transition-colors group cursor-pointer">
                          <div className="flex items-center gap-2 truncate">
                            <FileText size={14} className="text-[#8f9192] shrink-0" />
                            <span className="text-sm font-medium text-[#3d766d] truncate">{doc.name}</span>
                          </div>
                          <span className="text-xs text-[#bdc2c7] whitespace-nowrap ml-2">{doc.size}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}