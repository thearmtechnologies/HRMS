import React, { useState, useEffect } from "react";
import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Code2,
  DollarSign,
  Download,
  FileText,
  Filter,
  FolderKanban,
  Grid,
  Laptop,
  LayoutTemplate,
  List,
  MapPin,
  Monitor,
  MoreVertical,
  Network,
  Plus,
  Search,
  Settings,
  Target,
  User,
  Users,
  X,
} from "lucide-react";

// --- MOCK DATA REMOVED - USING REAL API DATA ---

const ACTIVITIES = [
  { date: "Jun 10", desc: "New QA Department Created by Admin." },
  { date: "Jun 12", desc: "HR Head updated to Sarah Johnson." },
  { date: "Jun 15", desc: "IT Annual Budget increased by 15%." },
  { date: "Jun 18", desc: "Marketing Department moved to Delhi Branch." },
];

const ANALYTICS = {
  headcount: [
    { label: "IT", value: 45, color: "bg-[#3B82F6]" },
    { label: "Operations", value: 22, color: "bg-[#3B82F6]/80" },
    { label: "Finance", value: 18, color: "bg-[#3B82F6]/60" },
    { label: "Marketing", value: 14, color: "bg-[#3B82F6]/40" },
    { label: "HR", value: 12, color: "bg-[#3B82F6]/20" },
  ],
  budget: [
    { label: "IT", value: 50, display: "₹50L" },
    { label: "Finance", value: 20, display: "₹20L" },
    { label: "Marketing", value: 15, display: "₹15L" },
    { label: "HR", value: 10, display: "₹10L" },
  ],
};

// --- REUSABLE COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type = "default" }) => {
  const styles = {
    success: "bg-[#3B82F6]/10 text-[#1E293B]",
    warning: "bg-orange-100 text-orange-700",
    danger: "bg-red-100 text-red-700",
    default: "bg-[#f0f3f5] text-[#8f9192]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${styles[type]}`}>
      {children}
    </span>
  );
};

