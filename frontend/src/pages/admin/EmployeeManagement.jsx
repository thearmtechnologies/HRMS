import React, { useState } from "react";
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Edit,
  FileText,
  Filter,
  FolderKanban,
  GraduationCap,
  History,
  Key,
  Mail,
  MapPin,
  MoreVertical,
  Network,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";

// --- MOCK DATA ---
const EMPLOYEES = [
  {
    id: "EMP001",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@armhrms.com",
    phone: "+91 98765 43210",
    department: "Information Technology",
    designation: "Senior Frontend Engineer",
    type: "Full-Time",
    joiningDate: "15 Jan 2023",
    status: "Active",
    gender: "Male",
    dob: "12 Aug 1990",
    maritalStatus: "Single",
    nationality: "Indian",
    address: { current: "Andheri West, Mumbai", permanent: "Pune, Maharashtra" },
    emergency: { name: "Robert Smith", relation: "Father", phone: "+91 98765 00000" },
    manager: "Kaustubh Pawar",
    location: "Mumbai HQ",
    projects: [
      { name: "HRMS Development", role: "Lead Developer", status: "Active", start: "01 Jun 2025" },
      { name: "Internal Portal", role: "Reviewer", status: "Completed", start: "15 Jan 2024" }
    ],
    documents: [
      { name: "Resume_Updated.pdf", type: "Resume" },
      { name: "Offer_Letter.pdf", type: "Contract" },
      { name: "PAN_Card.jpg", type: "ID Proof" }
    ],
    skills: ["React", "JavaScript", "Tailwind CSS", "Node.js"],
    system: { username: "jsmith", role: "Employee", lastLogin: "Today, 09:15 AM", status: "Active" },
    timeline: [
      { date: "15 Jan 2023", event: "Joined Company as Frontend Engineer" },
      { date: "01 Mar 2024", event: "Promoted to Senior Frontend Engineer" },
      { date: "01 Jun 2025", event: "Assigned as Lead to HRMS Development" }
    ]
  },
  {
    id: "EMP002",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@armhrms.com",
    phone: "+91 98765 11111",
    department: "Human Resources",
    designation: "HR Executive",
    type: "Full-Time",
    joiningDate: "01 Mar 2026",
    status: "Probation",
    gender: "Female",
    dob: "25 Nov 1995",
    maritalStatus: "Married",
    nationality: "Indian",
    address: { current: "Bandra, Mumbai", permanent: "Bandra, Mumbai" },
    emergency: { name: "Mike Johnson", relation: "Spouse", phone: "+91 98765 22222" },
    manager: "Emily Chen",
    location: "Mumbai HQ",
    projects: [
      { name: "Q3 Hiring Drive", role: "Coordinator", status: "Active", start: "01 Apr 2026" }
    ],
    documents: [
      { name: "Resume_Sarah.pdf", type: "Resume" },
      { name: "Aadhaar_Card.pdf", type: "ID Proof" }
    ],
    skills: ["Recruitment", "Employee Relations", "Communication"],
    system: { username: "sjohnson", role: "HR User", lastLogin: "Today, 08:45 AM", status: "Active" },
    timeline: [
      { date: "01 Mar 2026", event: "Joined Company as HR Executive (Probation)" },
      { date: "01 Apr 2026", event: "Assigned to Q3 Hiring Drive" }
    ]
  },
  {
    id: "EMP003",
    firstName: "David",
    lastName: "Wilson",
    email: "david.w@armhrms.com",
    phone: "+91 98765 33333",
    department: "Finance",
    designation: "Financial Analyst",
    type: "Contract",
    joiningDate: "10 May 2024",
    status: "Resigned",
    gender: "Male",
    dob: "05 Jul 1988",
    maritalStatus: "Single",
    nationality: "Indian",
    address: { current: "Delhi Branch Area", permanent: "Delhi" },
    emergency: { name: "Susan Wilson", relation: "Mother", phone: "+91 98765 44444" },
    manager: "Michael Chang",
    location: "Delhi Branch",
    projects: [
      { name: "Annual Audit 2025", role: "Analyst", status: "Completed", start: "10 Jan 2025" }
    ],
    documents: [
      { name: "Contract_Agreement.pdf", type: "Contract" },
      { name: "Resignation_Letter.pdf", type: "Official" }
    ],
    skills: ["Excel", "Financial Modeling", "Taxation"],
    system: { username: "dwilson", role: "Employee", lastLogin: "Yesterday, 05:30 PM", status: "Suspended Pending Exit" },
    timeline: [
      { date: "10 May 2024", event: "Joined Company as Financial Analyst" },
      { date: "15 May 2026", event: "Submitted Resignation" }
    ]
  }
];

