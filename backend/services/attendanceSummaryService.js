const Employee = require('../models/Employee');
const Shift = require('../models/Shift');
const HolidaysStructure = require('../models/HolidaysStructure');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveType = require('../models/LeaveType');
const Attendance = require('../models/Attendance');
const { getActiveShiftForDate } = require('../utils/shiftUtils');

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_MINUTE = 1000 * 60;

class AttendanceSummaryService {
  async getMonthlySummary(employeeId, month, year) {
    const employee = await Employee.findById(employeeId).populate('overtimePolicy').populate('shiftHistory.shift');
    if (!employee) throw new Error('Employee not found');

    const topLevelShift = await Shift.findById(employee.shift);
    employee.shift = topLevelShift; // Attach for the utility to fallback on

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const activeLeaveTypes = await LeaveType.find({ isActive: true });
    const daysInMonth = endDate.getDate();

    // 1. Fetch raw attendance records
    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: { $gte: startDate, $lte: endDate }
    });
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      const dateKey = this.formatDateKey(record.date);
      attendanceMap.set(dateKey, record);
    });

    // 2. Fetch approved leaves
    const leaves = await LeaveRequest.find({
      employee: employee._id,
      status: 'Approved',
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ]
    }).populate('leaveType');
    
    // 3. Fetch holidays
    // Based on Enterprise Holidays Schema
    const holidayDocs = await HolidaysStructure.find({
      $or: [
        { startDate: { $regex: `^${year}-${String(month).padStart(2, '0')}` } },
        { repeatEveryYear: true } // Could be optimized, but ok for now
      ]
    });

    // Map holidays by date
    const holidayMap = new Map();
    holidayDocs.forEach(h => {
      const hStart = new Date(h.startDate);
      const hEnd = new Date(h.endDate);
      
      // If repeatEveryYear, adjust the year to current year being queried
      if (h.repeatEveryYear) {
        hStart.setFullYear(year);
        hEnd.setFullYear(year);
      }
      
      // Filter out excluded years/dates
      if (h.excludedYears && h.excludedYears.includes(year)) return;
      
      for (let d = new Date(hStart); d <= hEnd; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() + 1 === parseInt(month)) {
          const dateStr = this.formatDateKey(d);
          if (h.excludedDates && h.excludedDates.includes(dateStr)) continue;
          holidayMap.set(dateStr, h);
        }
      }
    });

    // Map leaves by date
    const leaveMap = new Map();
    leaves.forEach(l => {
      const lStart = new Date(Math.max(l.startDate, startDate));
      const lEnd = new Date(Math.min(l.endDate, endDate));
      for (let d = new Date(lStart); d <= lEnd; d.setDate(d.getDate() + 1)) {
        leaveMap.set(this.formatDateKey(d), l);
      }
    });

    const calendar = [];
    let stats = {
      totalPresentDays: 0,
      totalAbsentDays: 0,
      totalHalfDays: 0,
      paidLeaves: 0,
      unpaidLeaves: 0,
      holidays: 0,
      weekends: 0,
      totalWorkingHours: 0,
      totalOvertimeHours: 0,
      lateArrivals: 0,
      earlyExits: 0
    };

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month - 1, i, 12, 0, 0); // Use 12:00 to avoid timezone shifts
      const dateKey = this.formatDateKey(currentDate);
      const dayName = daysOfWeek[currentDate.getDay()];
      
      const activeShift = getActiveShiftForDate(employee, currentDate);
      const weeklyOffDays = activeShift ? activeShift.weeklyOffDays : ['Sunday'];

      const attRecord = attendanceMap.get(dateKey);
      const leaveRecord = leaveMap.get(dateKey);
      const holidayRecord = holidayMap.get(dateKey);
      
      const isWeekend = weeklyOffDays.includes(dayName);
      
      let dayData = {
        date: dateKey,
        dayNumber: i,
        status: '',
        checkIn: attRecord && attRecord.checkInTime ? this.formatTime(attRecord.checkInTime) : null,
        checkOut: attRecord && attRecord.checkOutTime ? this.formatTime(attRecord.checkOutTime) : null,
        workingHours: 0,
        overtimeHours: 0,
        lateMinutes: 0,
        shift: activeShift ? activeShift.name : null,
        shiftObj: activeShift, // store for top-level usage later if needed
        leaveType: leaveRecord ? (leaveRecord.leaveType?.name || 'Leave') : null,
        holiday: !!holidayRecord,
        weekend: isWeekend,
        remarks: '',
        isRegularized: false,
        regularizationStatus: null
      };

      // Calculate working hours
      if (attRecord && attRecord.checkInTime && attRecord.checkOutTime) {
        dayData.workingHours = (attRecord.checkOutTime - attRecord.checkInTime) / MS_PER_HOUR;
        stats.totalWorkingHours += dayData.workingHours;
      }

      // Calculate late minutes based on shift
      if (attRecord && attRecord.checkInTime && activeShift) {
        const [shiftHour, shiftMin] = activeShift.startTime.split(':').map(Number);
        const shiftStart = new Date(currentDate);
        shiftStart.setHours(shiftHour, shiftMin, 0, 0);
        
        // Add grace period
        if (activeShift.lateCheckInGraceTime) {
          shiftStart.setMinutes(shiftStart.getMinutes() + activeShift.lateCheckInGraceTime);
        }

        if (attRecord.checkInTime > shiftStart) {
          dayData.lateMinutes = Math.floor((attRecord.checkInTime - shiftStart) / MS_PER_MINUTE);
          if (dayData.lateMinutes > 0) {
            stats.lateArrivals++;
          }
        }
      }

      // Calculate overtime (reusing same logic)
      if (attRecord && attRecord.overtimeHours > 0 && employee.isOvertimeApplicable) {
        if (employee.overtimePolicy) {
          const minOT = employee.overtimePolicy.minimumOvertimeHours || 0;
          if (attRecord.overtimeHours >= minOT) {
            dayData.overtimeHours = attRecord.overtimeHours;
            stats.totalOvertimeHours += attRecord.overtimeHours;
          }
        } else {
          // Legacy fallback
          dayData.overtimeHours = attRecord.overtimeHours;
          stats.totalOvertimeHours += attRecord.overtimeHours;
        }
      }
      
      // Determine Status Priority
      // 1. Check Attendance Record
      if (attRecord) {
        if (['Present', 'WFH'].includes(attRecord.status)) {
          dayData.status = 'Present';
          stats.totalPresentDays++;
          
          if (attRecord.status === 'WFH') dayData.remarks = 'Worked from home';
          if (dayData.lateMinutes > 0) dayData.status = 'Late'; // Override visual status to late
          
        } else if (attRecord.status === 'Half Day') {
          dayData.status = 'Half Day';
          stats.totalHalfDays++;
        } else if (attRecord.status === 'Absent') {
          dayData.status = 'Absent';
          stats.totalAbsentDays++;
        } else if (attRecord.status === 'Late') {
          dayData.status = 'Late';
          stats.totalPresentDays++;
        }

        // Regularization detection
        if (attRecord.regularizationStatus) {
            dayData.isRegularized = attRecord.regularizationStatus === 'Approved';
            dayData.regularizationStatus = attRecord.regularizationStatus;
            if (dayData.isRegularized) {
                dayData.remarks = 'Attendance Regularized';
            }
        }
      } 
      // 2. Check Leaves
      else if (leaveRecord) {
        dayData.status = 'Leave';
        
        const lType = activeLeaveTypes.find(lt => lt.name === leaveRecord.leaveType);
        dayData.payrollImpact = lType ? lType.payrollImpact : (["Casual Leave", "Sick Leave", "Earned Leave", "Comp Off", "Work From Home"].includes(leaveRecord.leaveType) ? "Paid Leave" : "Unpaid Leave");
        
        if (dayData.payrollImpact === "Paid Leave" || dayData.payrollImpact === "Half Paid Leave") {
          stats.paidLeaves++;
        } else {
          stats.unpaidLeaves++;
        }
        dayData.remarks = `On Leave: ${dayData.leaveType}`;
      } 
      // 3. Check Holidays
      else if (holidayRecord) {
        dayData.status = 'Holiday';
        stats.holidays++;
        dayData.remarks = holidayRecord.name;
      } 
      // 4. Check Weekends
      else if (isWeekend) {
        dayData.status = 'Week Off';
        stats.weekends++;
        dayData.remarks = 'Weekly Off';
      } 
      // 5. Default to Absent if it's a past date and no record exists
      else if (currentDate < today) {
        dayData.status = 'Absent';
        stats.totalAbsentDays++;
        dayData.remarks = 'Did not check in';
      } 
      // 6. Future dates
      else {
        dayData.status = 'Pending';
      }

      calendar.push(dayData);
    }

    // Calculate attendance percentage
    // Exclude future dates, weekends, and holidays from expected working days
    let expectedDays = 0;
    let actualDays = 0;

    for (let i = 0; i < calendar.length; i++) {
        const d = calendar[i];
        const dDate = new Date(year, month - 1, d.dayNumber);
        
        if (dDate < today && !d.holiday && !d.weekend) {
            expectedDays++;
            
            if (d.status === 'Present' || d.status === 'Late' || d.status === 'WFH') actualDays += 1;
            else if (d.status === 'Half Day') actualDays += 0.5;
            else if (d.status === 'Leave') {
                if (d.payrollImpact === 'Paid Leave') actualDays += 1;
                else if (d.payrollImpact === 'Half Paid Leave') actualDays += 0.5;
            }
        }
    }

    stats.attendancePercentage = expectedDays > 0 ? ((actualDays / expectedDays) * 100).toFixed(1) : 0;
    
    // Calculate average working hours
    const daysWorked = stats.totalPresentDays + stats.totalHalfDays;
    stats.averageWorkingHours = daysWorked > 0 ? (stats.totalWorkingHours / daysWorked).toFixed(1) : 0;

    // Round working and overtime hours
    stats.totalWorkingHours = parseFloat(stats.totalWorkingHours.toFixed(1));
    stats.totalOvertimeHours = parseFloat(stats.totalOvertimeHours.toFixed(1));

    return {
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department?.departmentName || (typeof employee.department === 'string' ? employee.department : 'Engineering')
      },
      shift: topLevelShift ? {
        name: topLevelShift.name,
        startTime: topLevelShift.startTime,
        endTime: topLevelShift.endTime
      } : null,
      statistics: stats,
      calendar,
      selectedDay: null // Can be set by frontend
    };
  }

  formatTime(dateObj) {
    if (!dateObj) return null;
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  formatDateKey(dateObj) {
    if (!dateObj) return null;
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

module.exports = new AttendanceSummaryService();