export default function Department() {
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDept, setSelectedDept] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDept, setNewDept] = useState({ departmentName: "", location: "Mumbai HQ", status: "Active" });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/department", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/department", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newDept)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewDept({ departmentName: "", location: "Mumbai HQ", status: "Active" });
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return "₹" + amount.toLocaleString("en-IN");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12 font-sans text-[#8f9192]">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Departments</h1>
          <p className="text-sm mt-1">Manage organizational departments and their structure</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#1E293B] rounded-lg text-sm font-semibold hover:bg-[#f0f3f5] transition-all shadow-sm">
            <FileText size={16} /> Department Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#1E293B] rounded-lg text-sm font-semibold hover:bg-[#f0f3f5] transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-[#fdfdfe] rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all shadow-sm">
            <Plus size={16} /> Create Department
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { title: "Total Departments", value: departments.length, sub: "Across all locations", icon: LayoutTemplate },
          { title: "Active Departments", value: departments.filter(d => d.status === 'Active').length, sub: "Currently operational", icon: Activity },
          { title: "Total Employees", value: departments.reduce((acc, curr) => acc + (curr.employeesCount || 0), 0), sub: "Assigned staff", icon: Users },
        ].map((stat, idx) => (
          <Card key={idx} className="p-5 flex items-center gap-4 hover:border-[#bdc2c7] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#f0f3f5] flex items-center justify-center text-[#1E293B]">
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-[#1E293B]">{stat.value}</p>
              <p className="text-xs text-[#bdc2c7] mt-1">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* 8. SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#fdfdfe] p-4 rounded-xl border border-[#d6d9df] shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#bdc2c7] group-focus-within:text-[#1E293B]" />
            </div>
            <input
              type="text"
              placeholder="Search departments..."
              className="w-full pl-10 pr-4 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm focus:outline-none focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all placeholder:text-[#bdc2c7]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 border border-[#d6d9df] text-[#8f9192] rounded-lg hover:bg-[#f0f3f5] hover:text-[#1E293B] transition-colors flex items-center gap-2">
            <Filter size={18} /> <span className="hidden sm:inline text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* View Toggles */}
        <div className="flex items-center p-1 bg-[#f0f3f5] rounded-lg border border-[#d6d9df]">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "grid" ? "bg-[#fdfdfe] text-[#1E293B] shadow-sm" : "text-[#bdc2c7] hover:text-[#8f9192]"
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "list" ? "bg-[#fdfdfe] text-[#1E293B] shadow-sm" : "text-[#bdc2c7] hover:text-[#8f9192]"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* 3 & 4. DEPARTMENT DIRECTORY (Grid / List) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-[#8f9192]">Loading departments...</div>
          ) : departments.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#8f9192]">No departments found.</div>
          ) : departments.map((dept) => (
            <Card key={dept._id} className="flex flex-col group">
              <div className="p-5 border-b border-[#d6d9df]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1E293B] leading-tight">{dept.departmentName}</h3>
                    <p className="text-xs text-[#bdc2c7] mt-1">{dept._id.substring(0,8)} • {dept.location || 'HQ'}</p>
                  </div>
                  <Badge type={dept.status === "Active" ? "success" : "default"}>{dept.status || 'Active'}</Badge>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f0f3f5] text-[#1E293B] flex items-center justify-center font-bold text-xs shrink-0">
                      {(dept.head?.firstName?.charAt(0) || "U")}
                    </div>
                    <div>
                      <p className="text-xs text-[#bdc2c7]">Department Head</p>
                      <p className="text-sm font-semibold text-[#1E293B]">{dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-[#f0f3f5]/50 flex items-center justify-between mt-auto">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1E293B]">{dept.employeesCount || 0}</p>
                    <p className="text-xs text-[#8f9192]">Employees</p>
                  </div>
                  <div className="w-px bg-[#d6d9df]"></div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1E293B]">0</p>
                    <p className="text-xs text-[#8f9192]">Projects</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDept(dept)}
                  className="px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#1E293B] rounded-lg text-sm font-semibold hover:border-[#3B82F6] transition-colors shadow-sm"
                >
                  View Details
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#f0f3f5] border-b border-[#d6d9df] text-[#8f9192] text-xs uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Head</th>
                <th className="px-5 py-4 font-semibold text-center">Employees</th>
                <th className="px-5 py-4 font-semibold text-center">Projects</th>
                <th className="px-5 py-4 font-semibold">Location</th>
                <th className="px-5 py-4 font-semibold text-center">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6d9df] text-sm">
              {departments.map((dept) => (
                <tr key={dept._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#1E293B]">{dept.departmentName}</p>
                    <p className="text-xs text-[#bdc2c7]">{dept._id.substring(0,8)}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-[#1E293B]">{dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : 'Unassigned'}</td>
                  <td className="px-5 py-4 text-center font-bold">{dept.employeesCount || 0}</td>
                  <td className="px-5 py-4 text-center font-bold">0</td>
                  <td className="px-5 py-4">{dept.location || 'HQ'}</td>
                  <td className="px-5 py-4 text-center">
                    <Badge type={dept.status === "Active" ? "success" : "default"}>{dept.status || 'Active'}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedDept(dept)}
                      className="text-[#1E293B] font-semibold hover:underline text-xs"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* 6 & 7. ANALYTICS & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Analytics */}
        <Card className="lg:col-span-2 p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <BarChart3 size={20} /> Department Analytics
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-auto">
            {/* Employees Chart */}
            <div>
              <p className="text-sm font-semibold mb-4 border-b border-[#d6d9df] pb-2">Employees per Department</p>
              <div className="space-y-3">
                {ANALYTICS.headcount.map((item, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <span className="w-20 shrink-0 font-medium">{item.label}</span>
                    <div className="flex-1 h-3 bg-[#f0f3f5] rounded-full overflow-hidden mx-3">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / 50) * 100}%` }}></div>
                    </div>
                    <span className="w-8 text-right font-bold text-[#1E293B]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Chart */}
            <div>
              <p className="text-sm font-semibold mb-4 border-b border-[#d6d9df] pb-2">Budget Distribution</p>
              <div className="space-y-3">
                {ANALYTICS.budget.map((item, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <span className="w-20 shrink-0 font-medium">{item.label}</span>
                    <div className="flex-1 h-3 bg-[#f0f3f5] rounded-full overflow-hidden mx-3">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(item.value / 60) * 100}%` }}></div>
                    </div>
                    <span className="w-10 text-right font-bold text-[#1E293B]">{item.display}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2 mb-6">
            <Activity size={20} /> Department Activity
          </h2>
          <div className="relative border-l-2 border-[#d6d9df] ml-3 space-y-6">
            {ACTIVITIES.map((item, idx) => (
              <div key={idx} className="relative pl-6">
                <div className="absolute w-3 h-3 bg-[#3B82F6] rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_#fdfdfe]"></div>
                <p className="text-xs font-bold text-[#bdc2c7] mb-0.5">{item.date}</p>
                <p className="text-sm font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 5. DEPARTMENT DETAILS MODAL */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#3B82F6]/20 backdrop-blur-sm"
            onClick={() => setSelectedDept(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-[#fdfdfe] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="shrink-0 p-5 sm:p-6 border-b border-[#d6d9df] flex items-start justify-between bg-[#fdfdfe]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-[#1E293B]">{selectedDept.departmentName}</h2>
                  <Badge type={selectedDept.status === "Active" ? "success" : "default"}>{selectedDept.status || 'Active'}</Badge>
                </div>
                <p className="text-sm">Department Code: <span className="font-semibold text-[#8f9192]">{selectedDept._id.substring(0,8)}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[#d6d9df] rounded-lg text-sm font-semibold hover:bg-[#f0f3f5] transition-colors">
                  <Settings size={16} /> Manage
                </button>
                <button 
                  onClick={() => setSelectedDept(null)}
                  className="p-2 text-[#bdc2c7] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#f0f3f5]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Basic & Leadership Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-5">
                      <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2">Basic Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Type</span> <span className="font-semibold text-[#8f9192]">Core Unit</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Location</span> <span className="font-semibold text-[#8f9192]">{selectedDept.location || 'HQ'}</span></div>
                      </div>
                    </Card>
                    
                    <Card className="p-5">
                      <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2">Leadership</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Dept Head</span> <span className="font-bold text-[#1E293B]">{selectedDept.head ? `${selectedDept.head.firstName} ${selectedDept.head.lastName}` : 'Unassigned'}</span></div>
                      </div>
                    </Card>
                  </div>

                  {/* Workforce & Hierarchy */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center justify-between">
                      <span>Workforce & Structure</span>
                      <span className="bg-[#f0f3f5] px-2 py-1 rounded text-xs font-bold">Total: {selectedDept.employeesCount || 0}</span>
                    </h3>
                  </Card>

                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  
                  {/* Budget */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                      <DollarSign size={16} /> Budget Allocation
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-[#bdc2c7] font-semibold uppercase mb-1">Annual Budget</p>
                        <p className="text-xl font-bold text-[#1E293B]">{formatCurrency(selectedDept.budget?.annual || 0)}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f0f3f5] p-3 rounded-lg">
                          <p className="text-xs text-[#bdc2c7] font-semibold uppercase mb-1">Used</p>
                          <p className="text-sm font-bold text-orange-600">{formatCurrency(selectedDept.budget?.used || 0)}</p>
                        </div>
                        <div className="bg-[#f0f3f5] p-3 rounded-lg">
                          <p className="text-xs text-[#bdc2c7] font-semibold uppercase mb-1">Remaining</p>
                          <p className="text-sm font-bold text-[#1E293B]">
                            {formatCurrency((selectedDept.budget?.annual || 0) - (selectedDept.budget?.used || 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#3B82F6]/20 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="bg-[#fdfdfe] w-full max-w-md rounded-xl shadow-2xl relative z-10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#1E293B]">Create Department</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#bdc2c7] hover:text-[#1E293B]"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#8f9192] mb-1 block">Department Name</label>
                <input required type="text" value={newDept.departmentName} onChange={e => setNewDept({...newDept, departmentName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-[#8f9192] mb-1 block">Location</label>
                <input type="text" value={newDept.location} onChange={e => setNewDept({...newDept, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-[#8f9192] mb-1 block">Status</label>
                <select value={newDept.status} onChange={e => setNewDept({...newDept, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-[#3B82F6] text-white rounded-lg font-bold hover:bg-opacity-90">Create Department</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}