import React, { useState, useEffect, useContext } from "react";
import EmployeeForm from "../../components/employee/EmployeeForm";
import EmployeeModal from "../../components/employee/EmployeeModal";
import CredentialsModal from "../../components/employee/CredentialsModal";
import SalaryStructureModal from "../../components/employee/SalaryStructureModal";
import EmployeeQuickSettingsModal from "../../components/employee/EmployeeQuickSettingsModal";
import shiftService from "../../services/shiftService";
import { useNavigate } from "react-router-dom";
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
  Settings,
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
    "Active": "bg-[#3B82F6]/10 text-[#1E293B] border border-[#3B82F6]/20",
    "Probation": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "Notice Period": "bg-orange-100 text-orange-700 border border-orange-200",
    "Resigned": "bg-red-100 text-red-700 border border-red-200",
    "Terminated": "bg-red-100 text-red-800 border border-red-300",
    "Inactive": "bg-slate-100 text-slate-700 border border-slate-300",
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
  <div className="flex justify-between items-start py-1.5 border-b border-slate-100 last:border-0">
    <span className="text-sm font-medium text-slate-600 w-1/3">{label}</span>
    <span className="text-sm font-bold text-slate-800 text-right w-2/3">{value || "-"}</span>
  </div>
);

const getEmployeeDisplayName = (emp) => {
  if (!emp) return "Unknown";
  return emp.employeeName || emp.fullName || (emp.firstName || emp.lastName ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : emp.name || "Unknown");
};

