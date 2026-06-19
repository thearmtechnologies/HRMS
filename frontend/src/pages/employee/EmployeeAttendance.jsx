import { useState, useEffect } from "react";
import {
  Clock, CalendarDays, MapPin, AlertCircle, CheckCircle, XCircle, 
  FileText, History, Briefcase, Filter, Bell, 
  Play, Square, Check, Plus
} from "lucide-react";
import attendanceService from '../../services/attendanceService';
import holidayService from '../../services/holidayService';
import shiftService from '../../services/shiftService';
import employeeService from '../../services/employeeService';

export default function EmployeeAttendance() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Real Data States
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [holidaysData, setHolidaysData] = useState([]);
  const [regularizationReqs, setRegularizationReqs] = useState([]);
  const [myShift, setMyShift] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState("All Records");

  // Modal States
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  
  // Form States
  const [checkInOutNotes, setCheckInOutNotes] = useState("");
  const [regData, setRegData] = useState({ date: "", reason: "", type: "Missing Punch", requestedChanges: {} });

  // Live Timer State
  const [liveWorkedSeconds, setLiveWorkedSeconds] = useState(0);

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Worked Timer Update
  useEffect(() => {
    let interval = null;
    if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) {
      interval = setInterval(() => {
        const diffMs = Date.now() - new Date(todayAttendance.checkInTime).getTime();
        setLiveWorkedSeconds(Math.floor(diffMs / 1000));
      }, 1000);
    } else {
      setLiveWorkedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [todayAttendance]);

  // Removed useEffect from here

  const fetchAttendanceData = async () => {
    setError(null);
    try {
      const [today, history, summary, hConfig, regs, shiftInfo, profileData] = await Promise.all([
        attendanceService.getTodayAttendance(),
        attendanceService.getMonthlyAttendance(selectedMonth, selectedYear),
        attendanceService.getAttendanceSummary(selectedMonth, selectedYear),
        holidayService.getHolidaysByYear(selectedYear).catch(() => ({ holidays: [] })),
        attendanceService.getRegularizationRequests(),
        shiftService.getMyShift().catch(() => null),
        employeeService.getEmployeeDataByEmail('me').catch(() => null) // Temporary fallback for profile API if needed
      ]);
      setTodayAttendance(today);
      setHistoryData(history);
      setSummaryStats(summary);
      setRegularizationReqs(regs);
      setMyShift(shiftInfo);
      setMyProfile(profileData);

      // Parse holidays for the selected month
      const currentMonthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' });
      const monthHolidays = hConfig?.holidays?.find(h => h.month === currentMonthName)?.dates || [];
      setHolidaysData(monthHolidays);

    } catch (err) {
      if (err.response?.status === 404 && err.response?.data?.message?.includes("profile not found")) {
        setError("Your account is not linked to an Employee Profile. Please create an Employee Profile for this account in Employee Management to mark attendance.");
      } else {
        setError(err.response?.data?.message || "Failed to load attendance data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth, selectedYear]);

  const executeCheckIn = async () => {
    setIsProcessing(true);
    try {
      const res = await attendanceService.checkIn({ 
        date: new Date().toISOString(), 
        notes: checkInOutNotes,
        checkInLocation: "Office - Detected IP" // Mock location tracking
      });
      setTodayAttendance(res.attendance);
      setShowCheckInModal(false);
      setCheckInOutNotes("");
      refreshDataSilently();
    } catch (err) {
      alert(err.response?.data?.message || "Check in failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const executeCheckOut = async () => {
    setIsProcessing(true);
    try {
      const res = await attendanceService.checkOut({ 
        date: new Date().toISOString(), 
        notes: checkInOutNotes,
        checkOutLocation: "Office - Detected IP"
      });
      setTodayAttendance(res.attendance);
      setShowCheckOutModal(false);
      setCheckInOutNotes("");
      refreshDataSilently();
    } catch (err) {
      alert(err.response?.data?.message || "Check out failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const submitRegularization = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Find the attendance ID for the date using local date string comparison
      const attendanceRecord = historyData.find(r => {
        const d = new Date(r.date);
        const localDateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        return localDateStr === regData.date;
      });
      if (!attendanceRecord) return alert("No attendance record found for this date to regularize.");

      await attendanceService.requestRegularization({
        attendanceId: attendanceRecord._id,
        reason: regData.reason,
        type: regData.type,
        requestedChanges: { targetStatus: "Present" }
      });
      
      setShowRegModal(false);
      setRegData({ date: "", reason: "", type: "Missing Punch", requestedChanges: {} });
      refreshDataSilently();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request");
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshDataSilently = async () => {
    const [history, summary, regs] = await Promise.all([
      attendanceService.getMonthlyAttendance(selectedMonth, selectedYear),
      attendanceService.getAttendanceSummary(selectedMonth, selectedYear),
      attendanceService.getRegularizationRequests()
    ]);
    setHistoryData(history);
    setSummaryStats(summary);
    setRegularizationReqs(regs);
  };

  // Format Helpers
  const formatTime = (date) => date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatBackendTime = (dateString) => dateString ? new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const formatHours = (decimalHours) => {
    if (!decimalHours) return "0h 0m";
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    return `${h}h ${m}m`;
  };
  const formatLiveTimer = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Derived States
  const isClockedIn = todayAttendance && todayAttendance.checkInTime && !todayAttendance.checkOutTime;
  const isClockedOut = todayAttendance && todayAttendance.checkOutTime;
  const currentMonthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' });
  const missingPunches = historyData.filter(r => r.missingPunch && r.regularizationStatus !== "Approved" && r.regularizationStatus !== "Pending");

  // Logic for Working Days & Percentage
  const getWorkingDaysInMonth = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    let workingDays = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(selectedYear, selectedMonth - 1, i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isHoliday = holidaysData.includes(i.toString());
      if (!isWeekend && !isHoliday) workingDays++;
    }
    return workingDays;
  };
  
  const totalWorkingDays = getWorkingDaysInMonth();
  const presentCount = summaryStats?.present || 0;
  const attendancePercentage = totalWorkingDays > 0 ? Math.round((presentCount / totalWorkingDays) * 100) : 0;

  // Recent Alerts from History & Regularizations
  const recentAlerts = [];
  historyData.forEach(r => {
    if (r.missingPunch && r.regularizationStatus !== "Approved") {
      recentAlerts.push({ id: `mp-${r._id}`, title: "Missing Punch Alert", time: new Date(r.date).toLocaleDateString(), type: "warning" });
    }
    if (r.status === "Late") {
      recentAlerts.push({ id: `lt-${r._id}`, title: "Late Arrival Warning", time: new Date(r.date).toLocaleDateString(), type: "warning" });
    }
  });
  regularizationReqs.forEach(req => {
    recentAlerts.push({ 
      id: `reg-${req._id}`, 
      title: `Regularization ${req.status}`, 
      time: new Date(req.createdAt).toLocaleDateString(), 
      type: req.status === "Approved" ? "success" : req.status === "Rejected" ? "error" : "warning" 
    });
  });
  const sortedAlerts = recentAlerts.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  const filteredHistory = filterStatus === "All Records" 
    ? historyData 
    : historyData.filter(row => row.status === filterStatus);

  const handlePrevMonth = () => {
    // Prevent going before DOJ
    if (myProfile?.doj) {
      const doj = new Date(myProfile.doj);
      if (selectedYear === doj.getFullYear() && selectedMonth <= doj.getMonth() + 1) {
        return;
      }
    }

    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1) return;
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f3f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f3f5] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">My Attendance</h1>
          <p className="text-sm text-[#8f9192] mt-1">Track your daily attendance, working hours, and regularizations.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* MISSING PUNCH ALERTS */}
      {missingPunches.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle size={24} className="text-amber-600" />
            <div>
              <p className="font-bold">Missing Punch Detected</p>
              <p className="text-sm text-amber-700">You have {missingPunches.length} records with a missing check-out. Please request regularization.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setRegData(prev => ({ ...prev, type: "Missing Punch", date: missingPunches[0].date.split("T")[0] }));
              setShowRegModal(true);
            }}
            className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-sm whitespace-nowrap"
          >
            Request Regularization
          </button>
        </div>
      )}

      {/* TOP GRID: CLOCK WIDGET & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        
        {/* Clock In/Out Widget */}
        <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden xl:col-span-1 lg:col-span-1">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-2xl"></div>
          
          <div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h2 className="text-sm font-bold text-[#8f9192] uppercase tracking-wider">Clock Action</h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isClockedIn ? 'bg-emerald-100 text-emerald-700' : 
                isClockedOut ? 'bg-blue-100 text-blue-700' : 'bg-[#f0f3f5] text-[#8f9192]'
              }`}>
                {isClockedIn ? 'Clocked In' : isClockedOut ? 'Shift Ended' : 'Not Clocked In'}
              </span>
            </div>
            
            {isClockedIn ? (
              <div className="text-center my-4 relative z-10">
                <div className="text-4xl font-black text-[#3B82F6] tabular-nums tracking-tight mb-1 animate-pulse">
                  {formatLiveTimer(liveWorkedSeconds)}
                </div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Live Working Hours</p>
              </div>
            ) : (
              <div className="text-center my-6 relative z-10">
                <div className="text-4xl font-black text-[#1E293B] tabular-nums tracking-tight mb-1">
                  {formatTime(currentTime)}
                </div>
                <p className="text-sm text-[#8f9192] font-medium">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 relative z-10">
            <button 
              onClick={() => isClockedIn ? setShowCheckOutModal(true) : setShowCheckInModal(true)}
              disabled={isClockedOut}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-sm ${
                isClockedOut ? "bg-[#f0f3f5] text-[#bdc2c7] cursor-not-allowed" :
                isClockedIn 
                  ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100" 
                  : "bg-[#3B82F6] text-[#fdfdfe] hover:bg-[#3B82F6]/90 shadow-[#3B82F6]/20"
              }`}
            >
              {isClockedOut ? <CheckCircle size={18} /> : isClockedIn ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              {isClockedOut ? "Completed" : isClockedIn ? "Clock Out" : "Clock In"}
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-[#8f9192] mt-4 pt-4 border-t border-[#d6d9df]">
              <MapPin size={12} /> Office Location Detected
            </div>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="lg:col-span-2 xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-[#3B82F6] to-indigo-600 rounded-2xl p-5 shadow-sm text-white flex flex-col justify-center">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-white/20">
                <CalendarDays size={22} className="text-white" />
              </div>
              <span className="text-3xl font-black">{attendancePercentage}%</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-1">Attendance Score</p>
              <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
                <div className="bg-white h-1.5 rounded-full" style={{ width: `${attendancePercentage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm flex flex-col justify-center hover:border-[#bdc2c7] transition-colors">
            <h3 className="text-3xl font-black text-slate-800 mb-1">{summaryStats?.present || 0}</h3>
            <p className="text-sm font-semibold text-[#8f9192]">Days Present</p>
            <p className="text-xs text-[#bdc2c7] mt-1">Out of {totalWorkingDays} Working Days</p>
          </div>

          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm flex flex-col justify-center hover:border-[#bdc2c7] transition-colors">
            <h3 className="text-3xl font-black text-slate-800 mb-1">{summaryStats?.absent || 0}</h3>
            <p className="text-sm font-semibold text-[#8f9192]">Days Absent</p>
            <p className="text-xs text-[#bdc2c7] mt-1">Excludes Holidays & Weekends</p>
          </div>

          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm flex flex-col justify-center hover:border-[#bdc2c7] transition-colors">
            <h3 className="text-3xl font-black text-slate-800 mb-1">{summaryStats?.late || 0}</h3>
            <p className="text-sm font-semibold text-[#8f9192]">Late Arrivals</p>
            <p className="text-xs text-[#bdc2c7] mt-1">Past 09:15 AM Shift Start</p>
          </div>

          {/* Today's Overview */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] p-5 shadow-sm sm:col-span-2 xl:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[#d6d9df]">
             <div className="px-4 first:pl-0">
               <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Check In</p>
               <p className="text-lg font-bold text-slate-800">{formatBackendTime(todayAttendance?.checkInTime)}</p>
             </div>
             <div className="px-4">
               <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Check Out</p>
               <p className="text-lg font-bold text-slate-800">{formatBackendTime(todayAttendance?.checkOutTime)}</p>
             </div>
             <div className="px-4">
               <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Total Hours</p>
               <p className="text-lg font-bold text-[#1E293B]">
                  {isClockedIn ? formatLiveTimer(liveWorkedSeconds) : formatHours(todayAttendance?.totalWorkingHours)}
               </p>
             </div>
             <div className="px-4">
               <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Overtime</p>
               <p className="text-lg font-bold text-slate-800">{formatHours(todayAttendance?.overtimeHours)}</p>
             </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* History Table */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#d6d9df] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <History size={20} className="text-[#1E293B]" />
                Attendance History
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 border border-[#d6d9df] rounded-lg text-sm text-[#8f9192] bg-[#fdfdfe]">
                  <Filter size={14} />
                  <select 
                    className="bg-transparent outline-none font-semibold text-slate-800"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All Records">All Records</option>
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Weekend">Weekend</option>
                    <option value="WFH">WFH</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#f0f3f5] text-[#8f9192] text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Date</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Status</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Check In</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Check Out</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Hours</th>
                    <th className="p-4 font-bold border-b border-[#d6d9df]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredHistory.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-[#8f9192]">No records found.</td></tr>
                  ) : filteredHistory.map((row) => (
                    <tr key={row._id} className="border-b border-[#d6d9df] hover:bg-[#f0f3f5]/50 transition-colors last:border-0">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{new Date(row.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-xs text-[#8f9192]">{new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          ['Present', 'WFH'].includes(row.status) ? 'bg-emerald-100 text-emerald-700' :
                          row.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                          ['On Leave', 'Half Day'].includes(row.status) ? 'bg-purple-100 text-purple-700' :
                          'bg-[#f0f3f5] text-[#8f9192]'
                        }`}>
                          {row.status}
                        </span>
                        {row.missingPunch && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500" title="Missing Punch"></span>}
                      </td>
                      <td className="p-4 font-medium">{formatBackendTime(row.checkInTime)}</td>
                      <td className="p-4 font-medium">{row.missingPunch ? <span className="text-red-500 font-bold">Missing</span> : formatBackendTime(row.checkOutTime)}</td>
                      <td className="p-4 font-bold text-slate-800">{formatHours(row.totalWorkingHours)}</td>
                      <td className="p-4 text-xs text-[#8f9192] max-w-[150px] truncate" title={row.notes}>{row.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regularization Requests */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
             <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-[#1E293B]" />
                Regularization Requests
              </h2>
              <button 
                onClick={() => setShowRegModal(true)}
                className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                <Plus size={16} /> New Request
              </button>
            </div>
            
            <div className="space-y-3">
              {regularizationReqs.length === 0 ? (
                <p className="text-sm text-[#8f9192] text-center py-4">No active regularization requests.</p>
              ) : regularizationReqs.map((req) => (
                <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#d6d9df] hover:border-[#bdc2c7] transition-colors gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-800">{new Date(req.date).toLocaleDateString()}</span>
                      <span className="text-xs text-[#8f9192] px-2 py-0.5 bg-[#f0f3f5] rounded-md">{req.type}</span>
                    </div>
                    <p className="text-sm text-[#8f9192]">Reason: {req.reason}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                      req.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                      req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-[#f0f3f5] text-[#8f9192]'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Shift Information */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Briefcase size={20} className="text-[#1E293B]" />
              Shift Information
            </h2>
            <div className="bg-[#f0f3f5] p-4 rounded-xl border border-[#d6d9df]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-800">{myShift?.name || 'Standard Shift'}</span>
                <span className="text-xs font-bold text-[#1E293B] bg-[#3B82F6]/10 px-2 py-1 rounded-md">{myShift?.type || 'Fixed'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8f9192] mb-3">
                <Clock size={14} />
                {myShift?.startTime || '09:00'} - {myShift?.endTime || '18:00'}
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#d6d9df]">
                <span className="text-xs font-semibold text-[#8f9192] bg-[#fdfdfe] border border-[#d6d9df] px-2 py-1 rounded-md">Weekly Off: {myShift?.weeklyOffDays?.join(', ') || 'Sun'}</span>
                <span className="text-xs font-semibold text-[#8f9192] bg-[#fdfdfe] border border-[#d6d9df] px-2 py-1 rounded-md">Break: {myShift?.breakDuration || 1} Hr</span>
              </div>
            </div>
          </div>

          {/* Overtime & Balances */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-4">
                <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Total Overtime</p>
                <p className="text-2xl font-black text-slate-800 mb-1">
                  {formatHours(historyData.reduce((sum, h) => sum + (h.overtimeHours || 0), 0))}
                </p>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                   <Check size={12} /> Auto-calculated
                </p>
             </div>
             <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-4">
                <p className="text-xs font-semibold text-[#8f9192] uppercase tracking-wider mb-1">Approved Overtime</p>
                <p className="text-2xl font-black text-slate-800 mb-1">
                  {formatHours(historyData.filter(h => h.regularizationStatus === "Approved").reduce((sum, h) => sum + (h.overtimeHours || 0), 0))}
                </p>
                <p className="text-xs text-[#8f9192] font-semibold">Pending: {formatHours(historyData.filter(h => h.regularizationStatus !== "Approved").reduce((sum, h) => sum + (h.overtimeHours || 0), 0))}</p>
             </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Bell size={20} className="text-[#1E293B]" />
              Recent Alerts
            </h2>
            <div className="space-y-4">
              {sortedAlerts.map((notif) => (
                <div key={notif.id} className="flex gap-3">
                  <div className={`mt-0.5 rounded-full p-1.5 h-fit ${
                    notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                    notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {notif.type === 'warning' ? <AlertCircle size={14} /> : 
                     notif.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{notif.title}</p>
                    <p className="text-xs text-[#8f9192] mt-0.5">{notif.time}</p>
                  </div>
                </div>
              ))}
              {sortedAlerts.length === 0 && <p className="text-sm text-[#8f9192]">No recent alerts.</p>}
            </div>
          </div>
          
          {/* Monthly Calendar Overlay */}
          <div className="bg-[#fdfdfe] rounded-2xl border border-[#d6d9df] shadow-sm p-5">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays size={20} className="text-[#1E293B]" />
                <button 
                  onClick={handlePrevMonth} 
                  disabled={myProfile?.doj && selectedYear === new Date(myProfile.doj).getFullYear() && selectedMonth <= new Date(myProfile.doj).getMonth() + 1}
                  className="px-2 py-1 text-[#8f9192] hover:text-slate-800 hover:bg-[#f0f3f5] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >&lt;</button>
                {currentMonthName} {selectedYear}
                <button 
                  onClick={handleNextMonth} 
                  disabled={selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth() + 1}
                  className="px-2 py-1 text-[#8f9192] hover:text-slate-800 hover:bg-[#f0f3f5] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >&gt;</button>
              </h2>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-xs font-bold text-[#8f9192] py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                // Simple assumption for days in month mapping
                const dDate = new Date(selectedYear, selectedMonth - 1, day);
                if (dDate.getMonth() !== selectedMonth - 1) return null; // hide overflow days

                let statusClass = "text-slate-800 hover:bg-[#f0f3f5]";
                let dotClass = "bg-transparent";
                
                const rec = historyData.find(r => new Date(r.date).toDateString() === dDate.toDateString());
                const isHoliday = holidaysData.includes(day.toString());

                if (rec) {
                  if (rec.status === 'Present' || rec.status === 'Late') {
                    statusClass = "text-emerald-700 bg-emerald-50 border border-emerald-100 font-bold";
                  } else if (rec.status === 'Absent') {
                    statusClass = "text-rose-700 bg-rose-50 border border-rose-100";
                  } else if (rec.status === 'Half Day') {
                    statusClass = "text-amber-700 bg-amber-50 border border-amber-100";
                  }
                  if (rec.missingPunch) dotClass = "bg-red-500 animate-ping";
                } else if (isHoliday) {
                  statusClass = "text-blue-700 bg-blue-50 border border-blue-100 font-bold";
                } else if (dDate.getDay() === 0 || dDate.getDay() === 6) {
                  statusClass = "text-[#bdc2c7] bg-[#f0f3f5]/50"; 
                } else if (dDate < new Date()) {
                  statusClass = "text-rose-700 bg-rose-50 border border-rose-100"; // Absent if past & no record
                }

                if (dDate.toDateString() === new Date().toDateString()) {
                  statusClass = "text-[#fdfdfe] bg-[#3B82F6] font-bold shadow-md ring-2 ring-blue-300"; // Today highlight
                }

                return (
                  <div key={day} title={isHoliday ? "Company Holiday" : ""} className={`relative flex flex-col items-center justify-center h-10 rounded-xl border border-transparent transition-all cursor-pointer ${statusClass}`}>
                    <span className="text-xs z-10">{day}</span>
                    {dotClass !== "bg-transparent" && (
                      <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#8f9192] mt-4 pt-4 border-t border-[#d6d9df]">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Absent</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Holiday</div>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[#d6d9df]">
              <h2 className="text-xl font-bold text-slate-800">Confirm Check In</h2>
              <p className="text-sm text-[#8f9192] mt-1">Ready to start your shift for today?</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-center gap-3">
                <Clock className="text-blue-600" />
                <div>
                  <p className="text-xs uppercase font-bold text-blue-600">Current Time</p>
                  <p className="text-xl font-black">{formatTime(currentTime)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Remarks / Notes (Optional)</label>
                <textarea 
                  className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., Working from client site today"
                  value={checkInOutNotes}
                  onChange={(e) => setCheckInOutNotes(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-[#d6d9df] bg-[#f0f3f5] flex justify-end gap-3">
              <button disabled={isProcessing} onClick={() => setShowCheckInModal(false)} className="px-5 py-2.5 font-bold text-[#8f9192] hover:text-slate-800 transition-colors">Cancel</button>
              <button disabled={isProcessing} onClick={executeCheckIn} className="px-5 py-2.5 bg-[#3B82F6] text-white font-bold rounded-xl shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2">
                {isProcessing ? "Processing..." : <><Play size={16} fill="currentColor" /> Confirm Clock In</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[#d6d9df]">
              <h2 className="text-xl font-bold text-slate-800">Confirm Check Out</h2>
              <p className="text-sm text-[#8f9192] mt-1">You have worked for <span className="font-bold text-slate-800">{formatLiveTimer(liveWorkedSeconds)}</span> today.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Checkout Remarks (Optional)</label>
                <textarea 
                  className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Any handover notes?"
                  value={checkInOutNotes}
                  onChange={(e) => setCheckInOutNotes(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-[#d6d9df] bg-[#f0f3f5] flex justify-end gap-3">
              <button disabled={isProcessing} onClick={() => setShowCheckOutModal(false)} className="px-5 py-2.5 font-bold text-[#8f9192] hover:text-slate-800 transition-colors">Cancel</button>
              <button disabled={isProcessing} onClick={executeCheckOut} className="px-5 py-2.5 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 transition-colors flex items-center gap-2">
                {isProcessing ? "Processing..." : <><Square size={16} fill="currentColor" /> End Shift</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={submitRegularization} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[#d6d9df]">
              <h2 className="text-xl font-bold text-slate-800">Request Regularization</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Date</label>
                <input type="date" required className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={regData.date} onChange={e => setRegData({...regData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Type</label>
                <select className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={regData.type} onChange={e => setRegData({...regData, type: e.target.value})}>
                  <option value="Missing Punch">Missing Punch</option>
                  <option value="Late Arrival">Late Arrival</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Reason</label>
                <textarea required className="w-full border border-[#d6d9df] rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={regData.reason} onChange={e => setRegData({...regData, reason: e.target.value})} rows="3"></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-[#d6d9df] bg-[#f0f3f5] flex justify-end gap-3">
              <button type="button" onClick={() => setShowRegModal(false)} className="px-5 py-2.5 font-bold text-[#8f9192] hover:text-slate-800 transition-colors">Cancel</button>
              <button type="submit" disabled={isProcessing} className="px-5 py-2.5 bg-[#3B82F6] text-white font-bold rounded-xl shadow-md hover:bg-blue-600 transition-colors">
                {isProcessing ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}