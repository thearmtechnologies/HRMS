import React, { useState } from 'react';
import { 
  Search, Plus, Filter, MoreHorizontal, Mail, Phone, 
  Building2, Briefcase, ChevronDown, UserCheck, 
  UserMinus, Users, Download, Edit, Trash2, Eye,
  X, Save, Lock, User
} from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_EMPLOYEES = [
  { id: 'NEX-1042', name: 'Sarah Jenkins', email: 'sarah.j@ARM.com', phone: '+1 555-0101', role: 'Senior UI/UX Designer', dept: 'Design', status: 'Active', joinDate: 'Mar 15, 2021', initial: 'SJ' },
  { id: 'NEX-1043', name: 'Marcus Doe', email: 'marcus.d@ARM.com', phone: '+1 555-0102', role: 'Frontend Developer', dept: 'Engineering', status: 'Active', joinDate: 'Jun 01, 2021', initial: 'MD' },
  { id: 'NEX-1044', name: 'Alice Smith', email: 'alice.s@ARM.com', phone: '+1 555-0103', role: 'Sales Executive', dept: 'Sales', status: 'On Leave', joinDate: 'Jan 10, 2022', initial: 'AS' },
  { id: 'NEX-1045', name: 'John Taylor', email: 'john.t@ARM.com', phone: '+1 555-0104', role: 'DevOps Engineer', dept: 'Engineering', status: 'Active', joinDate: 'Aug 22, 2022', initial: 'JT' },
  { id: 'NEX-1046', name: 'Emma Wilson', email: 'emma.w@ARM.com', phone: '+1 555-0105', role: 'HR Manager', dept: 'HR', status: 'Active', joinDate: 'Nov 05, 2020', initial: 'EW' },
  { id: 'NEX-1047', name: 'Liam Brown', email: 'liam.b@ARM.com', phone: '+1 555-0106', role: 'Backend Developer', dept: 'Engineering', status: 'Active', joinDate: 'Feb 14, 2023', initial: 'LB' },
  { id: 'NEX-1048', name: 'Olivia Martin', email: 'olivia.m@ARM.com', phone: '+1 555-0107', role: 'Marketing Lead', dept: 'Marketing', status: 'Terminated', joinDate: 'Sep 30, 2019', initial: 'OM' },
  { id: 'NEX-1049', name: 'Ethan Hunt', email: 'ethan.h@ARM.com', phone: '+1 555-0108', role: 'Product Manager', dept: 'Product', status: 'Active', joinDate: 'Dec 01, 2021', initial: 'EH' },
];

