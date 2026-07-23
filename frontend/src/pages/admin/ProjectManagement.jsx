import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
import { AuthContext } from "../../context/AuthContext";
import StatCard from "../../components/common/StatCard";

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
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("list");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useContext(AuthContext);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  // Progress/Status updating in Details Modal
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [projectDocuments, setProjectDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handleUploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedProject) return;
    setUploadingDoc(true);
    try {
      const token = localStorage.getItem("token");
      const docFormData = new FormData();
      docFormData.append("document", file);
      const res = await fetch(`http://localhost:5000/api/projects/${selectedProject._id}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: docFormData
      });
      if (res.ok) {
        const data = await res.json();
        setProjectDocuments(prev => [data.document, ...prev]);
      } else {
        const errData = await res.json();
        alert(errData.error || errData.message || "We couldn't upload the document. Please contact support.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading document");
    } finally {
      setUploadingDoc(false);
    }
  };

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

  const handleOpenDetails = async (project) => {
    setSelectedProject(project);
    setEditProgress(project.progressPercentage);
    setEditStatus(project.status);
    
    // Fetch documents
    setDocumentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/projects/${project._id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjectDocuments(data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDocumentsLoading(false);
    }
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 font-sans text-[#334155]">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Project Management</h1>
          <p className="text-sm mt-1 text-[#475569] font-medium">Create, assign, monitor, and control projects</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasPermission('projects', 'create') && (
            <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-[#fdfdfe] rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all shadow-sm">
              <Plus size={16} /> Create Project
            </button>
          )}
        </div>
      </div>

      {/* 2. OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard title="Total Projects" value={stats.total} icon={FolderKanban} colorClass="bg-[#f0f3f5] text-[#1E293B]" />
        <StatCard title="Active" value={stats.active} icon={Activity} colorClass="bg-blue-50 text-blue-600" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} colorClass="bg-green-50 text-green-600" />
        <StatCard title="On Hold" value={stats.onHold} icon={Clock} colorClass="bg-yellow-50 text-yellow-600" />
        <StatCard title="Delayed Projects" value={stats.delayed} icon={AlertCircle} colorClass="bg-red-50 text-red-600" />
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#fdfdfe] p-4 rounded-xl border border-[#d6d9df] shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#94a3b8] group-focus-within:text-[#1E293B]" />
            </div>
            <input
              id="searchProjects"
              name="searchProjects"
              type="text"
              placeholder="Search by Name, Code, or Dept..."
              className="w-full pl-10 pr-4 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#1E293B] font-medium focus:outline-none focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all placeholder:text-[#94a3b8]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 border border-[#d6d9df] bg-[#f0f3f5] p-1 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "list" ? "bg-white text-[#1E293B] shadow-sm" : "text-[#64748B] hover:text-[#1E293B]"}`}
          >
            <List size={14} /> List
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "grid" ? "bg-white text-[#1E293B] shadow-sm" : "text-[#64748B] hover:text-[#1E293B]"}`}
          >
            <Grid size={14} /> Grid
          </button>
        </div>
      </div>

      {/* PROJECT TABLE / GRID */}
      {loading ? (
        <div className="py-20 text-center"><div className="animate-spin inline-block w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full"></div></div>
      ) : filteredProjects.length === 0 ? (
        <Card className="py-20 flex flex-col items-center justify-center text-center">
          <FolderKanban size={48} className="text-[#94a3b8] mb-4" />
          <h3 className="text-lg font-bold text-[#1E293B]">No Projects Found</h3>
          <p className="text-sm text-[#475569] mt-1">Create a new project to get started or adjust your search filters.</p>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => (
            <Card key={proj._id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border border-[#d6d9df] bg-[#fdfdfe]">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-[#3B82F6] tracking-wide uppercase">{proj.projectCode}</span>
                    <h3 
                      onClick={() => navigate(`?tab=project-detail&projectId=${proj._id}`)}
                      className="text-lg font-bold text-[#1E293B] hover:text-[#3B82F6] cursor-pointer transition-colors leading-snug mt-0.5"
                    >
                      {proj.projectName}
                    </h3>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <StatusBadge status={proj.status} />
                    <PriorityBadge priority={proj.priority} />
                  </div>
                </div>

                <p className="text-xs font-medium text-[#475569] mb-4">
                  Dept: <span className="text-[#1E293B] font-semibold">{proj.department?.departmentName || "N/A"}</span>
                </p>

                <div className="space-y-3 py-3 border-t border-b border-[#f0f3f5] text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] font-medium">Manager:</span>
                    <span className="font-bold text-[#1E293B] truncate max-w-[180px]">
                      {proj.projectManager ? (proj.projectManager.employeeName || proj.projectManager.fullName || `${proj.projectManager.firstName} ${proj.projectManager.lastName}`) : "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] font-medium">Team Size:</span>
                    <span className="font-bold text-[#1E293B] bg-[#f0f3f5] px-2 py-0.5 rounded">{proj.assignedEmployees?.length || 0} Members</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] font-medium">Duration:</span>
                    <span className="font-semibold text-[#334155]">{new Date(proj.startDate).toLocaleDateString()} - {new Date(proj.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 mb-4">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-[#475569]">Progress</span>
                    <span className="font-bold text-[#1E293B]">{proj.progressPercentage}%</span>
                  </div>
                  <ProgressBar progress={proj.progressPercentage} colorClass={proj.progressPercentage === 100 ? "bg-green-500" : "bg-[#3B82F6]"} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#f0f3f5] mt-auto">
                <button 
                  onClick={() => navigate(`?tab=project-detail&projectId=${proj._id}`)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors rounded-lg text-xs font-bold"
                  title="Open Kanban Board & Workspace"
                >
                  <FolderKanban size={14} /> Board
                </button>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenDetails(proj)} className="px-3 py-1.5 bg-[#f0f3f5] text-[#1E293B] hover:bg-[#e2e4e8] transition-colors rounded-lg text-xs font-bold">View</button>
                  {hasPermission('projects', 'edit') && (
                    <button onClick={() => handleOpenEdit(proj)} className="px-2.5 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors rounded-lg text-xs font-bold">Edit</button>
                  )}
                  {proj.status !== "Archived" && hasPermission('projects', 'archive') && (
                    <button onClick={() => handleArchive(proj._id, proj.projectName)} className="px-2.5 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors rounded-lg text-xs font-bold">Archive</button>
                  )}
                  {hasPermission('projects', 'delete') && (
                    <button onClick={() => handleDelete(proj._id, proj.projectName)} className="px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-lg text-xs font-bold">Delete</button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card noPadding className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#f0f3f5] border-b border-[#d6d9df] text-[#475569] text-xs font-bold uppercase tracking-wider">
                <th className="px-5 py-4 font-bold">Project Code</th>
                <th className="px-5 py-4 font-bold">Project Name</th>
                <th className="px-5 py-4 font-bold">Department</th>
                <th className="px-5 py-4 font-bold">Manager</th>
                <th className="px-5 py-4 font-bold text-center">Team Size</th>
                <th className="px-5 py-4 font-bold">Priority</th>
                <th className="px-5 py-4 font-bold text-center">Status</th>
                <th className="px-5 py-4 font-bold w-32">Progress</th>
                <th className="px-5 py-4 font-bold">Start Date</th>
                <th className="px-5 py-4 font-bold">End Date</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6d9df] text-sm">
              {filteredProjects.map((proj) => (
                <tr key={proj._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[#1E293B]">
                    <button onClick={() => navigate(`?tab=project-detail&projectId=${proj._id}`)} className="hover:text-[#3B82F6] hover:underline transition-colors text-left font-bold cursor-pointer" title="Open Project Workspace">
                      {proj.projectCode}
                    </button>
                  </td>
                  <td className="px-5 py-4 font-bold text-[#1E293B]">
                    <button onClick={() => navigate(`?tab=project-detail&projectId=${proj._id}`)} className="hover:text-[#3B82F6] hover:underline transition-colors text-left font-bold cursor-pointer" title="Open Project Workspace">
                      {proj.projectName}
                    </button>
                  </td>
                  <td className="px-5 py-4 font-medium text-[#334155]">{proj.department?.departmentName || "N/A"}</td>
                  <td className="px-5 py-4 font-semibold text-[#1E293B]">
                    {proj.projectManager ? (proj.projectManager.employeeName || proj.projectManager.fullName || `${proj.projectManager.firstName} ${proj.projectManager.lastName}`) : "Unassigned"}
                  </td>
                  <td className="px-5 py-4 text-center font-bold bg-[#f0f3f5]/50 text-[#1E293B]">{proj.assignedEmployees?.length || 0}</td>
                  <td className="px-5 py-4"><PriorityBadge priority={proj.priority} /></td>
                  <td className="px-5 py-4 text-center"><StatusBadge status={proj.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1E293B] w-8 text-right">{proj.progressPercentage}%</span>
                      <ProgressBar progress={proj.progressPercentage} colorClass={proj.progressPercentage === 100 ? "bg-green-500" : "bg-[#3B82F6]"} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-[#475569]">{new Date(proj.startDate).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-[#475569]">{new Date(proj.endDate).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button onClick={() => navigate(`?tab=project-detail&projectId=${proj._id}`)} className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-xs font-bold inline-flex items-center gap-1 cursor-pointer" title="Open Kanban Board & Workspace"><FolderKanban size={13} /> Board</button>
                    <button onClick={() => handleOpenDetails(proj)} className="text-[#3B82F6] hover:underline text-xs font-bold">View</button>
                    {hasPermission('projects', 'edit') && (
                      <button onClick={() => handleOpenEdit(proj)} className="text-orange-500 hover:underline text-xs font-bold">Edit</button>
                    )}
                    {proj.status !== "Archived" && hasPermission('projects', 'archive') && (
                      <button onClick={() => handleArchive(proj._id, proj.projectName)} className="text-gray-500 hover:underline text-xs font-bold">Archive</button>
                    )}
                    {hasPermission('projects', 'delete') && (
                      <button onClick={() => handleDelete(proj._id, proj.projectName)} className="text-red-500 hover:underline text-xs font-bold">Delete</button>
                    )}
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
                <p className="text-sm text-[#475569]">Project Code: <span className="font-bold text-[#1E293B]">{selectedProject.projectCode}</span> • Department: <span className="font-bold text-[#1E293B]">{selectedProject.department?.departmentName || "N/A"}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setSelectedProject(null); navigate(`?tab=project-detail&projectId=${selectedProject._id}`); }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm cursor-pointer"
                >
                  <FolderKanban size={16} /> Open Board & Tasks
                </button>
                {hasPermission('projects', 'edit') && (
                  <button onClick={() => handleOpenEdit(selectedProject)} className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f0f3f5] text-[#1E293B] rounded-lg text-sm font-semibold hover:bg-[#e2e4e8] transition-colors">
                    <Edit size={16} /> Edit
                  </button>
                )}
                <button onClick={() => setSelectedProject(null)} className="p-2 text-[#94a3b8] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-full transition-colors">
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
                          <p className="text-sm font-bold text-[#1E293B]">{selectedProject.projectManager.employeeName || selectedProject.projectManager.fullName || `${selectedProject.projectManager.firstName} ${selectedProject.projectManager.lastName}`}</p>
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
                          <span className="text-[#3B82F6] text-lg">{selectedProject.progressPercentage || 0}%</span>
                        </div>
                        <p className="text-xs text-[#bdc2c7] italic mb-4">Progress is automatically calculated based on completed tasks.</p>
                      </div>

                      <div>
                        <label htmlFor="updateProjectStatus" className="block text-xs font-bold text-[#8f9192] mb-2">Update Status</label>
                        <select 
                          id="updateProjectStatus"
                          name="updateProjectStatus"
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
                        disabled={isUpdating || !hasPermission('projects', 'edit')}
                        className={`w-full py-2 bg-[#1E293B] text-white rounded-lg text-sm font-bold transition-colors ${hasPermission('projects', 'edit') ? 'hover:bg-black' : 'opacity-50 cursor-not-allowed'}`}
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

                  {/* Documents */}
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-[#d6d9df] pb-2">
                      <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                        <FileText size={16} /> Documents
                      </h3>
                      {hasPermission('projects', 'edit') && (
                        <label htmlFor="uploadProjectDocument" className="cursor-pointer bg-[#3B82F6] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-opacity-90 flex items-center gap-1 shadow-sm transition-all">
                          <Plus size={14} /> {uploadingDoc ? "Uploading..." : "Upload Doc"}
                          <input id="uploadProjectDocument" name="uploadProjectDocument" type="file" onChange={handleUploadDocument} disabled={uploadingDoc} className="hidden" />
                        </label>
                      )}
                    </div>
                    {documentsLoading ? (
                      <div className="flex justify-center py-4"><div className="animate-spin inline-block w-5 h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full"></div></div>
                    ) : projectDocuments.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm font-medium text-[#8f9192]">No documents attached.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {projectDocuments.map(doc => (
                          <div key={doc._id} className="flex items-center justify-between p-3 bg-[#f0f3f5] rounded-lg border border-[#d6d9df]">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 bg-blue-100 text-blue-600 rounded shrink-0">
                                <FileText size={16} />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-bold text-[#1E293B] truncate">{doc.name}</p>
                                <p className="text-xs text-[#8f9192]">{new Date(doc.createdAt).toLocaleDateString()} • {(doc.sizeBytes / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-[#3B82F6] hover:bg-blue-50 rounded-full shrink-0 transition-colors">
                              <Download size={16} />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
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