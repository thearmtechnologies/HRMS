const Attendance = require('../../../models/Attendance');
const { findCompanyRecords } = require('../../../utils/tenantUtils');
const { buildReportResponse } = require('../../../utils/reportBuilder');
const { ATTENDANCE_DAILY, ATTENDANCE_LATE, ATTENDANCE_OVERTIME } = require('../../../config/reportColumns');

const populateOptions = [{
  path: 'employee',
  select: 'employeeId firstName lastName fullName department designation workLocation',
  populate: { path: 'department', select: 'name departmentName' }
}];

const pad = (value) => String(value).padStart(2, '0');

const formatDateLabel = (date) => date.toLocaleDateString('en-GB');

const formatTimeLabel = (date) => date
  ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  : '—';

const getRangeFromQuery = (req, defaultsToToday = false) => {
  if (req.query.startDate && req.query.endDate) {
    return {
      start: new Date(req.query.startDate),
      end: new Date(req.query.endDate),
      label: `${req.query.startDate} to ${req.query.endDate}`
    };
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    return {
      start: new Date(date.setHours(0, 0, 0, 0)),
      end: new Date(date.setHours(23, 59, 59, 999)),
      label: req.query.date
    };
  }

  const month = Number(req.query.month || (defaultsToToday ? new Date().getMonth() + 1 : null));
  const year = Number(req.query.year || (defaultsToToday ? new Date().getFullYear() : null));

  if (month && year) {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0, 23, 59, 59, 999),
      label: `${year}-${pad(month)}`
    };
  }

  if (defaultsToToday) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return { start: today, end, label: formatDateLabel(today) };
  }

  throw new Error('A valid date or month/year range is required');
};

const fetchAttendanceRecords = async (req, range) => {
  const records = await findCompanyRecords(
    Attendance,
    { date: { $gte: range.start, $lte: range.end } },
    req.company,
    populateOptions,
    { date: -1 }
  );

  return records.filter((record) => {
    if (req.query.employee) {
      const employeeId = req.query.employee.toString();
      const matchEmployee = record.employee?._id?.toString() === employeeId || record.employee?.employeeId?.toString() === employeeId;
      if (!matchEmployee) return false;
    }

    if (req.query.department) {
      const departmentId = req.query.department.toString();
      const recordDepartment = record.employee?.department?._id?.toString() || record.employee?.department?.toString();
      if (recordDepartment !== departmentId) return false;
    }

    if (req.query.status && record.status !== req.query.status) return false;

    return true;
  });
};

const mapBaseRow = (record) => {
  const employee = record.employee || {};
  const departmentName = employee.department?.departmentName || employee.department?.name || '—';
  const fullName = employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || '—';

  return {
    date: record.date ? formatDateLabel(new Date(record.date)) : '—',
    employeeId: employee.employeeId || '—',
    name: fullName,
    department: departmentName,
    designation: employee.designation || '—',
    status: record.status || '—',
    checkIn: formatTimeLabel(record.checkInTime),
    checkOut: formatTimeLabel(record.checkOutTime),
    workingHours: (record.totalWorkingHours ?? 0).toFixed ? Number(record.totalWorkingHours || 0).toFixed(2) : Number(record.totalWorkingHours || 0).toFixed(2),
    overtimeHours: (record.overtimeHours || 0).toFixed(2),
    missingPunch: record.missingPunch ? 'Yes' : 'No'
  };
};

const generateDailyAttendanceReport = async (req) => {
  const range = getRangeFromQuery(req, true);
  const records = await fetchAttendanceRecords(req, range);

  const rows = records.map((record) => {
    const mapped = mapBaseRow(record);
    return [
      mapped.date,
      mapped.employeeId,
      mapped.name,
      mapped.department,
      mapped.designation,
      mapped.status,
      mapped.checkIn,
      mapped.checkOut,
      mapped.workingHours,
      mapped.overtimeHours,
      mapped.missingPunch
    ];
  });

  const summary = {
    'Total Records': records.length,
    'Present Records': records.filter((record) => ['Present', 'WFH', 'Worked on Holiday'].includes(record.status)).length,
    'Late Records': records.filter((record) => record.status === 'Late').length,
    'Absent Records': records.filter((record) => record.status === 'Absent').length,
    'Overtime Hours': records.reduce((sum, record) => sum + (record.overtimeHours || 0), 0).toFixed(2)
  };

  return buildReportResponse({
    title: `Daily Attendance Report - ${range.label}`,
    req,
    filters: req.query,
    summary,
    columns: ATTENDANCE_DAILY,
    rows,
    totalRecords: records.length
  });
};

const generateLateAttendanceReport = async (req) => {
  const range = getRangeFromQuery(req, true);
  const records = (await fetchAttendanceRecords(req, range)).filter((record) => record.status === 'Late');

  const rows = records.map((record) => {
    const mapped = mapBaseRow(record);
    return [
      mapped.date,
      mapped.employeeId,
      mapped.name,
      mapped.department,
      mapped.designation,
      mapped.checkIn,
      mapped.checkOut,
      mapped.status === 'Late' ? 'Late' : '—',
      mapped.workingHours,
      mapped.overtimeHours
    ];
  });

  const summary = {
    'Late Check-ins': records.length,
    'Total Employees': new Set(records.map((record) => record.employee?._id?.toString()).filter(Boolean)).size,
    'Total Working Hours': records.reduce((sum, record) => sum + (record.totalWorkingHours || 0), 0).toFixed(2),
    'Total Overtime Hours': records.reduce((sum, record) => sum + (record.overtimeHours || 0), 0).toFixed(2)
  };

  return buildReportResponse({
    title: `Late Check-in Report - ${range.label}`,
    req,
    filters: req.query,
    summary,
    columns: ATTENDANCE_LATE,
    rows,
    totalRecords: records.length
  });
};

const generateOvertimeAttendanceReport = async (req) => {
  const range = getRangeFromQuery(req, true);
  const records = (await fetchAttendanceRecords(req, range)).filter((record) => (record.overtimeHours || 0) > 0);

  const rows = records.map((record) => {
    const mapped = mapBaseRow(record);
    return [
      mapped.date,
      mapped.employeeId,
      mapped.name,
      mapped.department,
      mapped.designation,
      mapped.status,
      mapped.checkIn,
      mapped.checkOut,
      mapped.workingHours,
      mapped.overtimeHours
    ];
  });

  const summary = {
    'Overtime Records': records.length,
    'Total Employees': new Set(records.map((record) => record.employee?._id?.toString()).filter(Boolean)).size,
    'Total Overtime Hours': records.reduce((sum, record) => sum + (record.overtimeHours || 0), 0).toFixed(2),
    'Average Overtime Hours': records.length ? (records.reduce((sum, record) => sum + (record.overtimeHours || 0), 0) / records.length).toFixed(2) : '0.00'
  };

  return buildReportResponse({
    title: `Overtime Summary - ${range.label}`,
    req,
    filters: req.query,
    summary,
    columns: ATTENDANCE_OVERTIME,
    rows,
    totalRecords: records.length
  });
};

module.exports = {
  generateDailyAttendanceReport,
  generateLateAttendanceReport,
  generateOvertimeAttendanceReport
};