const DEPARTMENTS = ['All Departments', 'Engineering', 'Design', 'Sales', 'HR', 'Marketing', 'Product'];
const STATUSES = ['All Statuses', 'Active', 'On Leave', 'Terminated'];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '', lastName: '', email: '', phone: '', 
    employeeId: '', department: 'Engineering', role: '', joinDate: '',
    password: '', sendEmail: true
  });

  // Filter Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All Departments' || emp.dept === selectedDept;
    const matchesStatus = selectedStatus === 'All Statuses' || emp.status === selectedStatus;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Toggle Action Dropdown
  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  // Handle Form Submission
  const handleAddEmployee = (e) => {
    e.preventDefault();
    const formattedEmployee = {
      id: newEmployee.employeeId || `NEX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${newEmployee.firstName} ${newEmployee.lastName}`,
      email: newEmployee.email,
      phone: newEmployee.phone,
      role: newEmployee.role,
      dept: newEmployee.department,
      status: 'Active',
      joinDate: new Date(newEmployee.joinDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      initial: `${newEmployee.firstName.charAt(0)}${newEmployee.lastName.charAt(0)}`.toUpperCase()
    };
    
    setEmployees([formattedEmployee, ...employees]);
    setIsAddModalOpen(false);
    
    // Reset Form
    setNewEmployee({
      firstName: '', lastName: '', email: '', phone: '', 
      employeeId: '', department: 'Engineering', role: '', joinDate: '',
      password: '', sendEmail: true
    });
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* 1. Header Section */}
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Employee Directory</h1>
          <p className="text-[#8f9192] mt-1">Manage your workforce, view profiles, and update employee records cleanly.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] text-[#8f9192] hover:text-[#1E293B] text-sm font-semibold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all">
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] text-[#fdfdfe] text-sm font-semibold rounded-lg shadow-sm hover:bg-opacity-90 transition-all"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* 2. Quick HR Stats (Uncluttered) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 flex items-center gap-5 shadow-sm">
            <div className="p-4 bg-[#f0f3f5] rounded-xl text-[#1E293B]">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#8f9192] mb-1">Total Employees</p>
              <h2 className="text-3xl font-bold text-[#1E293B]">{employees.length}</h2>
            </div>
          </div>
          
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 flex items-center gap-5 shadow-sm">
            <div className="p-4 bg-green-50 rounded-xl text-green-600">
              <UserCheck size={28} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#8f9192] mb-1">Active Workforce</p>
              <h2 className="text-3xl font-bold text-[#1E293B]">{employees.filter(e => e.status === 'Active').length}</h2>
            </div>
          </div>

          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 flex items-center gap-5 shadow-sm">
            <div className="p-4 bg-orange-50 rounded-xl text-orange-500">
              <UserMinus size={28} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#8f9192] mb-1">On Leave</p>
              <h2 className="text-3xl font-bold text-[#1E293B]">{employees.filter(e => e.status === 'On Leave').length}</h2>
            </div>
          </div>
        </div>

        {/* 3. Main Directory Container */}
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-visible">
          
          {/* Search & Filter Bar */}
          <div className="p-5 border-b border-[#d6d9df] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Powerful, Prominent Search */}
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#bdc2c7]" />
              </div>
              <input 
                type="text" 
                placeholder="Search by name, ID, or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#f0f3f5] border border-transparent rounded-xl text-base text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]"
              />
            </div>
            
            {/* Clean Dropdown Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-48">
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#8f9192] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all cursor-pointer"
                >
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
              </div>
              
              <div className="relative w-full sm:w-48">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#8f9192] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all cursor-pointer"
                >
                  {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Spacious Table Layout */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f3f5]/50 border-b border-[#d6d9df] text-xs font-bold uppercase tracking-wider text-[#bdc2c7]">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">ID & Contact</th>
                  <th className="px-6 py-4">Role & Dept</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3f5]">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#f0f3f5]/30 transition-colors group">
                    
                    {/* 1. Employee Profile Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#f0f3f5] border border-[#d6d9df] text-[#1E293B] flex items-center justify-center font-bold text-lg shadow-sm">
                          {emp.initial}
                        </div>
                        <div>
                          <p className="font-bold text-[#1E293B] text-base">{emp.name}</p>
                          <p className="text-xs text-[#bdc2c7] font-medium mt-0.5">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Contact & ID */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#8f9192] mb-1">{emp.id}</p>
                      <p className="text-xs text-[#bdc2c7] flex items-center gap-1.5">
                        <Phone size={12} /> {emp.phone}
                      </p>
                    </td>

                    {/* 3. Role & Dept */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#1E293B] mb-1">{emp.role}</p>
                      <p className="text-xs text-[#8f9192] flex items-center gap-1.5">
                        <Building2 size={12} className="text-[#bdc2c7]" /> {emp.dept}
                      </p>
                    </td>

                    {/* 4. Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border
                        ${emp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                          emp.status === 'On Leave' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                          'bg-red-50 text-red-600 border-red-200'}`}>
                        {emp.status}
                      </span>
                    </td>

                    {/* 5. Join Date */}
                    <td className="px-6 py-4 text-sm font-medium text-[#8f9192]">
                      {emp.joinDate}
                    </td>

                    {/* 6. Clean Actions Dropdown */}
                    <td className="px-6 py-4 text-center relative">
                      <button 
                        onClick={() => toggleDropdown(emp.id)}
                        className="p-2 text-[#bdc2c7] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-lg transition-colors focus:outline-none"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === emp.id && (
                        <>
                          {/* Invisible overlay to close dropdown when clicking outside */}
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                          
                          <div className="absolute right-8 top-12 w-48 bg-[#fdfdfe] rounded-xl shadow-lg border border-[#d6d9df] z-20 py-2 overflow-hidden text-left">
                            <button className="w-full px-4 py-2.5 text-sm font-medium text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#1E293B] flex items-center gap-2 transition-colors">
                              <Eye size={16} /> View Profile
                            </button>
                            <button className="w-full px-4 py-2.5 text-sm font-medium text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#1E293B] flex items-center gap-2 transition-colors">
                              <Edit size={16} /> Edit Details
                            </button>
                            <div className="h-px bg-[#f0f3f5] my-1"></div>
                            <button className="w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors">
                              <Trash2 size={16} /> Terminate
                            </button>
                          </div>
                        </>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State / No Results */}
            {filteredEmployees.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 bg-[#f0f3f5] rounded-full flex items-center justify-center text-[#bdc2c7] mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-1">No employees found</h3>
                <p className="text-[#8f9192] max-w-sm">We couldn't find any employees matching your current search or filter criteria.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedDept('All Departments'); setSelectedStatus('All Statuses'); }}
                  className="mt-4 text-[#1E293B] font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
          
          {/* Footer Pagination (Static UI for demo) */}
          <div className="px-6 py-4 border-t border-[#d6d9df] flex items-center justify-between bg-[#fdfdfe]">
            <p className="text-sm text-[#8f9192] font-medium">
              Showing <span className="font-bold text-[#1E293B]">1</span> to <span className="font-bold text-[#1E293B]">{filteredEmployees.length}</span> of <span className="font-bold text-[#1E293B]">{employees.length}</span> employees
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm font-semibold text-[#bdc2c7] border border-[#d6d9df] rounded-lg cursor-not-allowed">Previous</button>
              <button className="px-3 py-1.5 text-sm font-semibold text-[#1E293B] border border-[#d6d9df] rounded-lg hover:bg-[#f0f3f5] transition-colors">Next</button>
            </div>
          </div>

        </div>
      </div>

      {/* --- ADD EMPLOYEE MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B82F6]/40 backdrop-blur-sm">
          <div className="bg-[#fdfdfe] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#d6d9df] flex justify-between items-center bg-[#fdfdfe]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f0f3f5] rounded-lg text-[#1E293B]">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E293B]">Register New Employee</h2>
                  <p className="text-xs text-[#8f9192]">Create an account and profile for a new hire.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="p-2 text-[#8f9192] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={24}/>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form id="add-employee-form" onSubmit={handleAddEmployee} className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* Section 1: Personal Details */}
              <section>
                <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                  <User size={16} /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">First Name *</label>
                    <input type="text" required
                      value={newEmployee.firstName} onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]" placeholder="e.g. John" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Last Name *</label>
                    <input type="text" required
                      value={newEmployee.lastName} onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]" placeholder="e.g. Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Work Email *</label>
                    <input type="email" required
                      value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]" placeholder="john.doe@ARM.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Phone Number *</label>
                    <input type="tel" required
                      value={newEmployee.phone} onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </section>

              {/* Section 2: Employment Details */}
              <section>
                <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                  <Briefcase size={16} /> Employment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Employee ID (Optional)</label>
                    <input type="text"
                      value={newEmployee.employeeId} onChange={(e) => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]" placeholder="Auto-generated if left blank" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Department *</label>
                    <div className="relative">
                      <select required
                        value={newEmployee.department} onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                        className="w-full appearance-none px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all cursor-pointer">
                        {DEPARTMENTS.filter(d => d !== 'All Departments').map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Job Title / Role *</label>
                    <input type="text" required
                      value={newEmployee.role} onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]" placeholder="e.g. Senior Software Engineer" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Date of Joining *</label>
                    <input type="date" required
                      value={newEmployee.joinDate} onChange={(e) => setNewEmployee({...newEmployee, joinDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all" />
                  </div>
                </div>
              </section>

              {/* Section 3: System Access */}
              <section>
                <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-4 border-b border-[#d6d9df] pb-2 flex items-center gap-2">
                  <Lock size={16} /> System Access
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  <div>
                    <label className="block text-sm font-semibold text-[#8f9192] mb-1.5">Temporary Login Password *</label>
                    <input type="password" required
                      value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[#f0f3f5] border border-[#d6d9df] rounded-lg text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]" placeholder="Enter a secure temporary password" />
                    <p className="text-xs text-[#bdc2c7] mt-1.5">Employee will be forced to change this upon first login.</p>
                  </div>
                  
                  <div className="md:mt-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" 
                        checked={newEmployee.sendEmail} onChange={(e) => setNewEmployee({...newEmployee, sendEmail: e.target.checked})}
                        className="w-5 h-5 rounded border-[#d6d9df] text-[#1E293B] focus:ring-[#3B82F6]" />
                      <div>
                        <span className="text-sm font-semibold text-[#8f9192] group-hover:text-[#1E293B] transition-colors block">Send Welcome Email</span>
                        <span className="text-xs text-[#bdc2c7]">Automatically email login credentials to the user.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </section>

            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#d6d9df] bg-[#f0f3f5] flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#8f9192] border border-[#d6d9df] bg-[#fdfdfe] rounded-lg hover:bg-[#f0f3f5] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="add-employee-form"
                className="px-5 py-2.5 flex items-center gap-2 text-sm font-bold text-[#fdfdfe] bg-[#3B82F6] rounded-lg hover:bg-opacity-90 shadow-sm transition-all"
              >
                <Save size={18} />
                Save Employee
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}