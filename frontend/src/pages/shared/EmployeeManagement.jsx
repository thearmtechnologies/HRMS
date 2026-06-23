import React, { useState, useEffect } from "react";
import EmployeeForm from "../../components/employee/EmployeeForm";
import EmployeeModal from "../../components/employee/EmployeeModal";
import CredentialsModal from "../../components/employee/CredentialsModal";
import SalaryStructureModal from "../../components/employee/SalaryStructureModal";
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
  IndianRupee,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalMode, setModalMode] = useState(null); // null, 'create', 'view', 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [credentialsData, setCredentialsData] = useState(null);

  // Salary modal state
  const [salaryEmployee, setSalaryEmployee] = useState(null);

  // Post-creation salary prompt state
  const [newlyCreatedEmployee, setNewlyCreatedEmployee] = useState(null);

  // Salary status map — loaded via single API call
  const [salaryStatusMap, setSalaryStatusMap] = useState({});

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setModalMode('create');
  };

  const handleOpenView = (emp) => {
    setSelectedEmployee(emp);
    setModalMode('view');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedEmployee(null);
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchSalaryStatuses();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employee", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/department", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Single API call to fetch all salary records and build a lookup map
  const fetchSalaryStatuses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pay/all-salary-records", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        if (Array.isArray(data)) {
          data.forEach(record => {
            // employeeId could be populated object or string
            const empId = typeof record.employeeId === 'object' ? record.employeeId._id : record.employeeId;
            if (empId) {
              map[empId] = {
                grossMonthly: record.grossMonthly,
                inHandMonthly: record.inHandMonthly,
              };
            }
          });
        }
        setSalaryStatusMap(map);
      }
    } catch (err) {
      console.error('Error fetching salary statuses:', err);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (emp.employeeName || "").toLowerCase().includes(q) ||
      (emp.employeeId || "").toLowerCase().includes(q) ||
      (emp.email || "").toLowerCase().includes(q) ||
      (emp.mobile || "").toLowerCase().includes(q) ||
      (emp.designation || "").toLowerCase().includes(q);
      
    const matchesDept = filterDepartment === "" || (emp.department?.departmentName === filterDepartment);
    const matchesDesignation = filterDesignation === "" || emp.designation === filterDesignation;
    const matchesStatus = filterStatus === "" || (emp.status || "Active") === filterStatus;
    const matchesLocation = filterLocation === "" || emp.site === filterLocation;

    return matchesSearch && matchesDept && matchesDesignation && matchesStatus && matchesLocation;
  });

  const uniqueDesignations = [...new Set(employees.map(e => e.designation).filter(Boolean))];
  const uniqueLocations = [...new Set(employees.map(e => e.site).filter(Boolean))];

  const formatINR = (amount) => {
    if (!amount && amount !== 0) return '—';
    return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

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
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-opacity-90 text-[#fdfdfe] font-bold rounded-lg shadow-sm transition-all"
          >
            <UserPlus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* 2. OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: "Total Employees", value: employees.length, icon: Users, color: "text-[#1E293B]" },
          { title: "Active", value: employees.filter(e => (e.status || "Active") === "Active").length, icon: UserCheck, color: "text-[#1E293B]" },
          { title: "Salary Assigned", value: Object.keys(salaryStatusMap).length, icon: IndianRupee, color: "text-green-600" },
          { title: "Salary Missing", value: Math.max(0, employees.filter(e => (e.status || "Active") === "Active").length - Object.keys(salaryStatusMap).length), icon: IndianRupee, color: "text-orange-500" },
          { title: "Resigned", value: employees.filter(e => e.status === "Resigned").length, icon: UserMinus, color: "text-red-600" },
          { title: "Terminated", value: employees.filter(e => e.status === "Terminated").length, icon: UserX, color: "text-[#8f9192]" },
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
          <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#8f9192] focus:outline-none focus:border-[#3B82F6] flex-1 lg:flex-none">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d.departmentName}>{d.departmentName}</option>)}
          </select>
          <select value={filterDesignation} onChange={e => setFilterDesignation(e.target.value)} className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#8f9192] focus:outline-none focus:border-[#3B82F6] flex-1 lg:flex-none">
            <option value="">All Designations</option>
            {uniqueDesignations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#8f9192] focus:outline-none focus:border-[#3B82F6] flex-1 lg:flex-none">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>
          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-[#8f9192] focus:outline-none focus:border-[#3B82F6] flex-1 lg:flex-none">
            <option value="">All Locations</option>
            {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button className="p-2 bg-[#f0f3f5] text-[#8f9192] rounded-lg hover:bg-[#d6d9df] transition-colors" onClick={() => { setSearchQuery(""); setFilterDepartment(""); setFilterDesignation(""); setFilterStatus(""); setFilterLocation(""); }}>
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
                <th className="px-5 py-4 font-semibold text-center">Salary</th>
                <th className="px-5 py-4 font-semibold text-center">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6d9df] text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-[#8f9192]">Loading employees...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-[#8f9192]">No employees found.</td>
                </tr>
              ) : filteredEmployees.map((emp) => {
                const hasSalary = !!salaryStatusMap[emp._id];
                return (
                <tr key={emp._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#3B82F6] text-[#fdfdfe] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm overflow-hidden">
                        {emp.url ? <img src={emp.url} alt={emp.employeeName} className="w-full h-full object-cover" /> : (emp.employeeName ? emp.employeeName.charAt(0) : "U")}
                      </div>
                      <div>
                        <p className="font-bold text-[#1E293B]">{emp.employeeName}</p>
                        <p className="text-xs text-[#bdc2c7]">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#8f9192]">{emp.employeeId || emp.tradeId}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#1E293B]">{emp.department ? emp.department.departmentName : 'Unassigned'}</p>
                    <p className="text-xs text-[#bdc2c7]">{emp.designation || 'No designation'}</p>
                  </td>
                  <td className="px-5 py-3">Full-Time</td>
                  <td className="px-5 py-3 text-center">
                    {hasSalary ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={12} /> {formatINR(salaryStatusMap[emp._id].grossMonthly)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
                        ⚠️ Not Assigned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge status={emp.status || "Active"} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenView(emp)}
                        className="px-3 py-1.5 bg-[#f0f3f5] text-[#1E293B] text-xs font-bold rounded hover:bg-[#d6d9df] transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => setSalaryEmployee(emp)}
                        className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                          hasSalary
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                            : 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 hover:bg-[#3B82F6]/20'
                        }`}
                      >
                        <IndianRupee size={12} className="inline -mt-0.5 mr-0.5" />
                        {hasSalary ? 'Edit Salary' : 'Assign Salary'}
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <EmployeeModal 
        isOpen={!!modalMode} 
        onClose={handleCloseModal}
        title={modalMode === 'create' ? "Register New Employee" : modalMode === 'view' ? "Employee Profile" : "Edit Employee"}
        description={modalMode === 'create' ? "Create an account and profile for a new hire." : ""}
      >
        <EmployeeForm 
          mode={modalMode} 
          initialData={selectedEmployee}
          departments={departments}
          onSuccess={(responseData) => {
            fetchEmployees();
            handleCloseModal();
            // Show credentials modal only on create
            if (modalMode === 'create' && responseData?.tempPassword) {
              setCredentialsData({
                employeeId: responseData.employee?.employeeId,
                employeeName: responseData.employee?.employeeName,
                email: responseData.employee?.email,
                tempPassword: responseData.tempPassword,
              });
              // Store newly created employee for post-creation salary prompt
              setNewlyCreatedEmployee(responseData.employee);
            }
          }}
          onClose={handleCloseModal}
        />
      </EmployeeModal>

      {/* Credentials Success Modal — Enhanced with "Assign Salary Now?" prompt */}
      {credentialsData && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => { setCredentialsData(null); setNewlyCreatedEmployee(null); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-xl w-full max-w-md p-6 space-y-5">

              <div className="text-center">
                <div className="w-14 h-14 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B]">Employee Created!</h3>
                <p className="text-sm text-[#8f9192] mt-1">Account credentials have been generated.</p>
              </div>

              <div className="bg-[#f0f3f5] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8f9192]">Employee ID</span>
                  <span className="font-bold text-[#1E293B]">{credentialsData.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f9192]">Name</span>
                  <span className="font-bold text-[#1E293B]">{credentialsData.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f9192]">Email</span>
                  <span className="font-bold text-[#1E293B]">{credentialsData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f9192]">Temp Password</span>
                  <span className="font-bold text-[#1E293B] font-mono">{credentialsData.tempPassword}</span>
                </div>
              </div>

              {/* Post-creation salary prompt */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-bold text-blue-800 mb-1">
                  <IndianRupee size={14} className="inline -mt-0.5 mr-1" />
                  Assign Salary Structure?
                </p>
                <p className="text-xs text-blue-600">Set up the compensation package now so payroll can be generated for this employee.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setCredentialsData(null); setNewlyCreatedEmployee(null); }}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#8f9192] bg-[#f0f3f5] rounded-xl hover:bg-[#d6d9df] transition-colors"
                >
                  Skip for Now
                </button>
                <button
                  onClick={() => {
                    const empForSalary = newlyCreatedEmployee;
                    setCredentialsData(null);
                    setNewlyCreatedEmployee(null);
                    if (empForSalary) {
                      // Refresh employees to get the full object with _id
                      fetchEmployees().then(() => {
                        // Find the newly created employee by employeeId
                        setSalaryEmployee(empForSalary);
                      });
                    }
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] transition-colors"
                >
                  <IndianRupee size={14} className="inline -mt-0.5 mr-1" />
                  Assign Salary Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Salary Structure Modal */}
      <SalaryStructureModal
        isOpen={!!salaryEmployee}
        onClose={() => setSalaryEmployee(null)}
        employee={salaryEmployee}
        onSaved={() => {
          fetchSalaryStatuses();
        }}
      />

    </div>
  );
}