// --- REUSABLE COMPONENTS ---
const Card = ({ children, className = "", noPadding = false }) => (
  <div className={`bg-[#fdfdfe] rounded-xl border border-[#d6d9df] shadow-sm overflow-hidden ${className}`}>
    <div className={noPadding ? "" : "p-5"}>{children}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    "Active": "bg-[#3B82F6]/10 text-[#1E293B] border border-[#3B82F6]/20",
    "Probation": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "Notice Period": "bg-orange-100 text-orange-700 border border-orange-200",
    "Resigned": "bg-red-100 text-red-700 border border-red-200",
    "Terminated": "bg-red-100 text-red-800 border border-red-300",
    "Inactive": "bg-[#f0f3f5] text-[#8f9192] border border-[#d6d9df]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || styles["Inactive"]}`}>
      {status}
    </span>
  );
};

const SectionHeader = ({ title, icon: Icon, action }) => (
  <div className="flex items-center justify-between mb-4 border-b border-[#d6d9df] pb-2">
    <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
      {Icon && <Icon size={16} />} {title}
    </h3>
    {action && action}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-1">
    <span className="text-sm text-[#bdc2c7] w-1/3">{label}</span>
    <span className="text-sm font-semibold text-[#8f9192] text-right w-2/3">{value || "-"}</span>
  </div>
);

