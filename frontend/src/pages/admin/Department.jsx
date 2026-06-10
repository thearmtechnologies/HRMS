import React, { useState } from "react";
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

// --- MOCK DATA ---
const DEPARTMENTS = [
  {
    id: "IT001",
    name: "Information Technology",
    head: "Kaustubh Pawar",
    employees: 45,
    projects: 8,
    status: "Active",
    location: "Mumbai HQ",
    createdDate: "01 Jan 2020",
    budget: { annual: 5000000, used: 3150000 },
    workforce: { fullTime: 40, partTime: 3, remote: 2, newHires: 5 },
    leadership: { head: "Kaustubh Pawar", manager: "David Wilson", leads: 4 },
    assets: { laptops: 45, monitors: 60, servers: 5 },
    kpis: { completion: 95, retention: 92, attendance: 97, training: 85 },
    skills: ["React", "Node.js", "Java", "AWS", "UI/UX", "Python"],
    activeProjects: [
      { name: "HRMS Development", status: "In Progress", priority: "High", deadline: "Dec 2026" },
      { name: "CRM Migration", status: "Planning", priority: "Medium", deadline: "Feb 2027" },
    ],
  },
  {
    id: "HR001",
    name: "Human Resources",
    head: "Sarah Johnson",
    employees: 12,
    projects: 2,
    status: "Active",
    location: "Mumbai HQ",
    createdDate: "15 Feb 2020",
    budget: { annual: 1000000, used: 450000 },
    workforce: { fullTime: 12, partTime: 0, remote: 0, newHires: 2 },
    leadership: { head: "Sarah Johnson", manager: "Emily Chen", leads: 1 },
    assets: { laptops: 12, monitors: 12, servers: 0 },
    kpis: { completion: 98, retention: 88, attendance: 95, training: 90 },
    skills: ["Recruitment", "Onboarding", "Conflict Resolution", "Payroll"],
    activeProjects: [
      { name: "Q3 Hiring Drive", status: "In Progress", priority: "High", deadline: "Oct 2026" },
    ],
  },
  {
    id: "FIN001",
    name: "Finance",
    head: "Michael Chang",
    employees: 18,
    projects: 3,
    status: "Active",
    location: "Delhi Branch",
    createdDate: "10 Mar 2020",
    budget: { annual: 2000000, used: 1200000 },
    workforce: { fullTime: 18, partTime: 0, remote: 1, newHires: 1 },
    leadership: { head: "Michael Chang", manager: "Robert Fox", leads: 2 },
    assets: { laptops: 18, monitors: 20, servers: 1 },
    kpis: { completion: 100, retention: 94, attendance: 98, training: 80 },
    skills: ["Accounting", "Taxation", "Auditing", "Financial Modeling"],
    activeProjects: [
      { name: "Annual Audit 2026", status: "In Progress", priority: "Critical", deadline: "Nov 2026" },
    ],
  },
];

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
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [selectedDept, setSelectedDept] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-[#fdfdfe] rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all shadow-sm">
            <Plus size={16} /> Create Department
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { title: "Total Departments", value: "12", sub: "Across all locations", icon: LayoutTemplate },
          { title: "Active Departments", value: "11", sub: "Currently operational", icon: Activity },
          { title: "Department Heads", value: "12", sub: "Assigned leaders", icon: Briefcase },
          { title: "Largest Department", value: "IT", sub: "45 Employees", icon: Users },
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
          {DEPARTMENTS.map((dept) => (
            <Card key={dept.id} className="flex flex-col group">
              <div className="p-5 border-b border-[#d6d9df]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1E293B] leading-tight">{dept.name}</h3>
                    <p className="text-xs text-[#bdc2c7] mt-1">{dept.id} • {dept.location}</p>
                  </div>
                  <Badge type={dept.status === "Active" ? "success" : "default"}>{dept.status}</Badge>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f0f3f5] text-[#1E293B] flex items-center justify-center font-bold text-xs shrink-0">
                      {dept.head.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-[#bdc2c7]">Department Head</p>
                      <p className="text-sm font-semibold text-[#1E293B]">{dept.head}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-[#f0f3f5]/50 flex items-center justify-between mt-auto">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1E293B]">{dept.employees}</p>
                    <p className="text-xs text-[#8f9192]">Employees</p>
                  </div>
                  <div className="w-px bg-[#d6d9df]"></div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1E293B]">{dept.projects}</p>
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
              {DEPARTMENTS.map((dept) => (
                <tr key={dept.id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#1E293B]">{dept.name}</p>
                    <p className="text-xs text-[#bdc2c7]">{dept.id}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-[#1E293B]">{dept.head}</td>
                  <td className="px-5 py-4 text-center font-bold">{dept.employees}</td>
                  <td className="px-5 py-4 text-center font-bold">{dept.projects}</td>
                  <td className="px-5 py-4">{dept.location}</td>
                  <td className="px-5 py-4 text-center">
                    <Badge type={dept.status === "Active" ? "success" : "default"}>{dept.status}</Badge>
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
                  <h2 className="text-2xl font-bold text-[#1E293B]">{selectedDept.name}</h2>
                  <Badge type={selectedDept.status === "Active" ? "success" : "default"}>{selectedDept.status}</Badge>
                </div>
                <p className="text-sm">Department Code: <span className="font-semibold text-[#8f9192]">{selectedDept.id}</span></p>
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
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Created On</span> <span className="font-semibold text-[#8f9192]">{selectedDept.createdDate}</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Location</span> <span className="font-semibold text-[#8f9192]">{selectedDept.location}</span></div>
                      </div>
                    </Card>
                    
                    <Card className="p-5">
                      <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2">Leadership</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Dept Head</span> <span className="font-bold text-[#1E293B]">{selectedDept.leadership.head}</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Manager</span> <span className="font-semibold text-[#8f9192]">{selectedDept.leadership.manager}</span></div>
                        <div className="flex justify-between"><span className="text-[#bdc2c7]">Team Leads</span> <span className="font-semibold text-[#8f9192]">{selectedDept.leadership.leads}</span></div>
                      </div>
                    </Card>
                  </div>

                  {/* Workforce & Hierarchy */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center justify-between">
                      <span>Workforce & Structure</span>
                      <span className="bg-[#f0f3f5] px-2 py-1 rounded text-xs font-bold">Total: {selectedDept.employees}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center"><span className="text-[#bdc2c7]">Full Time</span> <span className="font-semibold bg-[#f0f3f5] px-2 py-0.5 rounded">{selectedDept.workforce.fullTime}</span></div>
                          <div className="flex justify-between items-center"><span className="text-[#bdc2c7]">Part Time</span> <span className="font-semibold bg-[#f0f3f5] px-2 py-0.5 rounded">{selectedDept.workforce.partTime}</span></div>
                          <div className="flex justify-between items-center"><span className="text-[#bdc2c7]">Remote Workers</span> <span className="font-semibold bg-[#f0f3f5] px-2 py-0.5 rounded">{selectedDept.workforce.remote}</span></div>
                          <div className="flex justify-between items-center"><span className="text-[#bdc2c7]">New Hires (YTD)</span> <span className="font-semibold text-[#1E293B] bg-[#3B82F6]/10 px-2 py-0.5 rounded">+{selectedDept.workforce.newHires}</span></div>
                        </div>
                      </div>

                      {/* Hierarchy Tree Visual */}
                      <div className="bg-[#fdfdfe] border border-[#d6d9df] rounded-lg p-4 text-sm font-medium">
                        <div className="flex items-center gap-2 text-[#1E293B] font-bold">
                          <Building2 size={16} /> {selectedDept.name}
                        </div>
                        <div className="ml-4 border-l-2 border-[#d6d9df] pl-4 mt-2 space-y-2">
                          <div className="flex items-center gap-2 relative">
                            <div className="absolute w-4 h-0.5 bg-[#d6d9df] -left-4 top-1/2"></div>
                            <User size={14} className="text-[#bdc2c7]"/> Department Head
                          </div>
                          <div className="ml-4 border-l-2 border-[#d6d9df] pl-4 space-y-2">
                            <div className="flex items-center gap-2 relative text-[#8f9192]">
                              <div className="absolute w-4 h-0.5 bg-[#d6d9df] -left-4 top-1/2"></div>
                              <Network size={14} className="text-[#bdc2c7]"/> Managers & Leads
                            </div>
                            <div className="ml-4 border-l-2 border-[#d6d9df] pl-4 space-y-1">
                              <div className="flex items-center gap-2 relative text-xs text-[#bdc2c7]">
                                <div className="absolute w-4 h-0.5 bg-[#d6d9df] -left-4 top-1/2"></div>
                                Core Teams
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Current Projects */}
                  <Card className="p-0 overflow-hidden">
                    <div className="p-5 border-b border-[#d6d9df]">
                      <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider">Current Projects</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                        <thead>
                          <tr className="bg-[#f0f3f5] text-[#8f9192] text-xs uppercase">
                            <th className="px-5 py-3 font-semibold">Project Name</th>
                            <th className="px-5 py-3 font-semibold text-center">Status</th>
                            <th className="px-5 py-3 font-semibold text-center">Priority</th>
                            <th className="px-5 py-3 font-semibold text-right">Deadline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d6d9df]">
                          {selectedDept.activeProjects.map((proj, i) => (
                            <tr key={i} className="hover:bg-[#f0f3f5]/50">
                              <td className="px-5 py-3 font-bold text-[#1E293B]">{proj.name}</td>
                              <td className="px-5 py-3 text-center"><Badge type="default">{proj.status}</Badge></td>
                              <td className="px-5 py-3 text-center">
                                <span className={`text-xs font-bold ${proj.priority === 'High' || proj.priority === 'Critical' ? 'text-red-600' : 'text-orange-500'}`}>
                                  {proj.priority}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right text-[#8f9192]">{proj.deadline}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                        <p className="text-xl font-bold text-[#1E293B]">{formatCurrency(selectedDept.budget.annual)}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f0f3f5] p-3 rounded-lg">
                          <p className="text-xs text-[#bdc2c7] font-semibold uppercase mb-1">Used</p>
                          <p className="text-sm font-bold text-orange-600">{formatCurrency(selectedDept.budget.used)}</p>
                        </div>
                        <div className="bg-[#f0f3f5] p-3 rounded-lg">
                          <p className="text-xs text-[#bdc2c7] font-semibold uppercase mb-1">Remaining</p>
                          <p className="text-sm font-bold text-[#1E293B]">
                            {formatCurrency(selectedDept.budget.annual - selectedDept.budget.used)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-[#8f9192]">Utilization</span>
                          <span className="text-[#1E293B]">{Math.round((selectedDept.budget.used / selectedDept.budget.annual) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#f0f3f5] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#3B82F6] rounded-full" 
                            style={{ width: `${(selectedDept.budget.used / selectedDept.budget.annual) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* KPIs */}
                  <Card className="p-5 bg-[#3B82F6] text-[#fdfdfe] border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#fdfdfe]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[#fdfdfe]/20 pb-2 flex items-center gap-2 relative z-10">
                      <Target size={16} /> Department KPIs
                    </h3>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      <div>
                        <p className="text-2xl font-bold">{selectedDept.kpis.completion}%</p>
                        <p className="text-xs text-[#d6d9df]">Project Success</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedDept.kpis.retention}%</p>
                        <p className="text-xs text-[#d6d9df]">Retention Rate</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedDept.kpis.attendance}%</p>
                        <p className="text-xs text-[#d6d9df]">Attendance</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedDept.kpis.training}%</p>
                        <p className="text-xs text-[#d6d9df]">Training Done</p>
                      </div>
                    </div>
                  </Card>

                  {/* Department Skills */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                      <Code2 size={16} /> Core Capabilities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDept.skills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#f0f3f5] text-[#1E293B] border border-[#d6d9df] rounded-md text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Card>

                  {/* Assets */}
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                      <Laptop size={16} /> Assigned Assets
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[#8f9192]"><Laptop size={14}/> Laptops</span>
                        <span className="font-bold text-[#1E293B]">{selectedDept.assets.laptops}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[#8f9192]"><Monitor size={14}/> Monitors</span>
                        <span className="font-bold text-[#1E293B]">{selectedDept.assets.monitors}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[#8f9192]"><Network size={14}/> Servers</span>
                        <span className="font-bold text-[#1E293B]">{selectedDept.assets.servers}</span>
                      </div>
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