// --- MAIN COMPONENT ---
export default function EmployeeManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalMode, setModalMode] = useState(null); // null, 'create', 'view', 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [credentialsData, setCredentialsData] = useState(null);

  // Salary modal state
  const [salaryEmployee, setSalaryEmployee] = useState(null);
  const [settingsEmployee, setSettingsEmployee] = useState(null);

  // Post-creation salary prompt state
  const [newlyCreatedEmployee, setNewlyCreatedEmployee] = useState(null);

  // Salary status map — loaded via single API call
  const [salaryStatusMap, setSalaryStatusMap] = useState({});
  const { hasPermission } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setModalMode('create');
  };

  const handleOpenView = (emp) => {
    navigate(`/hrms/employees/${emp._id}`);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedEmployee(null);
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchSalaryStatuses();
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const data = await shiftService.getShifts();
      setAvailableShifts(data || []);
    } catch (e) {
      console.error('Error fetching shifts', e);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employee", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setEmployees(list);
      return list;
    } catch (err) {
      console.error(err);
      return [];
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
            // employeeId could be populated object, null, or string
            const empId = record?.employeeId?._id || record?.employeeId || record?.employee?._id || record?.employee;
            if (empId && typeof empId === 'string') {
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
      getEmployeeDisplayName(emp).toLowerCase().includes(q) ||
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
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 font-sans text-slate-700 relative">
      
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Employee Management</h1>
          <p className="text-sm mt-1 text-slate-600 font-medium">Manage all organizational employee records and statuses</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasPermission('employee_management', 'create') && (
            <button className="flex items-center gap-2 px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-slate-700 rounded-lg text-sm font-semibold hover:bg-[#f0f3f5] hover:text-[#1E293B] transition-all shadow-sm">
              <Upload size={16} /> Import
            </button>
          )}
          {hasPermission('employee_management', 'export') && (
            <button className="flex items-center gap-2 px-3 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-slate-700 rounded-lg text-sm font-semibold hover:bg-[#f0f3f5] hover:text-[#1E293B] transition-all shadow-sm">
              <Download size={16} /> Export
            </button>
          )}
          {hasPermission('employee_management', 'create') && (
            <button 
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-opacity-90 text-[#fdfdfe] font-bold rounded-lg shadow-sm transition-all"
            >
              <UserPlus size={16} /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* 2. OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        <StatCard title="Total Employees" value={employees.length} icon={Users} colorClass="bg-slate-100 text-[#1E293B]" />
        <StatCard title="Active Employees" value={employees.filter(e => (e.status || "Active") === "Active").length} icon={UserCheck} colorClass="bg-emerald-50 text-emerald-600" />
        <StatCard title="Salary Assigned" value={Object.keys(salaryStatusMap).length} icon={IndianRupee} colorClass="bg-blue-50 text-blue-600" />
        <StatCard title="Salary Missing" value={Math.max(0, employees.filter(e => (e.status || "Active") === "Active").length - Object.keys(salaryStatusMap).length)} icon={IndianRupee} colorClass="bg-amber-50 text-amber-600" />
        <StatCard title="Resigned" value={employees.filter(e => e.status === "Resigned").length} icon={UserMinus} colorClass="bg-red-50 text-red-600" />
        <StatCard title="Terminated" value={employees.filter(e => e.status === "Terminated").length} icon={UserX} colorClass="bg-slate-200 text-slate-700" />
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#fdfdfe] p-4 rounded-xl border border-[#d6d9df] shadow-sm">
        <div className="relative w-full lg:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#1E293B]" />
          </div>
          <input
            id="searchEmployees"
            name="searchEmployees"
            aria-label="Search Employees"
            type="text"
            placeholder="Search by ID, Name, Email, or Phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select id="filterDepartment" name="filterDepartment" aria-label="Filter Department" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:border-[#3B82F6] flex-1 lg:flex-none">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d.departmentName}>{d.departmentName}</option>)}
          </select>
          <select id="filterDesignation" name="filterDesignation" aria-label="Filter Designation" value={filterDesignation} onChange={e => setFilterDesignation(e.target.value)} className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:border-[#3B82F6] flex-1 lg:flex-none">
            <option value="">All Designations</option>
            {uniqueDesignations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select id="filterStatus" name="filterStatus" aria-label="Filter Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:border-[#3B82F6] flex-1 lg:flex-none">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>
          <select id="filterLocation" name="filterLocation" aria-label="Filter Location" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:border-[#3B82F6] flex-1 lg:flex-none">
            <option value="">All Locations</option>
            {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button className="p-2 bg-[#f0f3f5] text-slate-700 rounded-lg hover:bg-[#d6d9df] transition-colors" onClick={() => { setSearchQuery(""); setFilterDepartment(""); setFilterDesignation(""); setFilterStatus(""); setFilterLocation(""); }}>
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* 4. EMPLOYEE DIRECTORY TABLE */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100 border-b border-[#d6d9df] text-slate-700 font-bold text-xs uppercase tracking-wider">
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
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-600 font-semibold">Loading employees...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-600 font-semibold">No employees found.</td>
                </tr>
              ) : filteredEmployees.map((emp) => {
                const hasSalary = !!salaryStatusMap[emp._id];
                return (
                <tr key={emp._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => handleOpenView(emp)}
                        className="w-9 h-9 rounded-full bg-[#3B82F6] text-[#fdfdfe] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        title="View Profile"
                      >
                        {emp.url ? <img src={emp.url} alt={getEmployeeDisplayName(emp)} className="w-full h-full object-cover" /> : getEmployeeDisplayName(emp).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <button
                          onClick={() => handleOpenView(emp)}
                          className="font-bold text-[#1E293B] hover:text-[#3B82F6] hover:underline transition-colors text-left block cursor-pointer"
                          title="Click to view full employee profile"
                        >
                          {getEmployeeDisplayName(emp)}
                        </button>
                        <p className="text-xs text-slate-500 font-medium">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-700">{emp.employeeId || emp.tradeId}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#1E293B]">{emp.department ? emp.department.departmentName : 'Unassigned'}</p>
                    <p className="text-xs text-slate-500 font-medium">{emp.designation || 'No designation'}</p>
                  </td>
                  <td className="px-5 py-3">Full-Time</td>
                  <td className="px-5 py-3 text-center">
                    {hasSalary ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={12} /> {formatINR(salaryStatusMap[emp._id]?.grossMonthly || 0)}
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
                      {hasPermission('payroll', 'edit') && (
                        <button
                          onClick={() => setSettingsEmployee(emp)}
                          title="Configure Employee Settings (Salary, Designation, Role & Department)"
                          className={`p-2 rounded-lg transition-all shadow-sm flex items-center justify-center ${
                            hasSalary
                              ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-[#1E293B]'
                              : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          <Settings size={18} />
                        </button>
                      )}
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
        isOpen={!!modalMode && modalMode !== 'view'} 
        onClose={handleCloseModal}
        title={modalMode === 'create' ? "Register New Employee" : "Edit Employee"}
        description={modalMode === 'create' ? "Create an account and profile for a new hire." : ""}
      >
        <EmployeeForm 
          mode={modalMode} 
          initialData={selectedEmployee}
          departments={departments}
          availableShifts={availableShifts}
          onSuccess={(responseData) => {
            fetchEmployees();
            handleCloseModal();
            // Show credentials modal only on create
            if (modalMode === 'create' && responseData?.tempPassword) {
              setCredentialsData({
                employeeId: responseData.employee?.employeeId,
                employeeName: getEmployeeDisplayName(responseData.employee),
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => { setCredentialsData(null); setNewlyCreatedEmployee(null); }} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-xl w-full max-w-md p-6 space-y-5">

              <div className="text-center">
                <div className="w-14 h-14 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B]">Employee Created!</h3>
                <p className="text-sm text-slate-600 font-medium mt-1">Account credentials have been generated.</p>
              </div>

              <div className="bg-[#f0f3f5] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Employee ID</span>
                  <span className="font-bold text-[#1E293B]">{credentialsData.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Name</span>
                  <span className="font-bold text-[#1E293B]">{credentialsData.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Email</span>
                  <span className="font-bold text-[#1E293B]">{credentialsData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Temp Password</span>
                  <span className="font-bold text-[#1E293B] font-mono">{credentialsData.tempPassword}</span>
                </div>
              </div>

              {/* Post-creation salary prompt */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-1.5">
                  <Settings size={16} className="text-blue-600" />
                  Configure Employee Settings & Salary?
                </p>
                <p className="text-xs text-blue-600">Set up the compensation structure, job role, designation, and department details right away.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setCredentialsData(null); setNewlyCreatedEmployee(null); }}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-200/80 rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Skip for Now
                </button>
                <button
                  onClick={async () => {
                    const empForSettings = newlyCreatedEmployee;
                    setCredentialsData(null);
                    setNewlyCreatedEmployee(null);
                    if (empForSettings) {
                      const updatedList = await fetchEmployees();
                      const found = (updatedList || []).find(
                        e => e.employeeId === empForSettings.employeeId || e._id === empForSettings._id || e.email === empForSettings.email
                      );
                      setSettingsEmployee(found || empForSettings);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Settings size={16} />
                  Configure Settings Now
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
          fetchEmployees();
        }}
      />

      {/* Quick Settings & Salary Management Modal */}
      <EmployeeQuickSettingsModal
        isOpen={!!settingsEmployee}
        onClose={() => setSettingsEmployee(null)}
        employee={settingsEmployee}
        departments={departments}
        availableShifts={availableShifts}
        onSaved={() => {
          fetchEmployees();
          fetchSalaryStatuses();
        }}
      />

    </div>
  );
}