// --- MAIN COMPONENT ---
export default function EmployeeManagement() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8 pb-12 font-sans text-[#8f9192] relative">
      
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Employee Management</h1>
          <p className="text-sm mt-1">Manage all organizational employee records and statuses</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#8f9192] rounded-lg text-sm font-semibold hover:bg-[#f0f3f5] transition-all shadow-sm">
            <Upload size={16} /> Import
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#8f9192] rounded-lg text-sm font-semibold hover:bg-[#f0f3f5] transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-[#fdfdfe] rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all shadow-sm">
            <UserPlus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: "Total Employees", value: "245", icon: Users, color: "text-[#1E293B]" },
          { title: "Active", value: "218", icon: UserCheck, color: "text-[#1E293B]" },
          { title: "New Hires", value: "12", icon: UserPlus, color: "text-[#1E293B]" },
          { title: "Probation", value: "8", icon: Clock, color: "text-yellow-600" },
          { title: "Resigned", value: "5", icon: UserMinus, color: "text-red-600" },
          { title: "Inactive", value: "2", icon: UserX, color: "text-[#8f9192]" },
        ].map((stat, idx) => (
          <Card key={idx} className="p-4 flex flex-col justify-center items-center text-center hover:border-[#bdc2c7] transition-colors">
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-[#1E293B] leading-none mb-1">{stat.value}</p>
            <p className="text-xs font-medium text-[#bdc2c7] uppercase tracking-wider">{stat.title}</p>
          </Card>
        ))}
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#fdfdfe] p-4 rounded-xl border border-[#d6d9df] shadow-sm">
        <div className="relative w-full lg:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#bdc2c7] group-focus-within:text-[#1E293B]" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, Name, Email, or Phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm focus:outline-none focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all placeholder:text-[#bdc2c7]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {["Department", "Designation", "Status", "Location"].map((filter) => (
            <select key={filter} className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#8f9192] focus:outline-none focus:border-[#3B82F6] flex-1 lg:flex-none">
              <option>{filter}</option>
            </select>
          ))}
          <button className="p-2 bg-[#f0f3f5] text-[#8f9192] rounded-lg hover:bg-[#d6d9df] transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* 4. EMPLOYEE DIRECTORY TABLE */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#f0f3f5] border-b border-[#d6d9df] text-[#8f9192] text-xs uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Employee</th>
                <th className="px-5 py-4 font-semibold">ID</th>
                <th className="px-5 py-4 font-semibold">Department & Role</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Joining Date</th>
                <th className="px-5 py-4 font-semibold text-center">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6d9df] text-sm">
              {EMPLOYEES.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#3B82F6] text-[#fdfdfe] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1E293B]">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-[#bdc2c7]">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#8f9192]">{emp.id}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#1E293B]">{emp.department}</p>
                    <p className="text-xs text-[#bdc2c7]">{emp.designation}</p>
                  </td>
                  <td className="px-5 py-3">{emp.type}</td>
                  <td className="px-5 py-3">{emp.joiningDate}</td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="px-3 py-1.5 bg-[#f0f3f5] text-[#1E293B] text-xs font-bold rounded hover:bg-[#d6d9df] transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. EMPLOYEE PROFILE DRAWER */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#3B82F6]/20 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedEmployee(null)}
          ></div>
          
          {/* Drawer Panel */}
          <div className="w-full max-w-4xl bg-[#f0f3f5] h-full shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header (Sticky) */}
            <div className="shrink-0 bg-[#fdfdfe] border-b border-[#d6d9df] p-6 flex items-start justify-between z-20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3B82F6] text-[#fdfdfe] flex items-center justify-center font-bold text-xl shadow-md">
                  {selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-[#1E293B]">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                    <StatusBadge status={selectedEmployee.status} />
                  </div>
                  <p className="text-sm text-[#8f9192]">{selectedEmployee.designation} • {selectedEmployee.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-[#bdc2c7] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-lg transition-colors">
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="p-2 text-[#bdc2c7] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: Static Info */}
                <div className="space-y-6">
                  
                  <Card>
                    <SectionHeader title="Personal Information" icon={User} />
                    <div className="space-y-2">
                      <InfoRow label="Full Name" value={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`} />
                      <InfoRow label="Employee ID" value={selectedEmployee.id} />
                      <InfoRow label="Gender" value={selectedEmployee.gender} />
                      <InfoRow label="Date of Birth" value={selectedEmployee.dob} />
                      <InfoRow label="Marital Status" value={selectedEmployee.maritalStatus} />
                      <InfoRow label="Nationality" value={selectedEmployee.nationality} />
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader title="Contact Information" icon={Phone} />
                    <div className="space-y-2">
                      <InfoRow label="Email Address" value={selectedEmployee.email} />
                      <InfoRow label="Phone Number" value={selectedEmployee.phone} />
                      <div className="py-2 mt-2 border-t border-[#f0f3f5]">
                        <p className="text-xs font-bold text-[#bdc2c7] uppercase mb-1">Current Address</p>
                        <p className="text-sm font-semibold text-[#8f9192]">{selectedEmployee.address.current}</p>
                      </div>
                      <div className="py-2">
                        <p className="text-xs font-bold text-[#bdc2c7] uppercase mb-1">Emergency Contact</p>
                        <p className="text-sm font-semibold text-[#8f9192]">{selectedEmployee.emergency.name} ({selectedEmployee.emergency.relation})</p>
                        <p className="text-sm text-[#8f9192]">{selectedEmployee.emergency.phone}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader title="Skills & Qualifications" icon={GraduationCap} />
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.skills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#f0f3f5] text-[#1E293B] border border-[#d6d9df] rounded-md text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader 
                      title="Documents" 
                      icon={FileText} 
                      action={<button className="text-[#1E293B] hover:bg-[#f0f3f5] p-1 rounded"><Plus size={16}/></button>}
                    />
                    <div className="space-y-2">
                      {selectedEmployee.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-[#f0f3f5] rounded-lg border border-transparent hover:border-[#d6d9df] transition-colors group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-[#bdc2c7]" />
                            <div>
                              <p className="text-sm font-bold text-[#1E293B] leading-none mb-1">{doc.name}</p>
                              <p className="text-xs text-[#8f9192]">{doc.type}</p>
                            </div>
                          </div>
                          <Download size={14} className="text-[#8f9192] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>

                {/* RIGHT COLUMN: Organizational & Dynamic Info */}
                <div className="space-y-6">
                  
                  <Card className="border-[#3B82F6]/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                    <SectionHeader title="Employment Status Controls" icon={Briefcase} />
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between bg-[#f0f3f5] p-3 rounded-lg">
                        <span className="text-sm font-bold text-[#8f9192]">Current Status</span>
                        <StatusBadge status={selectedEmployee.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#1E293B] text-xs font-bold rounded-lg hover:border-[#3B82F6] transition-colors">Promote / Transfer</button>
                        <button className="px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-orange-600 text-xs font-bold rounded-lg hover:border-orange-600 transition-colors">Set Notice Period</button>
                        <button className="px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#8f9192] text-xs font-bold rounded-lg hover:border-[#8f9192] transition-colors">Deactivate</button>
                        <button className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors">Terminate</button>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader 
                      title="Department Assignment" 
                      icon={Network} 
                      action={<button className="text-xs font-bold text-[#1E293B] hover:underline">Transfer</button>}
                    />
                    <div className="space-y-2">
                      <InfoRow label="Department" value={selectedEmployee.department} />
                      <InfoRow label="Designation" value={selectedEmployee.designation} />
                      <InfoRow label="Employment Type" value={selectedEmployee.type} />
                      <InfoRow label="Joining Date" value={selectedEmployee.joiningDate} />
                      <InfoRow label="Work Location" value={selectedEmployee.location} />
                      <div className="mt-3 pt-3 border-t border-[#f0f3f5] flex items-center justify-between">
                        <span className="text-sm text-[#bdc2c7]">Reporting Manager</span>
                        <span className="text-sm font-bold text-[#1E293B] bg-[#3B82F6]/10 px-2 py-1 rounded">{selectedEmployee.manager}</span>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader title="Project Assignments" icon={FolderKanban} />
                    <div className="space-y-3">
                      {selectedEmployee.projects.map((proj, i) => (
                        <div key={i} className="flex flex-col p-3 bg-[#f0f3f5] rounded-lg border border-[#d6d9df]">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-[#1E293B]">{proj.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${proj.status === 'Active' ? 'bg-[#3B82F6]/10 text-[#1E293B]' : 'bg-[#d6d9df] text-[#8f9192]'}`}>{proj.status}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-[#8f9192]">
                            <span>Role: <span className="font-semibold">{proj.role}</span></span>
                            <span>Since: {proj.start}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader title="System Access" icon={Key} />
                    <div className="space-y-2">
                      <InfoRow label="Username" value={selectedEmployee.system.username} />
                      <InfoRow label="System Role" value={selectedEmployee.system.role} />
                      <InfoRow label="Last Login" value={selectedEmployee.system.lastLogin} />
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-[#bdc2c7]">Account Status</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${selectedEmployee.system.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedEmployee.system.status}</span>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader title="Employee Timeline" icon={History} />
                    <div className="relative border-l-2 border-[#d6d9df] ml-2 space-y-5 mt-2">
                      {selectedEmployee.timeline.map((item, idx) => (
                        <div key={idx} className="relative pl-5">
                          <div className="absolute w-2.5 h-2.5 bg-[#3B82F6] rounded-full -left-[6px] top-1.5 shadow-[0_0_0_3px_#fdfdfe]"></div>
                          <p className="text-xs font-bold text-[#bdc2c7] mb-0.5">{item.date}</p>
                          <p className="text-sm font-medium text-[#8f9192]">{item.event}</p>
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