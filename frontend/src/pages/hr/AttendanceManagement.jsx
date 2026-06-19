import { useState, useEffect } from 'react';
import { 
  Search, Download, UserCheck, UserX, Clock, 
  AlertCircle, CheckCircle2, XCircle, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, Monitor, Edit, Plus, Filter, FileSpreadsheet
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import employeeService from '../../services/employeeService';

// --- REUSABLE COMPONENTS ---
const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="bg-[#fdfdfe] rounded-xl border border-[#d6d9df] p-5 flex flex-col justify-between shadow-sm hover:border-[#bdc2c7] transition-colors">
    <div className="flex items-start justify-between mb-2">
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={20} />
      </div>
      {subtitle && <span className="text-xs font-semibold text-[#8f9192] bg-[#f0f3f5] px-2 py-1 rounded-md">{subtitle}</span>}
    </div>
    <div>
      <p className="text-2xl font-bold text-[#1E293B]">{value}</p>
      <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mt-1">{title}</p>
    </div>
  </div>
);

const StatusPill = ({ status }) => {
  let styles;
  switch(status) {
    case 'Present': case 'WFH': styles = "bg-green-50 text-green-700 border-green-200"; break;
    case 'Late': case 'Half Day': styles = "bg-yellow-50 text-yellow-700 border-yellow-200"; break;
    case 'Absent': styles = "bg-red-50 text-red-700 border-red-200"; break;
    case 'On Leave': styles = "bg-purple-50 text-purple-700 border-purple-200"; break;
    default: styles = "bg-[#f0f3f5] text-[#8f9192] border-[#d6d9df]";
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${styles}`}>
      {status}
    </span>
  );
};

export default function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [targetDate, setTargetDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterDesignation, setFilterDesignation] = useState("All");

  // Messages
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals
  const [showRegModal, setShowRegModal] = useState(false);
  const [regData, setRegData] = useState({ id: null, status: "", remarks: "" });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: null, checkInTime: "", checkOutTime: "", status: "Present", notes: "", reason: "" });

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryData, setEntryData] = useState({ employeeId: "", checkInTime: "", checkOutTime: "", status: "Present", notes: "", reason: "" });

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ startDate: "", endDate: "", type: "detailed" });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateStr = targetDate.toISOString().split("T")[0];
      const [logsData, reqsData, empsData] = await Promise.all([
        attendanceService.getAllAttendanceByDate(dateStr),
        attendanceService.getAllRegularizationRequests(),
        employeeService.getAllEmployees().catch(() => []) // Fallback if fails
      ]);
      setLogs(logsData || []);
      setRequests((reqsData || []).filter(r => r.status === "Pending"));
      setEmployees(empsData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetDate]);

  // Derived Filter Lists
  const departments = [...new Set(employees.map(emp => emp.department?.departmentName).filter(Boolean))];
  const designations = [...new Set(employees.map(emp => emp.designation).filter(Boolean))];

  const filteredLogs = logs.filter(log => {
    if (activeTab !== 'All' && log.status !== activeTab) return false;
    if (searchName) {
      const name = `${log.employee?.firstName} ${log.employee?.lastName}`.toLowerCase();
      const empId = (log.employee?.employeeId || "").toLowerCase();
      if (!name.includes(searchName.toLowerCase()) && !empId.includes(searchName.toLowerCase())) return false;
    }
    if (filterDepartment !== "All" && log.employee?.department?.departmentName !== filterDepartment) return false;
    if (filterDesignation !== "All" && log.employee?.designation !== filterDesignation) return false;
    return true;
  });

  // Action Handlers
  const handleApproveReject = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.updateRegularizationStatus(regData.id, regData.status, regData.remarks);
      setSuccessMsg(`Request ${regData.status} successfully`);
      setShowRegModal(false);
      fetchData();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const handleManualEdit = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.manualAttendanceEdit(editData.id, {
        checkInTime: editData.checkInTime || null,
        checkOutTime: editData.checkOutTime || null,
        status: editData.status,
        notes: editData.notes,
        reason: editData.reason
      });
      setSuccessMsg("Attendance record updated successfully");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update record");
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    try {
      const dateStr = targetDate.toISOString().split("T")[0];
      await attendanceService.manualAttendanceEntry({
        employeeId: entryData.employeeId,
        date: dateStr,
        checkInTime: entryData.checkInTime || null,
        checkOutTime: entryData.checkOutTime || null,
        status: entryData.status,
        notes: entryData.notes,
        reason: entryData.reason
      });
      setSuccessMsg("Attendance record created successfully");
      setShowEntryModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create record");
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();
    try {
      const data = await attendanceService.getAttendanceReport(reportData.startDate, reportData.endDate);
      let headers = "";
      let rows = "";

      if (reportData.type === "detailed") {
        headers = "Employee Name,Employee ID,Department,Designation,Date,Status,Check In,Check Out,Working Hours,Overtime\n";
        rows = data.map(log => 
          `"${log.employee?.firstName} ${log.employee?.lastName}","${log.employee?.employeeId}","${log.employee?.department?.departmentName || 'N/A'}","${log.employee?.designation || 'N/A'}","${new Date(log.date).toLocaleDateString()}","${log.status}","${log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : ''}","${log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : ''}","${log.totalWorkingHours || 0}","${log.overtimeHours || 0}"`
        ).join("\n");
      } else {
        // Summary Report
        headers = "Employee Name,Employee ID,Department,Present Count,Absent Count,Leave Count,Late Count,Total Overtime Hrs\n";
        const summaryMap = {};
        data.forEach(log => {
          const emp = log.employee;
          if (!emp) return;
          if (!summaryMap[emp._id]) {
            summaryMap[emp._id] = { name: `${emp.firstName} ${emp.lastName}`, id: emp.employeeId, dept: emp.department?.departmentName || 'N/A', present: 0, absent: 0, leave: 0, late: 0, overtime: 0 };
          }
          const s = summaryMap[emp._id];
          if (['Present', 'WFH', 'Half Day'].includes(log.status)) s.present++;
          if (log.status === 'Absent') s.absent++;
          if (['On Leave'].includes(log.status)) s.leave++;
          if (log.status === 'Late') s.late++;
          s.overtime += (log.overtimeHours || 0);
        });
        rows = Object.values(summaryMap).map(s => 
          `"${s.name}","${s.id}","${s.dept}","${s.present}","${s.absent}","${s.leave}","${s.late}","${s.overtime.toFixed(2)}"`
        ).join("\n");
      }

      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_${reportData.type}_${reportData.startDate}_to_${reportData.endDate}.csv`;
      a.click();
      setShowReportModal(false);
      setSuccessMsg("Report exported successfully");
    } catch(err) {
      setError("Failed to export report");
    }
  };

  // Formatters
  const getInitials = (firstName, lastName) => `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  const formatBackendTime = (dateString) => dateString ? new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";

  // Stats
  const getStats = () => {
    let present = 0, absent = 0, late = 0, leave = 0;
    logs.forEach(l => {
      if (['Present', 'WFH', 'Half Day'].includes(l.status)) present++;
      if (l.status === 'Late') late++;
      if (l.status === 'Absent') absent++;
      if (['On Leave'].includes(l.status)) leave++;
    });
    return { present, absent, late, leave, total: logs.length };
  };
  const stats = getStats();
  const attendancePercentage = stats.total > 0 ? Math.round((stats.present + stats.late) / stats.total * 100) : 0;

  // Department Stats
  const deptStats = {};
  logs.forEach(l => {
    const dept = l.employee?.department?.departmentName || 'Unassigned';
    if (!deptStats[dept]) deptStats[dept] = { total: 0, present: 0, absent: 0 };
    deptStats[dept].total++;
    if (['Present', 'Late', 'WFH', 'Half Day'].includes(l.status)) deptStats[dept].present++;
    if (l.status === 'Absent') deptStats[dept].absent++;
  });

  // Calculate highest and lowest attendance departments
  let highestDept = null;
  let mostAbsentDept = null;
  let highestPct = -1;
  let highestAbsCount = -1;
  
  Object.entries(deptStats).forEach(([dept, stat]) => {
    const pct = (stat.present / stat.total) * 100;
    if (pct > highestPct) {
      highestPct = pct;
      highestDept = dept;
    }
    if (stat.absent > highestAbsCount) {
      highestAbsCount = stat.absent;
      mostAbsentDept = dept;
    }
  });

  const [reqSearch, setReqSearch] = useState("");
  const filteredRequests = requests.filter(req => {
    if (reqSearch) {
      const name = `${req.employee?.firstName} ${req.employee?.lastName}`.toLowerCase();
      if (!name.includes(reqSearch.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* 1. Page Header */}
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Attendance Management</h1>
          <p className="text-[#8f9192] mt-1">Audit, correct, and monitor daily attendance records across the organization.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#fdfdfe] border border-[#d6d9df] rounded-lg p-1 shadow-sm">
            <button onClick={() => setTargetDate(d => new Date(d.setDate(d.getDate() - 1)))} className="p-1.5 hover:bg-[#f0f3f5] rounded text-[#8f9192] transition-colors"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-2 px-3 py-1 font-semibold text-[#1E293B]">
              <CalendarIcon size={16} />
              <span>{targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
            </div>
            <button onClick={() => setTargetDate(d => new Date(d.setDate(d.getDate() + 1)))} className="p-1.5 hover:bg-[#f0f3f5] rounded text-[#8f9192] transition-colors"><ChevronRight size={18} /></button>
          </div>
          
          <button onClick={() => setShowEntryModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-[#2563EB] transition-all">
            <Plus size={16} />
            Manual Entry
          </button>

          <button onClick={() => setShowReportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#fdfdfe] border border-[#d6d9df] text-[#1E293B] text-sm font-bold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all">
            <FileSpreadsheet size={16} />
            Reports
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2"><AlertCircle size={18} /> {error}</div>
            <button onClick={() => setError(null)}><XCircle size={16} /></button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2"><CheckCircle2 size={18} /> {successMsg}</div>
            <button onClick={() => setSuccessMsg(null)}><XCircle size={16} /></button>
          </div>
        )}

        {/* 2. Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Employees" value={stats.total} icon={Monitor} colorClass="bg-[#f0f3f5] text-[#1E293B]" />
          <StatCard title="Attendance %" value={`${attendancePercentage}%`} icon={UserCheck} colorClass="bg-blue-50 text-blue-600" />
          <StatCard title="Present Today" value={stats.present} icon={UserCheck} colorClass="bg-green-50 text-green-600" />
          <StatCard title="Late Today" value={stats.late} icon={Clock} colorClass="bg-yellow-50 text-yellow-600" />
          <StatCard title="Absent Today" value={stats.absent} icon={UserX} colorClass="bg-red-50 text-red-600" />
          <StatCard title="On Leave Today" value={stats.leave} icon={CalendarIcon} colorClass="bg-purple-50 text-purple-600" />
        </div>

        {/* 3. Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Detailed Attendance Logs */}
          <div className="xl:col-span-2 bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden">
            
            <div className="p-5 border-b border-[#d6d9df] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#1E293B]">Daily Logs</h2>
                  <span className="bg-[#f0f3f5] text-[#8f9192] text-xs font-bold px-2 py-1 rounded-full">{filteredLogs.length} Records</span>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7]" />
                  <input type="text" placeholder="Search by name or ID..." value={searchName} onChange={e => setSearchName(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full sm:w-64 bg-[#f0f3f5] border border-transparent rounded-lg text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:outline-none transition-all" />
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm">
                  <Filter size={14} className="text-[#8f9192]" />
                  <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="bg-transparent text-[#1E293B] font-semibold outline-none w-full min-w-[100px]">
                    <option value="All">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-[#f0f3f5] border border-transparent rounded-lg text-sm">
                  <Filter size={14} className="text-[#8f9192]" />
                  <select value={filterDesignation} onChange={e => setFilterDesignation(e.target.value)} className="bg-transparent text-[#1E293B] font-semibold outline-none w-full min-w-[100px]">
                    <option value="All">All Designations</option>
                    {designations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 border-b border-[#d6d9df] flex gap-6 overflow-x-auto hide-scrollbar">
              {['All', 'Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Holiday', 'Weekend', 'WFH'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab ? 'border-[#3B82F6] text-[#1E293B]' : 'border-transparent text-[#8f9192] hover:text-[#1E293B]'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-[#f0f3f5] text-[#8f9192]">
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Employee</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Department/Role</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Status</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Timing</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Hours</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6d9df]">
                  {isLoading ? (
                    <tr><td colSpan="6" className="px-5 py-10 text-center text-[#bdc2c7]">Loading records...</td></tr>
                  ) : filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#bdc2c7] text-[#fdfdfe] flex items-center justify-center font-bold text-sm shadow-sm">
                            {getInitials(log.employee?.firstName, log.employee?.lastName)}
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B]">{log.employee?.firstName} {log.employee?.lastName}</p>
                            <p className="text-xs text-[#8f9192]">{log.employee?.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-[#1E293B]">{log.employee?.department?.departmentName || '--'}</p>
                        <p className="text-xs text-[#8f9192]">{log.employee?.designation || '--'}</p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={log.status} />
                      </td>
                      <td className="px-5 py-3 text-xs font-medium text-[#8f9192]">
                        <p><span className="font-bold text-slate-700">In:</span> {formatBackendTime(log.checkInTime)}</p>
                        <p><span className="font-bold text-slate-700">Out:</span> {log.missingPunch ? <span className="text-red-500 font-bold">Missing</span> : formatBackendTime(log.checkOutTime)}</p>
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <p className="font-bold text-slate-700">{log.totalWorkingHours || 0} Hrs</p>
                        {log.overtimeHours > 0 && <p className="text-amber-600 font-bold">OT: {log.overtimeHours} Hrs</p>}
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => {
                            setEditData({
                              id: log._id,
                              checkInTime: log.checkInTime ? new Date(log.checkInTime).toISOString().slice(0, 16) : "",
                              checkOutTime: log.checkOutTime ? new Date(log.checkOutTime).toISOString().slice(0, 16) : "",
                              status: log.status,
                              notes: log.notes || "",
                              reason: ""
                            });
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {!isLoading && filteredLogs.length === 0 && (
                    <tr><td colSpan="6" className="px-5 py-10 text-center text-[#bdc2c7]">No attendance records found matching filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            
            {/* Pending Regularizations */}
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden max-h-[500px]">
              <div className="p-5 border-b border-[#d6d9df] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#1E293B]">Pending Requests</h2>
                    <span className="w-5 h-5 flex items-center justify-center bg-orange-100 text-orange-600 text-xs font-bold rounded-full">{filteredRequests.length}</span>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7]" />
                  <input type="text" placeholder="Search requests..." value={reqSearch} onChange={e => setReqSearch(e.target.value)}
                    className="pl-9 pr-4 py-1.5 w-full bg-[#f0f3f5] border border-transparent rounded-lg text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] outline-none transition-all" />
                </div>
              </div>
              
              <div className="p-5 space-y-4 overflow-y-auto">
                {filteredRequests.length === 0 && <p className="text-xs text-[#8f9192] text-center">No pending requests.</p>}
                
                {filteredRequests.map((req) => (
                  <div key={req._id} className="p-4 border border-[#d6d9df] rounded-xl bg-[#f0f3f5]/50 hover:bg-[#f0f3f5] hover:border-[#bdc2c7] transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 text-[#1E293B] flex items-center justify-center font-bold text-xs border border-[#3B82F6]/20">
                        {getInitials(req.employee?.firstName, req.employee?.lastName)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1E293B]">{req.employee?.firstName} {req.employee?.lastName}</p>
                        <p className="text-xs text-[#8f9192]">{new Date(req.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-[#fdfdfe] border border-[#d6d9df] p-3 rounded-lg mb-3 shadow-sm">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#8f9192] font-semibold">Type:</span>
                        <span className="text-[#1E293B] font-bold">{req.type}</span>
                      </div>
                      <div className="text-xs mt-2 pt-2 border-t border-[#f0f3f5]">
                        <span className="text-[#8f9192] italic">"{req.reason}"</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => { setRegData({ id: req._id, status: "Approved", remarks: "" }); setShowRegModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button onClick={() => { setRegData({ id: req._id, status: "Rejected", remarks: "" }); setShowRegModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Analytics */}
            <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-[#d6d9df]">
                <h2 className="text-lg font-bold text-[#1E293B]">Department Analytics</h2>
                {highestDept && (
                  <div className="mt-3 flex flex-col gap-1 text-xs">
                    <p><span className="font-semibold text-green-600">Highest Attendance:</span> <span className="text-[#1E293B] font-bold">{highestDept}</span> ({Math.round(highestPct)}%)</p>
                    {highestAbsCount > 0 && <p><span className="font-semibold text-red-600">Most Absent:</span> <span className="text-[#1E293B] font-bold">{mostAbsentDept}</span> ({highestAbsCount} Absent)</p>}
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                {Object.keys(deptStats).length === 0 && <p className="text-xs text-[#8f9192] text-center">No departmental data available.</p>}
                {Object.entries(deptStats).map(([dept, dStat]) => {
                  const pct = Math.round((dStat.present / dStat.total) * 100);
                  return (
                    <div key={dept}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-[#1E293B] truncate max-w-[150px]">{dept}</span>
                        <span className="text-[#8f9192] font-semibold">{pct}% Present</span>
                      </div>
                      <div className="w-full bg-[#f0f3f5] rounded-full h-2">
                        <div className={`h-2 rounded-full ${pct >= 90 ? 'bg-green-500' : pct >= 75 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-[#bdc2c7]">
                        <span>{dStat.present} Present</span>
                        <span>{dStat.absent} Absent</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Regularization Remarks Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfdfe] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className={`p-4 border-b border-[#d6d9df] flex justify-between items-center ${regData.status === 'Approved' ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-bold ${regData.status === 'Approved' ? 'text-green-800' : 'text-red-800'}`}>Confirm {regData.status}</h3>
              <button onClick={() => setShowRegModal(false)} className="text-[#8f9192] hover:text-[#1E293B]"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleApproveReject} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1E293B] mb-1">Add Remarks (Optional)</label>
                <textarea 
                  className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-[#f0f3f5]"
                  rows="3" placeholder="Enter reason for approval or rejection..."
                  value={regData.remarks} onChange={e => setRegData({...regData, remarks: e.target.value})}
                />
              </div>
              <button type="submit" className={`w-full py-2.5 text-white font-bold rounded-xl shadow-sm transition-colors ${regData.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                Submit {regData.status}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfdfe] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#d6d9df] flex justify-between items-center bg-blue-50">
              <h3 className="font-bold text-blue-800">Edit Attendance Record</h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#8f9192] hover:text-[#1E293B]"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleManualEdit} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Check In Time</label>
                  <input type="datetime-local" className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white" 
                    value={editData.checkInTime} onChange={e => setEditData({...editData, checkInTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Check Out Time</label>
                  <input type="datetime-local" className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white" 
                    value={editData.checkOutTime} onChange={e => setEditData({...editData, checkOutTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Status</label>
                <select className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white" 
                  value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})}>
                  {['Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Holiday', 'Weekend', 'WFH'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Admin Notes</label>
                <textarea className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-[#f0f3f5]" rows="2" 
                  value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Reason for Edit <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="Required for Audit Log" className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={editData.reason} onChange={e => setEditData({...editData, reason: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfdfe] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#d6d9df] flex justify-between items-center bg-blue-50">
              <h3 className="font-bold text-blue-800">Manual Attendance Entry</h3>
              <button onClick={() => setShowEntryModal(false)} className="text-[#8f9192] hover:text-[#1E293B]"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleManualEntry} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Select Employee <span className="text-red-500">*</span></label>
                <select required className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white" 
                  value={entryData.employeeId} onChange={e => setEntryData({...entryData, employeeId: e.target.value})}>
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Check In Time</label>
                  <input type="datetime-local" className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white" 
                    value={entryData.checkInTime} onChange={e => setEntryData({...entryData, checkInTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Check Out Time</label>
                  <input type="datetime-local" className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white" 
                    value={entryData.checkOutTime} onChange={e => setEntryData({...entryData, checkOutTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Status</label>
                <select className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white" 
                  value={entryData.status} onChange={e => setEntryData({...entryData, status: e.target.value})}>
                  {['Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Holiday', 'Weekend', 'WFH'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Admin Notes</label>
                <textarea className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-[#f0f3f5]" rows="2" 
                  value={entryData.notes} onChange={e => setEntryData({...entryData, notes: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Reason for Entry <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="Required for Audit Log" className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={entryData.reason} onChange={e => setEntryData({...entryData, reason: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
                Create Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reports & Export Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfdfe] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#d6d9df] flex justify-between items-center bg-blue-50">
              <h3 className="font-bold text-blue-800">Generate Attendance Report</h3>
              <button onClick={() => setShowReportModal(false)} className="text-[#8f9192] hover:text-[#1E293B]"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleExport} className="p-5 space-y-4">
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#1E293B] mb-2">Report Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#1E293B]">
                    <input type="radio" value="detailed" checked={reportData.type === 'detailed'} onChange={e => setReportData({...reportData, type: e.target.value})} className="w-4 h-4 text-blue-600" />
                    Detailed Logs
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#1E293B]">
                    <input type="radio" value="summary" checked={reportData.type === 'summary'} onChange={e => setReportData({...reportData, type: e.target.value})} className="w-4 h-4 text-blue-600" />
                    Summary Report
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" required className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white" 
                    value={reportData.startDate} onChange={e => setReportData({...reportData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">End Date <span className="text-red-500">*</span></label>
                  <input type="date" required className="w-full border border-[#d6d9df] rounded-lg p-2 text-sm bg-white" 
                    value={reportData.endDate} onChange={e => setReportData({...reportData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1E293B] text-white font-bold rounded-xl shadow-sm hover:bg-[#0F172A] transition-colors">
                  <Download size={18} /> Export as CSV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
