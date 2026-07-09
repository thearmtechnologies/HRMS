const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { Holiday } = require('../models/HolidaysStructure');
const Project = require('../models/Project');
const SalaryFixed = require('../models/SalaryFixed');
const { notify } = require('./notificationService');

/**
 * Reminder 1: Employee has not Clocked In after shift start.
 * Checks active employees who do not have an attendance record for today.
 */
const checkMissingClockIn = async () => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const activeEmployees = await Employee.find({ isActive: true });
    
    for (const emp of activeEmployees) {
      if (!emp.user) continue;
      const att = await Attendance.findOne({ employeeId: emp._id, date: todayStr });
      if (!att || !att.punchInTime) {
        await notify({
          recipient: emp.user,
          title: 'Missing Clock-In Reminder',
          message: 'You have not clocked in for your shift today. Please mark your attendance.',
          type: 'attendance',
          module: 'attendance',
          priority: 'high',
          link: '/employee/attendance'
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error('❌ Error in checkMissingClockIn reminder:', error.message);
  }
};

/**
 * Reminder 2: Employee forgot Clock Out.
 * Checks attendance records for today where punchInTime exists but punchOutTime is missing.
 */
const checkMissingClockOut = async () => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const attendances = await Attendance.find({ date: todayStr, punchInTime: { $ne: null }, punchOutTime: null });

    for (const att of attendances) {
      const emp = await Employee.findById(att.employeeId);
      if (emp && emp.user) {
        await notify({
          recipient: emp.user,
          title: 'Forgot Clock-Out Reminder',
          message: 'Your shift has ended but you have not clocked out yet. Please remember to punch out.',
          type: 'attendance',
          module: 'attendance',
          priority: 'high',
          link: '/employee/attendance'
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error('❌ Error in checkMissingClockOut reminder:', error.message);
  }
};

/**
 * Reminder 3: Leave starts tomorrow.
 * Checks approved leave applications where startDate is tomorrow.
 */
const checkLeaveStartingTomorrow = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const leaves = await LeaveRequest.find({ status: 'Approved', startDate: tomorrowStr });
    for (const leave of leaves) {
      const emp = await Employee.findById(leave.employeeId);
      if (emp && emp.user) {
        await notify({
          recipient: emp.user,
          title: 'Upcoming Leave Reminder',
          message: `Your approved ${leave.leaveType} starts tomorrow (${tomorrowStr}). Enjoy your leave!`,
          type: 'leave',
          module: 'leave_management',
          priority: 'medium',
          link: '/employee/leaves'
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error('❌ Error in checkLeaveStartingTomorrow reminder:', error.message);
  }
};

/**
 * Reminder 4: Holiday tomorrow.
 * Checks holiday calendar for holidays falling on tomorrow's date.
 */
const checkHolidayTomorrow = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const holidays = await Holiday.find({ date: tomorrowStr, isActive: true });
    if (holidays.length === 0) return;

    const activeEmployees = await Employee.find({ isActive: true });
    for (const holiday of holidays) {
      for (const emp of activeEmployees) {
        if (!emp.user) continue;
        await notify({
          recipient: emp.user,
          title: 'Holiday Tomorrow!',
          message: `Tomorrow is a holiday: ${holiday.name}. Have a great day off!`,
          type: 'holiday',
          module: 'holiday_management',
          priority: 'medium',
          link: '/employee/holidays'
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error('❌ Error in checkHolidayTomorrow reminder:', error.message);
  }
};

/**
 * Reminder 5: Task deadline approaching.
 * Checks active projects/tasks with due dates in the next 24-48 hours.
 */
const checkApproachingTaskDeadlines = async () => {
  try {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const projects = await Project.find({ status: { $nin: ['Completed', 'Archived'] } });
    for (const proj of projects) {
      if (!proj.tasks) continue;
      for (const task of proj.tasks) {
        if (task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) <= in48Hours && new Date(task.dueDate) >= now) {
          if (task.assignedTo) {
            await notify({
              recipient: task.assignedTo,
              title: 'Task Deadline Approaching',
              message: `Task "${task.title}" in project "${proj.name}" is due by ${new Date(task.dueDate).toLocaleDateString()}.`,
              type: 'task',
              module: 'projects',
              priority: 'high',
              link: `/projects/${proj._id}`
            }).catch(() => {});
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in checkApproachingTaskDeadlines reminder:', error.message);
  }
};

/**
 * Reminder 6: Verification pending.
 * Reminds employees whose verification status is still 'pending' or 'rejected'.
 */
const checkPendingVerifications = async () => {
  try {
    const employees = await Employee.find({ isActive: true, verificationStatus: { $in: ['pending', 'rejected', 'unverified'] } });
    for (const emp of employees) {
      if (!emp.user) continue;
      await notify({
        recipient: emp.user,
        title: 'Verification Pending Reminder',
        message: 'Your profile verification is incomplete. Please submit your PAN, Aadhaar, and Bank details.',
        type: 'verification',
        module: 'verification',
        priority: 'high',
        link: '/employee/verification'
      }).catch(() => {});
    }
  } catch (error) {
    console.error('❌ Error in checkPendingVerifications reminder:', error.message);
  }
};

/**
 * Reminder 7: Payroll available.
 * Reminds employees when their current salary or payslip is available.
 */
const checkAvailablePayroll = async () => {
  try {
    const activeEmployees = await Employee.find({ isActive: true });
    for (const emp of activeEmployees) {
      if (!emp.user) continue;
      const salary = await SalaryFixed.findOne({ employeeId: emp._id });
      if (salary) {
        await notify({
          recipient: emp.user,
          title: 'Payroll Available',
          message: 'Your payroll structure and payslip information are now available for viewing.',
          type: 'payroll',
          module: 'payroll',
          priority: 'medium',
          link: '/employee/salary'
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error('❌ Error in checkAvailablePayroll reminder:', error.message);
  }
};

module.exports = {
  checkMissingClockIn,
  checkMissingClockOut,
  checkLeaveStartingTomorrow,
  checkHolidayTomorrow,
  checkApproachingTaskDeadlines,
  checkPendingVerifications,
  checkAvailablePayroll
};
