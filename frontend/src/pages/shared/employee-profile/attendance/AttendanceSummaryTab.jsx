import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText,
  Download,
  History,
  Loader2
} from 'lucide-react';

export default function AttendanceSummaryTab({ employee }) {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    employee: {},
    shift: null,
    statistics: {
      totalPresentDays: 0,
      totalAbsentDays: 0,
      totalHalfDays: 0,
      lateArrivals: 0,
      paidLeaves: 0,
      unpaidLeaves: 0,
      totalWorkingHours: 0,
      totalOvertimeHours: 0,
      averageWorkingHours: 0,
      attendancePercentage: 0
    },
    calendar: []
  });
  
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    if (!employee || !employee._id) return;
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/attendance/all/employee/${employee._id}/summary?month=${currentMonth}&year=${currentYear}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAttendanceData(data);
          
          // If current month, select today, else select 1st
          const now = new Date();
          if (now.getMonth() + 1 === currentMonth && now.getFullYear() === currentYear) {
            setSelectedDate(now.getDate());
          } else {
            setSelectedDate(1);
          }
        }
      } catch (err) {
        console.error("Failed to fetch attendance summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [employee, currentMonth, currentYear]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDayColors = (state, isSelected) => {
    if (isSelected) return 'bg-blue-600 text-white shadow-md border-blue-600';
    
    switch(state) {
      case 'Present': return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100';
      case 'Absent': return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100';
      case 'Leave': return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100';
      case 'Half Day': return 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100';
      case 'Late': return 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100';
      case 'Holiday': return 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100';
      case 'Week Off': return 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100';
      default: return 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';
    }
  };

  const getStatusBadge = (state) => {
    switch(state) {
      case 'Present': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700">Present</span>;
      case 'Absent': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">Absent</span>;
      case 'Leave': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">Leave</span>;
      case 'Half Day': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700">Half Day</span>;
      case 'Late': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700">Late</span>;
      case 'Week Off': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">Week Off</span>;
      case 'Holiday': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-sky-100 text-sky-700">Holiday</span>;
      default: return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">{state || 'Pending'}</span>;
    }
  };

  const { statistics, calendar, shift, employee: empData } = attendanceData;
  const selectedDayData = calendar.find(d => d.dayNumber === selectedDate) || {};

  // For calendar grid rendering, we need to pad the start of the month
  const startingDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const paddedCalendar = Array(startingDayOfWeek).fill(null).concat(calendar);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Section */}
      <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B]">Attendance Summary</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-[#8f9192]">
            <p><span className="font-semibold text-[#475569]">Employee:</span> {empData?.firstName} {empData?.lastName} ({empData?.employeeId})</p>
            <p><span className="font-semibold text-[#475569]">Dept:</span> {empData?.department}</p>
            <p><span className="font-semibold text-[#475569]">Shift:</span> {shift?.name || 'Not Assigned'} {shift && `(${shift.startTime} - ${shift.endTime})`}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-[#f0f3f5] p-1.5 rounded-lg border border-[#d6d9df]">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded shadow-sm transition-all text-[#475569]">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 px-2 font-bold text-[#1E293B] min-w-[140px] justify-center">
            <CalendarIcon size={16} className="text-[#3B82F6]" />
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded shadow-sm transition-all text-[#475569]">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 2. Attendance Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#8f9192] uppercase tracking-wider mb-1">Present Days</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">{statistics.totalPresentDays}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#8f9192] uppercase tracking-wider mb-1">Absent Days</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">{statistics.totalAbsentDays}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle size={16} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#8f9192] uppercase tracking-wider mb-1">Half Days</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">{statistics.totalHalfDays}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Clock size={16} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-yellow-100 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#8f9192] uppercase tracking-wider mb-1">Late Arrivals</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">{statistics.lateArrivals}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
              <AlertCircle size={16} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#8f9192] uppercase tracking-wider mb-1">Leaves</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">{statistics.paidLeaves + statistics.unpaidLeaves}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText size={16} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Attendance Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#d6d9df] shadow-sm p-5">
          <h3 className="text-base font-bold text-[#1E293B] mb-4">Monthly Calendar</h3>
          
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-[#8f9192] uppercase py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {paddedCalendar.map((dayObj, index) => {
              if (!dayObj) {
                return <div key={`empty-${index}`} className="h-20 sm:h-24 rounded-lg bg-gray-50 border border-gray-100 opacity-50"></div>;
              }
              
              const isSelected = selectedDate === dayObj.dayNumber;
              const isToday = dayObj.dayNumber === new Date().getDate() && currentMonth === new Date().getMonth() + 1 && currentYear === new Date().getFullYear();
              
              return (
                <button
                  key={dayObj.dayNumber}
                  onClick={() => setSelectedDate(dayObj.dayNumber)}
                  className={`relative flex flex-col items-center justify-center h-20 sm:h-24 rounded-lg border transition-all hover:scale-[1.02] active:scale-95 ${getDayColors(dayObj.status, isSelected)} ${isToday && !isSelected ? 'border-2 border-blue-500 shadow-sm' : ''}`}
                >
                  <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-[#1E293B]'}`}>
                    {dayObj.dayNumber}
                  </span>
                  
                  {dayObj.status && dayObj.status !== 'Pending' && (
                    <span className={`mt-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isSelected ? 'bg-white/20 text-white' : ''} ${!isSelected && dayObj.status === 'Leave' ? 'text-blue-700' : ''} ${!isSelected && dayObj.status === 'Late' ? 'text-yellow-700' : ''} ${!isSelected && dayObj.status === 'Half Day' ? 'text-orange-700' : ''} ${!isSelected && dayObj.status === 'Week Off' ? 'text-gray-500' : ''}`}>
                      {dayObj.status}
                    </span>
                  )}

                  {/* Regularized Badge */}
                  {dayObj.isRegularized && (
                     <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-500 shadow" title="Attendance Regularized"></div>
                  )}
                  
                  {isToday && <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Right Side - Details & Summary */}
        <div className="space-y-6">
          
          {/* Details Card */}
          <div className="bg-white rounded-xl border border-[#d6d9df] shadow-sm p-5">
            <h3 className="text-base font-bold text-[#1E293B] mb-4 flex items-center justify-between">
              Attendance Details
              <span className="text-sm font-semibold text-blue-600">
                {new Date(currentYear, currentMonth - 1, selectedDate).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-[#8f9192]">Status</span>
                {getStatusBadge(selectedDayData.status)}
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-[#8f9192]">Shift</span>
                <span className="text-sm font-semibold text-[#1E293B]">
                  {selectedDayData.shift ? `${selectedDayData.shift} ${shift?.startTime ? `(${shift.startTime} - ${shift.endTime})` : ''}` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-[#8f9192]">Check In</span>
                <span className="text-sm font-semibold text-[#1E293B]">{selectedDayData.checkIn || '—'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-[#8f9192]">Check Out</span>
                <span className="text-sm font-semibold text-[#1E293B]">{selectedDayData.checkOut || '—'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-[#8f9192]">Working Hours</span>
                <span className="text-sm font-semibold text-[#1E293B]">{selectedDayData.workingHours > 0 ? `${selectedDayData.workingHours.toFixed(1)} hrs` : '—'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-[#8f9192]">Overtime</span>
                <span className="text-sm font-semibold text-emerald-600">{selectedDayData.overtimeHours > 0 ? `${selectedDayData.overtimeHours.toFixed(1)} hrs` : '—'}</span>
              </div>
              <div className="pt-1">
                <span className="block text-xs font-semibold text-[#8f9192] uppercase mb-1">Remarks</span>
                <p className="text-sm text-[#1E293B] bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {selectedDayData.remarks || 'No remarks.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl border border-[#d6d9df] shadow-sm">
              <p className="text-[10px] font-bold text-[#8f9192] uppercase">Total Hours</p>
              <p className="text-lg font-bold text-[#1E293B] mt-0.5">{statistics.totalWorkingHours} hrs</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#d6d9df] shadow-sm">
              <p className="text-[10px] font-bold text-[#8f9192] uppercase">Overtime</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">{statistics.totalOvertimeHours} hrs</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#d6d9df] shadow-sm">
              <p className="text-[10px] font-bold text-[#8f9192] uppercase">Avg Working Hrs</p>
              <p className="text-lg font-bold text-[#1E293B] mt-0.5">{statistics.averageWorkingHours} hrs</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#d6d9df] shadow-sm">
              <p className="text-[10px] font-bold text-[#8f9192] uppercase">Attendance %</p>
              <p className="text-lg font-bold text-[#3B82F6] mt-0.5">{statistics.attendancePercentage}%</p>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#d6d9df]">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d6d9df] text-[#1E293B] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} className="text-[#3B82F6]" />
          Download Monthly Report
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d6d9df] text-[#1E293B] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          <FileText size={16} className="text-emerald-600" />
          Export Attendance
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d6d9df] text-[#1E293B] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm ml-auto">
          <History size={16} className="text-[#8f9192]" />
          View Attendance History
        </button>
      </div>

    </div>
  );
}
