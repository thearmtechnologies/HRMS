import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  BarChart3,
  Calendar,
  CheckCircle2,
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
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Target,
  Trash2,
  Users,
  Wallet,
  X,
  Play
} from "lucide-react";
import ProjectFormModal from "../../components/project/ProjectFormModal";

// --- REUSABLE COMPONENTS ---
const Card = ({ children, className = "", noPadding = false }) => (
  <div className={`bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden ${className}`}>
    <div className={noPadding ? "" : "p-5"}>{children}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    "Active": "bg-blue-100 text-blue-700",
    "In Progress": "bg-[#3B82F6]/10 text-[#1E293B]",
    "Completed": "bg-green-100 text-green-700",
    "On Hold": "bg-yellow-100 text-yellow-700",
    "Cancelled": "bg-red-100 text-red-700",
    "Archived": "bg-gray-100 text-gray-700",
    "Planning": "bg-[#f0f3f5] text-[#8f9192]",
    "Overdue": "bg-red-100 text-red-700",
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

const ProgressBar = ({ progress, colorClass = "bg-[#3B82F6]" }) => (
  <div className="w-full h-2 bg-[#f0f3f5] rounded-full overflow-hidden">
    <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
  </div>
);

// --- MAIN COMPONENT ---
export default function ProjectManagement() {
  const [viewMode, setViewMode] = useState("list");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  // Progress/Status updating in Details Modal
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setProjectToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project) => {
    setProjectToEdit(project);
    setIsFormOpen(true);
    if (selectedProject) setSelectedProject(null); // Close details if open
  };

  const handleOpenDetails = (project) => {
    setSelectedProject(project);
    setEditProgress(project.progressPercentage);
    setEditStatus(project.status);
  };

  const handleUpdateProgressStatus = async () => {
    if (!selectedProject) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/projects/${selectedProject._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          progressPercentage: Number(editProgress),
          status: editStatus
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProject(data.project);
        fetchProjects(); // Refresh background list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete project '${name}'?`)) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive project '${name}'?`)) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/projects/${id}/archive`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // --- STATS CALCULATION ---
  const today = new Date();
  const stats = {
    total: projects.length,
    active: projects.filter(p => ["Planning", "In Progress"].includes(p.status)).length,
    completed: projects.filter(p => p.status === "Completed").length,
    onHold: projects.filter(p => p.status === "On Hold").length,
    delayed: projects.filter(p => new Date(p.endDate) < today && p.status !== "Completed" && p.status !== "Cancelled" && p.status !== "Archived").length,
  };

  // Filter projects by search
  const filteredProjects = projects.filter(p => {
    const s = searchQuery.toLowerCase();
    return (
      p.projectName?.toLowerCase().includes(s) ||
      p.projectCode?.toLowerCase().includes(s) ||
      p.department?.departmentName?.toLowerCase().includes(s)
    );
  });

  const getRemainingDays = (endDate, status) => {
    if (status === "Completed" || status === "Cancelled" || status === "Archived") return "N/A";
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? `${Math.abs(diffDays)} Days Overdue` : `${diffDays} Days Left`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12 font-sans text-[#8f9192]">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Project Management</h1>
          <p className="text-sm mt-1">Create, assign, monitor, and control projects</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-[#fdfdfe] rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all shadow-sm">
            <Plus size={16} /> Create Project
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 flex flex-col justify-center items-center text-center">
          <FolderKanban size={20} className="text-[#1E293B] mb-2" />
          <p className="text-2xl font-bold text-[#1E293B] leading-none mb-1">{stats.total}</p>
          <p className="text-xs font-medium text-[#8f9192]">Total Projects</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center items-center text-center">
          <Activity size={20} className="text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-[#1E293B] leading-none mb-1">{stats.active}</p>
          <p className="text-xs font-medium text-[#8f9192]">Active</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center items-center text-center">
          <CheckCircle2 size={20} className="text-green-600 mb-2" />
          <p className="text-2xl font-bold text-[#1E293B] leading-none mb-1">{stats.completed}</p>
          <p className="text-xs font-medium text-[#8f9192]">Completed</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center items-center text-center">
          <Clock size={20} className="text-yellow-600 mb-2" />
          <p className="text-2xl font-bold text-[#1E293B] leading-none mb-1">{stats.onHold}</p>
          <p className="text-xs font-medium text-[#8f9192]">On Hold</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center items-center text-center border-red-200 bg-red-50/50">
          <AlertCircle size={20} className="text-red-600 mb-2" />
          <p className="text-2xl font-bold text-red-700 leading-none mb-1">{stats.delayed}</p>
          <p className="text-xs font-medium text-red-600">Delayed Projects</p>
        </Card>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#fdfdfe] p-4 rounded-xl border border-[#d6d9df] shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#bdc2c7] group-focus-within:text-[#1E293B]" />
            </div>
            <input
              type="text"
              placeholder="Search by Name, Code, or Dept..."
              className="w-full pl-10 pr-4 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm focus:outline-none focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all placeholder:text-[#bdc2c7]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* PROJECT TABLE */}
      {loading ? (
        <div className="py-20 text-center"><div className="animate-spin inline-block w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full"></div></div>
      ) : filteredProjects.length === 0 ? (
        <Card className="py-20 flex flex-col items-center justify-center text-center">
          <FolderKanban size={48} className="text-[#bdc2c7] mb-4" />
          <h3 className="text-lg font-bold text-[#1E293B]">No Projects Found</h3>
          <p className="text-sm text-[#8f9192] mt-1">Create a new project to get started or adjust your search filters.</p>
        </Card>
      ) : (
        <Card noPadding className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#f0f3f5] border-b border-[#d6d9df] text-[#8f9192] text-xs uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Project Code</th>
                <th className="px-5 py-4 font-semibold">Project Name</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Manager</th>
                <th className="px-5 py-4 font-semibold text-center">Team Size</th>
                <th className="px-5 py-4 font-semibold">Priority</th>
                <th className="px-5 py-4 font-semibold text-center">Status</th>
                <th className="px-5 py-4 font-semibold w-32">Progress</th>
                <th className="px-5 py-4 font-semibold">Start Date</th>
                <th className="px-5 py-4 font-semibold">End Date</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6d9df] text-sm">
              {filteredProjects.map((proj) => (
                <tr key={proj._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[#1E293B]">{proj.projectCode}</td>
                  <td className="px-5 py-4 font-semibold text-[#1E293B]">{proj.projectName}</td>
                  <td className="px-5 py-4">{proj.department?.departmentName || "N/A"}</td>
                  <td className="px-5 py-4 text-[#1E293B]">{proj.projectManager ? (proj.projectManager.employeeName || proj.projectManager.fullName) : "Unassigned"}</td>
                  <td className="px-5 py-4 text-center font-bold bg-[#f0f3f5]/50">{proj.assignedEmployees?.length || 0}</td>
                  <td className="px-5 py-4"><PriorityBadge priority={proj.priority} /></td>
                  <td className="px-5 py-4 text-center"><StatusBadge status={proj.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-8 text-right">{proj.progressPercentage}%</span>
                      <ProgressBar progress={proj.progressPercentage} colorClass={proj.progressPercentage === 100 ? "bg-green-500" : "bg-[#3B82F6]"} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs">{new Date(proj.startDate).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-xs">{new Date(proj.endDate).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenDetails(proj)} className="text-[#3B82F6] hover:underline text-xs font-bold">View</button>
                    <button onClick={() => handleOpenEdit(proj)} className="text-orange-500 hover:underline text-xs font-bold">Edit</button>
                    {proj.status !== "Archived" && <button onClick={() => handleArchive(proj._id, proj.projectName)} className="text-gray-500 hover:underline text-xs font-bold">Archive</button>}
                    <button onClick={() => handleDelete(proj._id, proj.projectName)} className="text-red-500 hover:underline text-xs font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* PROJECT DETAILS MODAL DRAWER */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#3B82F6]/20 backdrop-blur-sm" onClick={() => setSelectedProject(null)}></div>
          
          <div className="bg-[#fdfdfe] w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="shrink-0 p-5 sm:p-6 border-b border-[#d6d9df] flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-[#fdfdfe]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-[#1E293B]">{selectedProject.projectName}</h2>
                  <StatusBadge status={selectedProject.status} />
                  <PriorityBadge priority={selectedProject.priority} />
                </div>
                <p className="text-sm">Project Code: <span className="font-semibold text-[#8f9192]">{selectedProject.projectCode}</span> • Department: <span className="font-semibold text-[#8f9192]">{selectedProject.department?.departmentName || "N/A"}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(selectedProject)} className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f0f3f5] text-[#1E293B] rounded-lg text-sm font-semibold hover:bg-[#e2e4e8] transition-colors">
                  <Edit size={16} /> Edit
                </button>
                <button onClick={() => setSelectedProject(null)} className="p-2 text-[#bdc2c7] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#f0f3f5]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left/Main Column (col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Basic Info */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2">Description</h3>
                    <p className="text-sm text-[#1E293B] leading-relaxed">{selectedProject.description || "No description provided."}</p>
                  </Card>

                  {/* Team Members */}
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-[#d6d9df] pb-2">
                      <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2"><Users size={16}/> Team Directory</h3>
                    </div>
                    
                    <div className="mb-6 p-4 bg-[#3B82F6]/5 rounded-xl border border-[#3B82F6]/20">
                      <p className="text-xs font-bold uppercase text-[#3B82F6] mb-1">Project Manager</p>
                      {selectedProject.projectManager ? (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#1E293B]">{selectedProject.projectManager.employeeName || selectedProject.projectManager.fullName}</p>
                          <span className="text-xs text-[#8f9192]">({selectedProject.projectManager.employeeId})</span>
                        </div>
                      ) : (
                        <p className="text-sm text-[#8f9192]">Unassigned</p>
                      )}
                    </div>

                    <p className="text-xs font-bold uppercase text-[#8f9192] mb-3">Assigned Members ({selectedProject.assignedEmployees?.length || 0})</p>
                    {selectedProject.assignedEmployees?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedProject.assignedEmployees.map(emp => (
                          <div key={emp._id} className="p-3 border border-[#d6d9df] rounded-lg bg-[#fdfdfe]">
                            <p className="text-sm font-bold text-[#1E293B] truncate">{emp.employeeName || emp.fullName}</p>
                            <p className="text-xs text-[#8f9192] truncate">{emp.employeeId} • {emp.designation}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border-2 border-dashed border-[#d6d9df] rounded-xl bg-[#fdfdfe]">
                        <Users className="mx-auto text-[#bdc2c7] mb-2" size={24}/>
                        <p className="text-sm font-medium text-[#8f9192]">No Team Members Assigned</p>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Right Column (col-span-1) */}
                <div className="space-y-6">
                  
                  {/* Status & Progress Updater */}
                  <Card className="p-5 border-l-4 border-l-[#3B82F6]">
                    <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                      <Target size={16} /> Update Progress
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-[#8f9192]">Current Progress</span>
                          <span className="text-[#3B82F6] text-lg">{editProgress}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={editProgress} 
                          onChange={(e) => setEditProgress(e.target.value)}
                          className="w-full accent-[#3B82F6]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#8f9192] mb-2">Update Status</label>
                        <select 
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                        >
                          <option value="Planning">Planning</option>
                          <option value="In Progress">In Progress</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <button 
                        onClick={handleUpdateProgressStatus}
                        disabled={isUpdating}
                        className="w-full py-2 bg-[#1E293B] text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
                      >
                        {isUpdating ? "Saving..." : "Save Updates"}
                      </button>
                    </div>
                  </Card>

                  {/* Timeline & Deadlines */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                      <Clock size={16} /> Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f0f3f5] rounded-md text-[#8f9192]"><Play size={16}/></div>
                        <div>
                          <p className="text-xs text-[#bdc2c7] font-bold uppercase">Start Date</p>
                          <p className="text-sm font-bold text-[#1E293B]">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 border border-red-100 rounded-md text-red-600"><AlertCircle size={16}/></div>
                        <div>
                          <p className="text-xs text-[#bdc2c7] font-bold uppercase">End Date</p>
                          <p className="text-sm font-bold text-red-600">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-[#d6d9df]">
                        <p className="text-xs text-[#bdc2c7] font-bold uppercase mb-1">Time Remaining</p>
                        <p className={`text-lg font-bold ${getRemainingDays(selectedProject.endDate, selectedProject.status).includes('Overdue') ? 'text-red-600' : 'text-[#3B82F6]'}`}>
                          {getRemainingDays(selectedProject.endDate, selectedProject.status)}
                        </p>
                      </div>
                    </div>
                  </Card>

                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Project Form Modal (Create/Edit) */}
      <ProjectFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={fetchProjects}
        projectToEdit={projectToEdit}
      />

    </div>
  );
}