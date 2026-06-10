import React, { useState } from 'react';
import { 
  Search, Download, Filter, MoreHorizontal, 
  Calendar, Building2, CheckCircle2, FileText, 
  Edit, Wallet, ChevronDown, CheckCircle, Clock
} from 'lucide-react';

// --- MOCK DATA ---
const PAYROLL_DATA = [
  { id: 'NEX-1042', name: 'Sarah Jenkins', dept: 'Design', basic: 5000, allowances: 1200, deductions: 450, net: 5750, status: 'Approved', initial: 'SJ' },
  { id: 'NEX-1043', name: 'Marcus Doe', dept: 'Engineering', basic: 6500, allowances: 1500, deductions: 600, net: 7400, status: 'Pending', initial: 'MD' },
  { id: 'NEX-1044', name: 'Alice Smith', dept: 'Sales', basic: 4500, allowances: 2000, deductions: 500, net: 6000, status: 'Generated', initial: 'AS' },
  { id: 'NEX-1045', name: 'John Taylor', dept: 'Engineering', basic: 7000, allowances: 1000, deductions: 650, net: 7350, status: 'Approved', initial: 'JT' },
  { id: 'NEX-1046', name: 'Emma Wilson', dept: 'HR', basic: 5500, allowances: 800, deductions: 400, net: 5900, status: 'Pending', initial: 'EW' },
  { id: 'NEX-1047', name: 'Liam Brown', dept: 'Engineering', basic: 6000, allowances: 1200, deductions: 550, net: 6650, status: 'Generated', initial: 'LB' },
  { id: 'NEX-1049', name: 'Ethan Hunt', dept: 'Product', basic: 8000, allowances: 1500, deductions: 800, net: 8700, status: 'Approved', initial: 'EH' },
];

const DEPARTMENTS = ['All Departments', 'Engineering', 'Design', 'Sales', 'HR', 'Product'];
const MONTHS = ['October 2023', 'September 2023', 'August 2023', 'July 2023'];

