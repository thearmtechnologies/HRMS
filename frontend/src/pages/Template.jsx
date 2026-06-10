import React, { useState, useMemo } from 'react';

const PROJECTS = [
  {
    id: "PRJ-101",
    name: "Employee Self-Service Portal",
    department: "HR Operations",
    lead: "Sarah Jenkins",
    leadAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    status: "In Progress",
    priority: "High",
    progress: 68,
    deadline: "Oct 15, 2026",
    description: "Developing a unified web portal for employees to manage leaves, view payslips, and update personal information without HR intervention. Aiming to reduce HR ticket volume by 40%.",
    milestones: [
      { id: 1, title: "UI/UX Design Handover", completed: true, date: "Aug 01" },
      { id: 2, title: "Backend API Integration", completed: true, date: "Sep 15" },
      { id: 3, title: "UAT Phase 1", completed: false, date: "Oct 01" },
      { id: 4, title: "Production Deployment", completed: false, date: "Oct 15" }
    ],
    team: [
      { name: "Sarah Jenkins", role: "Project Lead", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" },
      { name: "Marcus Vance", role: "Frontend Developer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" },
      { name: "Elena Rostova", role: "QA Engineer", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120" }
    ],
    files: [
      { id: 1, name: "Portal_Requirements_v2.pdf", size: "2.4 MB", type: "pdf" },
      { id: 2, name: "API_Endpoints_Spec.md", size: "145 KB", type: "doc" }
    ]
  },
  {
    id: "PRJ-102",
    name: "Q3 Performance Review Cycle",
    department: "Talent Management",
    lead: "David Chen",
    leadAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    status: "Pending",
    priority: "Medium",
    progress: 15,
    deadline: "Nov 01, 2026",
    description: "Configuring the 360-degree feedback loops and performance appraisal templates for the upcoming quarterly review cycle across all global departments.",
    milestones: [
      { id: 1, title: "Finalize Questionnaire", completed: true, date: "Sep 10" },
      { id: 2, title: "Manager Training Sessions", completed: false, date: "Oct 05" },
      { id: 3, title: "Launch Review Cycle", completed: false, date: "Oct 15" }
    ],
    team: [
      { name: "David Chen", role: "Talent Director", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120" },
      { name: "Amara Diallo", role: "HR Business Partner", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" }
    ],
    files: [
      { id: 1, name: "Q3_Appraisal_Metrics.xlsx", size: "1.1 MB", type: "sheet" }
    ]
  },
  {
    id: "PRJ-103",
    name: "Global Payroll Integration",
    department: "Finance",
    lead: "Michael Chang",
    leadAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
    status: "At Risk",
    priority: "Critical",
    progress: 45,
    deadline: "Dec 31, 2026",
    description: "Migrating localized European payroll vendors into a centralized global platform to ensure unified reporting and compliance consistency.",
    milestones: [
      { id: 1, title: "Vendor Selection", completed: true, date: "Jul 15" },
      { id: 2, title: "Data Mapping (EU)", completed: true, date: "Aug 30" },
      { id: 3, title: "Parallel Run Testing", completed: false, date: "Nov 15" },
      { id: 4, title: "Go Live", completed: false, date: "Dec 31" }
    ],
    team: [
      { name: "Michael Chang", role: "VP Finance", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120" },
      { name: "Sarah Jenkins", role: "HR Integration Lead", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" }
    ],
    files: [
      { id: 1, name: "EU_Compliance_Audit.pdf", size: "5.6 MB", type: "pdf" },
      { id: 2, name: "Vendor_Contract_Final.pdf", size: "3.2 MB", type: "pdf" }
    ]
  },
  {
    id: "PRJ-104",
    name: "Diversity & Inclusion Workshop",
    department: "Culture",
    lead: "Amara Diallo",
    leadAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    status: "Completed",
    priority: "Low",
    progress: 100,
    deadline: "Sep 01, 2026",
    description: "Organization and execution of company-wide D&I workshops aimed at leadership teams across North American offices.",
    milestones: [
      { id: 1, title: "Curriculum Design", completed: true, date: "Jul 10" },
      { id: 2, title: "Facilitator Booking", completed: true, date: "Aug 05" },
      { id: 3, title: "Session Delivery", completed: true, date: "Sep 01" }
    ],
    team: [
      { name: "Amara Diallo", role: "Culture Lead", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" }
    ],
    files: [
      { id: 1, name: "Workshop_Deck.pptx", size: "12.4 MB", type: "presentation" }
    ]
  }
];

const INITIAL_TASKS = [
  { id: "TSK-01", name: "Review UAT feedback logs", project: "Employee Self-Service", priority: "High", due: "Oct 05, 2026", status: "In Progress" },
  { id: "TSK-02", name: "Approve vendor contract (EU)", project: "Global Payroll Integration", priority: "Critical", due: "Oct 10, 2026", status: "Pending" },
  { id: "TSK-03", name: "Schedule manager training invites", project: "Q3 Performance Review", priority: "Medium", due: "Oct 01, 2026", status: "Completed" },
  { id: "TSK-04", name: "Finalize API rate limiting rules", project: "Employee Self-Service", priority: "Low", due: "Oct 12, 2026", status: "Pending" }
];

export default function Template() {
  const [activeMenu, setActiveMenu] = useState("Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[0].id);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState("overview");

  // Dynamic values
  const activeProject = useMemo(() => PROJECTS.find(p => p.id === selectedProjectId), [selectedProjectId]);
  
  const handleTaskStatusToggle = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === "Pending" ? "In Progress" : t.status === "In Progress" ? "Completed" : "Pending";
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  return (
    <div className="flex h-screen bg-[#F5F7FB] text-[#1E293B] font-sans antialiased selection:bg-[#DBEAFE] selection:text-[#1E293B] overflow-hidden">
      
      {/* SIDEBAR: Light, clean, thin border */}
      <aside className="w-64 bg-[#FFFFFF] border-r border-[#E5EAF2] flex flex-col z-20 shrink-0">
        <div className="h-[72px] px-6 flex items-center border-b border-[#E5EAF2]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-[#3B82F6] rounded-[10px] flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <span className="font-semibold text-xl tracking-tight text-[#1E293B]">Aura HR</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Workspace</p>
          {[
            { name: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { name: "Directory", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
            { name: "Projects", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
            { name: "Time & Leave", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { name: "Payroll", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
          ].map(item => {
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all relative ${
                  isActive 
                    ? "bg-[#DBEAFE]/50 text-[#1E293B]" 
                    : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#1E293B]"
                }`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#3B82F6] rounded-r-md"></div>}
                <svg className={`w-5 h-5 ${isActive ? "text-[#1E293B]" : "text-[#94A3B8]"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                </svg>
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#E5EAF2]">
          <div className="flex items-center gap-3">
            <img className="h-10 w-10 rounded-[10px] object-cover border border-[#E5EAF2]" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120" alt="Profile" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-[#1E293B] truncate">Diana Sterling</p>
              <p className="text-xs text-[#64748B] truncate">HR Operations</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* NAVBAR: Clean, white, spacious */}
        <header className="h-[72px] bg-[#FFFFFF] border-b border-[#E5EAF2] px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#64748B] font-medium">Workspace</span>
            <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            <span className="text-[#1E293B] font-medium">{activeMenu}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-72">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input 
                type="text" 
                placeholder="Search resources..."
                className="w-full bg-[#F5F7FB] border-none text-[#1E293B] placeholder-[#94A3B8] text-sm rounded-[10px] pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#DBEAFE] focus:outline-none transition-shadow"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-[10px] transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full border border-white"></span>
              </button>
              <button className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-[10px] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
              </button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT: Spacious padding, organized layout */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#1E293B]">Employee Projects</h1>
              <p className="text-sm text-[#64748B] mt-1">Manage cross-functional initiatives and deliverables.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name..."
                  className="bg-[#FFFFFF] border border-[#E5EAF2] text-[#1E293B] text-sm rounded-[10px] pl-9 pr-3 py-2 w-48 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all"
                />
              </div>
              <button className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E5EAF2] text-[#1E293B] text-sm font-medium py-2 px-3.5 rounded-[10px] hover:bg-[#F5F7FB] transition-colors">
                <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                Filters
              </button>
              <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium py-2 px-4 rounded-[10px] shadow-sm transition-colors">
                New Project
              </button>
            </div>
          </div>

          {/* SUMMARY CARDS: Clean white, thin borders, clear typography */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Active Projects", value: "12", trend: "+2 this week", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
              { label: "Tasks Assigned", value: "34", trend: "18 completed", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { label: "Upcoming Deadlines", value: "4", trend: "Within 7 days", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Avg Progress", value: "62%", trend: "+5% vs last month", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" }
            ].map((metric, idx) => (
              <div key={idx} className="bg-[#FFFFFF] p-6 rounded-[14px] border border-[#E5EAF2] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-[#64748B] font-medium">{metric.label}</p>
                  <div className="p-1.5 bg-[#F5F7FB] rounded-lg">
                    <svg className="w-4 h-4 text-[#1E293B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={metric.icon}/></svg>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-semibold text-[#1E293B] leading-none">{metric.value}</h3>
                  <p className="text-xs text-[#94A3B8] mt-2 font-medium">{metric.trend}</p>
                </div>
              </div>
            ))}
          </div>

          {/* MAIN GRID: Projects/Tasks List (Left) & Context Panel (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN (Span 8) */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* ASSIGNED PROJECTS TABLE */}
              <div className="bg-[#FFFFFF] border border-[#E5EAF2] rounded-[14px] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E5EAF2] flex items-center justify-between bg-[#FFFFFF]">
                  <h2 className="text-base font-semibold text-[#1E293B]">Assigned Projects</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5EAF2] bg-[#F5F7FB]">
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider w-1/3">Project</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Lead</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Progress</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-right">Deadline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EAF2]">
                      {PROJECTS.map(proj => {
                        const isSelected = selectedProjectId === proj.id;
                        return (
                          <tr 
                            key={proj.id} 
                            onClick={() => setSelectedProjectId(proj.id)}
                            className={`cursor-pointer transition-colors ${isSelected ? "bg-[#DBEAFE]/20" : "hover:bg-[#F5F7FB]"}`}
                          >
                            <td className="py-4 px-6">
                              <p className="text-sm font-medium text-[#1E293B]">{proj.name}</p>
                              <p className="text-xs text-[#64748B] mt-0.5">{proj.department}</p>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <img src={proj.leadAvatar} alt="Lead" className="w-6 h-6 rounded-full object-cover border border-[#E5EAF2]" />
                                <span className="text-sm text-[#64748B]">{proj.lead}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                proj.status === 'Completed' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' :
                                proj.status === 'In Progress' ? 'bg-[#3B82F6]/10 text-[#1E293B] border-[#3B82F6]/20' :
                                proj.status === 'At Risk' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                                'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                              }`}>
                                {proj.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-1.5 bg-[#E5EAF2] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#3B82F6]" style={{ width: `${proj.progress}%` }}></div>
                                </div>
                                <span className="text-xs text-[#64748B] font-medium w-6">{proj.progress}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right text-sm text-[#64748B] whitespace-nowrap">
                              {proj.deadline}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MY TASKS TABLE */}
              <div className="bg-[#FFFFFF] border border-[#E5EAF2] rounded-[14px] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E5EAF2] flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#1E293B]">My Tasks</h2>
                  <button className="text-sm font-medium text-[#1E293B] hover:text-[#2563EB]">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5EAF2] bg-[#F5F7FB]">
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Task</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Project</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Priority</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-right">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EAF2]">
                      {tasks.map(task => (
                        <tr key={task.id} className="hover:bg-[#F5F7FB] transition-colors">
                          <td className="py-4 px-6">
                            <p className="text-sm font-medium text-[#1E293B] cursor-pointer hover:text-[#1E293B] transition-colors">{task.name}</p>
                          </td>
                          <td className="py-4 px-6 text-sm text-[#64748B]">{task.project}</td>
                          <td className="py-4 px-6">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                              task.priority === 'Critical' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                              task.priority === 'High' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' :
                              'bg-[#64748B]/10 text-[#64748B] border-[#E5EAF2]'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                             <button 
                              onClick={() => handleTaskStatusToggle(task.id)}
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all ${
                                task.status === 'Completed' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' :
                                task.status === 'In Progress' ? 'bg-[#3B82F6]/10 text-[#1E293B] border-[#3B82F6]/20' :
                                'bg-[#F5F7FB] text-[#64748B] border-[#E5EAF2] hover:bg-[#E5EAF2]'
                              }`}
                            >
                              {task.status}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-right text-sm text-[#64748B] whitespace-nowrap">{task.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (Span 4) - PROJECT DETAILS PANEL */}
            <div className="xl:col-span-4 bg-[#FFFFFF] border border-[#E5EAF2] rounded-[14px] flex flex-col sticky top-8 max-h-[calc(100vh-136px)] overflow-hidden">
              {activeProject && (
                <>
                  {/* Panel Header */}
                  <div className="p-6 border-b border-[#E5EAF2]">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        activeProject.status === 'Completed' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' :
                        activeProject.status === 'In Progress' ? 'bg-[#3B82F6]/10 text-[#1E293B] border-[#3B82F6]/20' :
                        activeProject.status === 'At Risk' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                        'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                      }`}>
                        {activeProject.status}
                      </span>
                      <span className="text-xs text-[#94A3B8] font-medium">{activeProject.id}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-[#1E293B] leading-tight mb-2">{activeProject.name}</h2>
                    <p className="text-sm text-[#64748B] leading-relaxed">{activeProject.description}</p>
                  </div>

                  {/* Context Navigation Tabs */}
                  <div className="flex border-b border-[#E5EAF2] px-2 bg-[#F5F7FB]">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "team", label: "Team" },
                      { id: "files", label: "Files" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                          activeTab === tab.id 
                            ? "border-[#3B82F6] text-[#1E293B]" 
                            : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Panel Content Area (Scrollable) */}
                  <div className="p-6 overflow-y-auto flex-1 bg-[#FFFFFF]">
                    
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-6 p-4 rounded-[10px] border border-[#E5EAF2] bg-[#F5F7FB]">
                          <div>
                            <span className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Progress</span>
                            <span className="block text-lg font-semibold text-[#1E293B] mt-1">{activeProject.progress}%</span>
                          </div>
                          <div className="w-px h-8 bg-[#E5EAF2]"></div>
                          <div>
                            <span className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Deadline</span>
                            <span className="block text-sm font-medium text-[#1E293B] mt-1">{activeProject.deadline}</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-[#1E293B] mb-4">Milestones</h3>
                          <div className="space-y-4">
                            {activeProject.milestones.map((ms, idx) => (
                              <div key={ms.id} className="relative pl-6">
                                {/* Timeline line connecting markers */}
                                {idx !== activeProject.milestones.length - 1 && (
                                  <div className="absolute left-2 top-4 bottom-[-16px] w-px bg-[#E5EAF2]"></div>
                                )}
                                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${ms.completed ? 'border-[#22C55E]' : 'border-[#E5EAF2]'}`}>
                                  {ms.completed && <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>}
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${ms.completed ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>{ms.title}</p>
                                  <p className="text-xs text-[#94A3B8] mt-0.5">{ms.date}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "team" && (
                      <div className="space-y-4">
                        {activeProject.team.map((member, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-[10px] border border-[#E5EAF2] hover:border-[#3B82F6]/30 hover:bg-[#F5F7FB] transition-colors cursor-pointer">
                            <img src={member.img} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="text-sm font-medium text-[#1E293B]">{member.name}</p>
                              <p className="text-xs text-[#64748B]">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "files" && (
                      <div className="space-y-3">
                        {activeProject.files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-[10px] border border-[#E5EAF2] hover:bg-[#F5F7FB] transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 bg-[#DBEAFE]/50 rounded-lg text-[#1E293B]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-medium text-[#1E293B] truncate">{file.name}</p>
                                <p className="text-[11px] text-[#64748B]">{file.size}</p>
                              </div>
                            </div>
                            <button className="text-[#94A3B8] opacity-0 group-hover:opacity-100 hover:text-[#1E293B] transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}