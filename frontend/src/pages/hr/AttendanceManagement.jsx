import { useState, useEffect } from 'react';
import { 
  Search, Download, UserCheck, UserX, Clock, 
  AlertCircle, CheckCircle2, XCircle, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, Monitor
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';

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
      <p className="text-sm font-semibold text-[#8f9192] uppercase tracking-wider mt-1">{title}</p>
    </div>
  </div>
);

const StatusPill = ({ status }) => {
  let styles;
  switch(status) {
    case 'Present': styles = "bg-green-50 text-green-700 border-green-200"; break;
    case 'Late': styles = "bg-yellow-50 text-yellow-700 border-yellow-200"; break;
    case 'Absent': styles = "bg-red-50 text-red-700 border-red-200"; break;
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const dateStr = targetDate.toISOString().split("T")[0];
      const [logsData, reqsData] = await Promise.all([
        attendanceService.getAllAttendanceByDate(dateStr),
        attendanceService.getAllRegularizationRequests()
      ]);
      setLogs(logsData);
      setRequests(reqsData.filter(r => r.status === "Pending"));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetDate]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await attendanceService.updateRegularizationStatus(id, newStatus);
      fetchData(); // Refresh to update list and logs
    } catch {
      alert("Failed to update status");
    }
  };

  const filteredLogs = logs.filter(log => {
    if (activeTab === 'All') return true;
    return log.status === activeTab;
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const formatBackendTime = (dateString) => dateString ? new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";

  const getStats = () => {
    let present = 0, absent = 0, late = 0, leave = 0;
    logs.forEach(l => {
      if (l.status === 'Present') present++;
      if (l.status === 'Late') late++;
      if (l.status === 'Absent') absent++;
      if (l.status === 'On Leave') leave++;
    });
    return { present, absent, late, leave, total: logs.length };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-[#f0f3f5] font-sans text-sm sm:text-base text-[#8f9192] p-4 sm:p-6 lg:p-8">
      
      {/* 1. Page Header */}
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Team Attendance</h1>
          <p className="text-[#8f9192] mt-1">Monitor daily attendance, track working hours, and manage adjustments.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector */}
          <div className="flex items-center bg-[#fdfdfe] border border-[#d6d9df] rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setTargetDate(d => new Date(d.setDate(d.getDate() - 1)))}
              className="p-1.5 hover:bg-[#f0f3f5] rounded text-[#8f9192] transition-colors"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-2 px-3 py-1 font-semibold text-[#1E293B]">
              <CalendarIcon size={16} />
              <span>{targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
            </div>
            <button 
              onClick={() => setTargetDate(d => new Date(d.setDate(d.getDate() + 1)))}
              className="p-1.5 hover:bg-[#f0f3f5] rounded text-[#8f9192] transition-colors"><ChevronRight size={18} /></button>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#fdfdfe] border border-[#d6d9df] text-[#1E293B] text-sm font-semibold rounded-lg shadow-sm hover:bg-[#f0f3f5] transition-all">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* 2. Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Recorded" value={stats.total} icon={Monitor} colorClass="bg-[#f0f3f5] text-[#1E293B]" />
          <StatCard title="Present" value={stats.present} subtitle={stats.total ? Math.round(stats.present/stats.total*100) + '%' : "0%"} icon={UserCheck} colorClass="bg-green-50 text-green-600" />
          <StatCard title="Late" value={stats.late} icon={Clock} colorClass="bg-yellow-50 text-yellow-600" />
          <StatCard title="Absent" value={stats.absent} icon={UserX} colorClass="bg-red-50 text-red-600" />
          <StatCard title="On Leave" value={stats.leave} icon={CalendarIcon} colorClass="bg-[#f0f3f5] text-[#8f9192]" />
          <StatCard title="Requests" value={requests.length} icon={AlertCircle} colorClass="bg-orange-50 text-orange-500" />
        </div>

        {/* 3. Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Detailed Attendance Logs (Spans 2 columns on XL screens) */}
          <div className="xl:col-span-2 bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden">
            
            {/* Table Header & Controls */}
            <div className="p-5 border-b border-[#d6d9df] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1E293B]">Daily Logs</h2>
                <span className="bg-[#f0f3f5] text-[#8f9192] text-xs font-bold px-2 py-1 rounded-full">{logs.length} Records</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#bdc2c7]" />
                  <input 
                    type="text" 
                    placeholder="Search employee..." 
                    className="pl-9 pr-4 py-2 w-48 sm:w-64 bg-[#f0f3f5] border border-transparent rounded-lg text-sm focus:bg-[#fdfdfe] focus:border-[#3B82F6] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 border-b border-[#d6d9df] flex gap-6 overflow-x-auto hide-scrollbar">
              {['All', 'Present', 'Late', 'Absent'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab 
                    ? 'border-[#3B82F6] text-[#1E293B]' 
                    : 'border-transparent text-[#8f9192] hover:text-[#1E293B]'
                  }`}
                >
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
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Status</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Check-In</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Check-Out</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-xs">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6d9df]">
                  {isLoading ? (
                    <tr><td colSpan="5" className="px-5 py-10 text-center text-[#bdc2c7]">Loading records...</td></tr>
                  ) : filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-[#f0f3f5]/50 transition-colors">
                      <td className="px-5 py-4">
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
                      <td className="px-5 py-4">
                        <StatusPill status={log.status} />
                      </td>
                      <td className="px-5 py-4 font-medium text-[#8f9192]">
                        {formatBackendTime(log.checkInTime)}
                      </td>
                      <td className="px-5 py-4 font-medium text-[#8f9192]">
                        {log.missingPunch ? <span className="text-red-500 font-bold">Missing</span> : formatBackendTime(log.checkOutTime)}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-[#8f9192]">
                        {log.checkInLocation || '--'}
                      </td>
                    </tr>
                  ))}
                  
                  {!isLoading && filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-5 py-10 text-center text-[#bdc2c7]">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Pending Regularizations / Adjustments */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#d6d9df] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1E293B]">Pending Requests</h2>
                <span className="w-5 h-5 flex items-center justify-center bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                  {requests.length}
                </span>
              </div>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto">
              {requests.length === 0 && <p className="text-xs text-[#8f9192] text-center">No pending requests.</p>}
              
              {requests.map((req) => (
                <div key={req._id} className="p-4 border border-[#d6d9df] rounded-xl bg-[#f0f3f5]/50 hover:bg-[#f0f3f5] hover:border-[#bdc2c7] transition-all">
                  
                  {/* User Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 text-[#1E293B] flex items-center justify-center font-bold text-xs border border-[#3B82F6]/20">
                        {getInitials(req.employee?.firstName, req.employee?.lastName)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1E293B]">{req.employee?.firstName} {req.employee?.lastName}</p>
                        <p className="text-xs text-[#8f9192]">{new Date(req.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="bg-[#fdfdfe] border border-[#d6d9df] p-3 rounded-lg mb-3 shadow-sm">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#8f9192] font-semibold">Type:</span>
                      <span className="text-[#1E293B] font-bold">{req.type}</span>
                    </div>
                    <div className="text-xs mt-2 pt-2 border-t border-[#f0f3f5]">
                      <span className="text-[#8f9192] italic">"{req.reason}"</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(req._id, "Approved")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(req._id, "Rejected")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}