export default function PayrollManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedMonth, setSelectedMonth] = useState('October 2023');
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Formatting currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Filter Logic
  const filteredPayroll = PAYROLL_DATA.filter(record => {
    const matchesSearch = 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      record.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All Departments' || record.dept === selectedDept;
    
    return matchesSearch && matchesDept;
  });

  // Toggle Action Dropdown
  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* 1. Header Section */}
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Payroll Management</h1>
          <p className="text-[#8f9192] mt-1">Review, process, and manage employee salaries and payslips cleanly.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] text-[#8f9192] hover:text-[#1E293B] text-sm font-semibold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all">
            <Download size={18} />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] text-[#fdfdfe] text-sm font-semibold rounded-lg shadow-sm hover:bg-opacity-90 transition-all">
            <Wallet size={18} />
            Generate Payroll
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* 2. Quick Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 flex items-center gap-5 shadow-sm">
            <div className="p-4 bg-[#f0f3f5] rounded-xl text-[#1E293B]">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#8f9192] mb-1">Total Net Salary</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#1E293B]">₹47,800</h2>
            </div>
          </div>
          
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 flex items-center gap-5 shadow-sm">
            <div className="p-4 bg-orange-50 rounded-xl text-orange-500">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#8f9192] mb-1">Pending Approval</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#1E293B]">24<span className="text-sm font-medium text-[#8f9192] ml-2">Employees</span></h2>
            </div>
          </div>

          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 flex items-center gap-5 shadow-sm">
            <div className="p-4 bg-green-50 rounded-xl text-green-600">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#8f9192] mb-1">Processed</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#1E293B]">224<span className="text-sm font-medium text-[#8f9192] ml-2">Employees</span></h2>
            </div>
          </div>
        </div>

        {/* 3. Main Data Container */}
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-visible">
          
          {/* Filters Bar */}
          <div className="p-5 border-b border-[#d6d9df] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#fdfdfe] rounded-t-2xl">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#bdc2c7]" />
              </div>
              <input 
                type="text" 
                placeholder="Search employee or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm text-[#8f9192] focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#bdc2c7]"
              />
            </div>
            
            {/* Dropdown Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Month Filter */}
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-[#8f9192]" />
                </div>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full appearance-none pl-10 pr-10 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-semibold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all cursor-pointer"
                >
                  {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
              </div>

              {/* Department Filter */}
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="h-4 w-4 text-[#8f9192]" />
                </div>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full appearance-none pl-10 pr-10 py-2.5 bg-[#f0f3f5] border border-transparent rounded-xl text-sm font-medium text-[#8f9192] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all cursor-pointer"
                >
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f0f3f5]/50 border-b border-[#d6d9df] text-xs font-bold uppercase tracking-wider text-[#bdc2c7]">
                  <th className="px-6 py-4">Employee Details</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-right">Basic Salary</th>
                  <th className="px-6 py-4 text-right">Allowances</th>
                  <th className="px-6 py-4 text-right">Deductions</th>
                  <th className="px-6 py-4 text-right">Net Salary</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3f5]">
                {filteredPayroll.map((record) => (
                  <tr key={record.id} className="hover:bg-[#f0f3f5]/30 transition-colors group">
                    
                    {/* Employee Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#f0f3f5] border border-[#d6d9df] text-[#1E293B] flex items-center justify-center font-bold text-sm shadow-sm">
                          {record.initial}
                        </div>
                        <div>
                          <p className="font-bold text-[#1E293B] text-sm">{record.name}</p>
                          <p className="text-xs text-[#bdc2c7] font-medium mt-0.5">{record.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#8f9192]">{record.dept}</span>
                    </td>

                    {/* Financials */}
                    <td className="px-6 py-4 text-right text-sm font-medium text-[#8f9192]">
                      {formatCurrency(record.basic)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                      +{formatCurrency(record.allowances)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-red-500">
                      -{formatCurrency(record.deductions)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-bold text-[#1E293B] bg-[#3B82F6]/5 px-3 py-1.5 rounded-lg border border-[#3B82F6]/10">
                        {formatCurrency(record.net)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border
                        ₹{record.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                          record.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                          'bg-blue-50 text-blue-600 border-blue-200'}`}>
                        {record.status}
                      </span>
                    </td>

                    {/* Actions Dropdown */}
                    <td className="px-6 py-4 text-center relative">
                      <button 
                        onClick={() => toggleDropdown(record.id)}
                        className="p-2 text-[#bdc2c7] hover:text-[#1E293B] hover:bg-[#f0f3f5] rounded-lg transition-colors focus:outline-none"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === record.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                          
                          <div className="absolute right-8 top-12 w-48 bg-[#fdfdfe] rounded-xl shadow-lg border border-[#d6d9df] z-20 py-2 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100">
                            {record.status !== 'Approved' && (
                              <button className="w-full px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors">
                                <CheckCircle2 size={16} /> Approve Payroll
                              </button>
                            )}
                            <button className="w-full px-4 py-2.5 text-sm font-medium text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#1E293B] flex items-center gap-2 transition-colors">
                              <Edit size={16} /> Edit Details
                            </button>
                            <div className="h-px bg-[#f0f3f5] my-1"></div>
                            <button className="w-full px-4 py-2.5 text-sm font-medium text-[#8f9192] hover:bg-[#f0f3f5] hover:text-[#1E293B] flex items-center gap-2 transition-colors">
                              <FileText size={16} /> Download Payslip
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
            {filteredPayroll.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 bg-[#f0f3f5] rounded-full flex items-center justify-center text-[#bdc2c7] mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-1">No records found</h3>
                <p className="text-[#8f9192] max-w-sm">No payroll data matches your current search or filter criteria.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedDept('All Departments'); }}
                  className="mt-4 text-[#1E293B] font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
          
          {/* Footer Pagination */}
          <div className="px-6 py-4 border-t border-[#d6d9df] flex items-center justify-between bg-[#fdfdfe] rounded-b-2xl">
            <p className="text-sm text-[#8f9192] font-medium">
              Showing <span className="font-bold text-[#1E293B]">1</span> to <span className="font-bold text-[#1E293B]">{filteredPayroll.length}</span> of <span className="font-bold text-[#1E293B]">{PAYROLL_DATA.length}</span> records
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm font-semibold text-[#bdc2c7] border border-[#d6d9df] rounded-lg cursor-not-allowed">Previous</button>
              <button className="px-3 py-1.5 text-sm font-semibold text-[#1E293B] border border-[#d6d9df] rounded-lg hover:bg-[#f0f3f5] transition-colors">Next</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}