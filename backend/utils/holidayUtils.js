const { Holiday, HolidayConfig } = require('../models/HolidaysStructure');
const { findCompanyRecords, findOneCompanyRecord } = require('./tenantUtils');

// ============================================================
// MONTH HELPERS
// ============================================================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (monthIndex) => MONTH_NAMES[monthIndex] || null;
const getMonthIndex = (monthName) => MONTH_NAMES.indexOf(monthName);

// ============================================================
// CORE HOLIDAY FUNCTIONS — Single Source of Truth
// ============================================================

/**
 * Helper: Check if a holiday applies to a specific employee context
 * empContext: { departmentId, locationId, employeeId, userId, location, siteId }
 */
const doesHolidayApply = (holiday, empContext) => {
  if (!empContext) return true;
  if (!holiday.appliesTo) return true;
  const scopeStr = holiday.appliesTo.toString().trim().toLowerCase();
  if (scopeStr === 'entire company' || scopeStr === 'all' || scopeStr === 'company' || scopeStr === 'entire_company') return true;

  if (holiday.appliesTo === 'Selected Departments' || scopeStr === 'selected departments') {
    if (!empContext.departmentId && !empContext.deptId) return false;
    const depts = (holiday.applicableDepartments || []).map(id => id.toString());
    const myDept = (empContext.departmentId || empContext.deptId || '').toString();
    return depts.includes(myDept);
  }

  if (holiday.appliesTo === 'Selected Locations' || scopeStr === 'selected locations') {
    if (!empContext.locationId && !empContext.location && !empContext.siteId && !empContext.workLocation) return false;
    const locs = (holiday.applicableLocations || []).map(id => id.toString().toLowerCase());
    const myLocId = (empContext.locationId || empContext.siteId || '').toString().toLowerCase();
    const myLocName = (empContext.location || empContext.workLocation || '').toString().toLowerCase();
    return locs.some(l => l === myLocId || l === myLocName || (myLocName && l.includes(myLocName)) || (myLocName && myLocName.includes(l)));
  }

  if (holiday.appliesTo === 'Selected Employees' || scopeStr === 'selected employees') {
    const emps = (holiday.applicableEmployees || []).map(id => id.toString());
    const myEmpId = (empContext.employeeId || empContext.empId || '').toString();
    const myUserId = (empContext.userId || '').toString();
    const myEmpCode = (empContext.empCode || '').toString();
    return emps.includes(myEmpId) || emps.includes(myUserId) || emps.includes(myEmpCode);
  }

  return true;
};

/**
 * Get all active holidays for a specific month and year.
 * Evaluates recurring holidays, multi-day ranges, multi-year boundaries, and legacy configs.
 * Returns an array of expanded day objects: [{ date, name, type, description, isPaid, isActive, isHalfDay, ... }]
 */
const getActiveHolidaysForMonth = async (monthName, year, empContext = null, companyId = null) => {
  if (!companyId) throw new Error("companyId is required for multi-tenant holiday filtering.");
  const targetYear = Number(year);
  const targetMonthIdx = getMonthIndex(monthName);
  if (targetMonthIdx === -1 || isNaN(targetYear)) return [];

  const expandedDays = [];

  // 1. Fetch from new Enterprise Holiday collection
  // Query records for this year OR repeating every year (unless excluded)
  const newHolidays = await findCompanyRecords(Holiday, {
    isActive: true,
    $or: [
      { year: targetYear },
      { repeatEveryYear: true, excludedYears: { $ne: targetYear } },
      // Also catch multi-year holidays starting in previous year and ending in this year
      { year: targetYear - 1 }
    ]
  }, companyId);

  for (const doc of newHolidays) {
    if (!doesHolidayApply(doc, empContext)) continue;
    let start, end;

    if (doc.repeatEveryYear) {
      // Evaluate recurring dates for targetYear
      const startParts = doc.startDate.split('-');
      const endParts = doc.endDate.split('-');
      const startMonth = parseInt(startParts[1], 10) - 1;
      const endMonth = parseInt(endParts[1], 10) - 1;

      start = new Date(targetYear, startMonth, parseInt(startParts[2], 10));
      // Handle recurring multi-year boundary (e.g. Dec 31 to Jan 2)
      const endYear = endMonth < startMonth ? targetYear + 1 : targetYear;
      end = new Date(endYear, endMonth, parseInt(endParts[2], 10));
    } else {
      start = new Date(doc.startDate);
      end = new Date(doc.endDate || doc.startDate);
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

    // Loop through date range
    const current = new Date(start);
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    while (current <= end) {
      if (current.getFullYear() === targetYear && current.getMonth() === targetMonthIdx) {
        const dateStr = current.getDate().toString();
        const formattedYYYYMMDD = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

        // Check if this occurrence was specifically overridden or deleted
        if (!doc.excludedDates?.includes(formattedYYYYMMDD) && !doc.excludedDates?.includes(dateStr)) {
          expandedDays.push({
            _id: doc._id,
            date: dateStr,
            formattedDate: formattedYYYYMMDD,
            startDate: doc.startDate || startStr,
            endDate: doc.endDate || endStr,
            name: doc.name,
            type: doc.type || 'Company',
            description: doc.description || '',
            isPaid: doc.isPaid !== false,
            allowCheckIn: doc.allowCheckIn === true,
            isActive: true,
            durationType: doc.durationType || 'Single Day',
            isHalfDay: doc.durationType === 'Half Day',
            halfDayType: doc.halfDayType || 'First Half',
            customTime: doc.customTime || { startTime: '09:00', endTime: '13:00' },
            appliesTo: doc.appliesTo || 'Entire Company',
            applicableDepartments: doc.applicableDepartments || [],
            applicableLocations: doc.applicableLocations || [],
            applicableEmployees: doc.applicableEmployees || [],
            repeatEveryYear: doc.repeatEveryYear || false
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }
  }

  // 2. Fallback check for legacy HolidayConfig records (for backward compatibility during migration)
  if (expandedDays.length === 0) {
    const config = await HolidayConfig.findOne({ year: targetYear });
    if (config) {
      const monthEntry = config.holidays.find(h => h.month === monthName);
      if (monthEntry && monthEntry.holidays) {
        for (const h of monthEntry.holidays) {
          if (h.isActive !== false) {
            // Avoid duplicate if somehow both exist
            if (!expandedDays.some(d => d.date === h.date)) {
              expandedDays.push({
                _id: h._id,
                date: h.date,
                name: h.name,
                type: h.type || 'Company',
                description: h.description || '',
                isPaid: h.isPaid !== false,
                allowCheckIn: false,
                isActive: true,
                durationType: 'Single Day',
                isHalfDay: false,
                appliesTo: 'Entire Company'
              });
            }
          }
        }
      }
    }
  }

  // Sort by date ascending
  return expandedDays.sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10));
};

/**
 * Get active holiday date strings for a specific month.
 * Returns an array like ["15", "26"] — useful for calendar rendering and payroll.
 */
const getActiveHolidayDates = async (monthName, year) => {
  const holidays = await getActiveHolidaysForMonth(monthName, year, null, companyId);
  return holidays.map(h => h.date);
};

/**
 * Check if a specific Date is an active holiday for a user scope.
 * Supports filtering by department, location, and employee id.
 * @param {Date|string} date - The date to check
 * @param {string} [departmentId] - Optional user department ID
 * @param {string} [locationId] - Optional user site/location ID
 * @param {string} [employeeId] - Optional user employee ID
 * @returns {boolean}
 */
const isHoliday = async (date, companyId, departmentId = null, locationId = null, employeeId = null) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  const year = d.getFullYear();
  const monthName = getMonthName(d.getMonth());
  const dayStr = d.getDate().toString();

  const holidays = await getActiveHolidaysForMonth(monthName, year, { departmentId, locationId, employeeId }, companyId);
  const matchedHoliday = holidays.find(h => h.date === dayStr);
  if (!matchedHoliday) return false;

  // Check scope applicability using clean helper
  return doesHolidayApply(matchedHoliday, { departmentId, locationId, employeeId });
};

/**
 * Get the holiday info object for a specific date, or null if not a holiday.
 * @param {Date|string} date
 * @returns {Object|null} e.g. { date: "15", name: "Independence Day", type: "National", ... }
 */
const getHolidayInfo = async (date, companyId) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const monthName = getMonthName(d.getMonth());
  const dayStr = d.getDate().toString();
  const holidays = await getActiveHolidaysForMonth(monthName, year, empContext || null, companyId);
  return holidays.find(h => h.date === dayStr) || null;
};

/**
 * Count active holidays in a specific month/year.
 */
const countHolidaysInMonth = async (monthName, year) => {
  const holidays = await getActiveHolidaysForMonth(monthName, year, null, companyId);
  return holidays.length;
};

/**
 * Count active holidays for an entire year.
 */
const countHolidaysInYear = async (year) => {
  let total = 0;
  for (const m of MONTH_NAMES) {
    const h = await getActiveHolidaysForMonth(m, year, null, companyId);
    total += h.length;
  }
  return total;
};

/**
 * Calculate working days in a month (total days minus Sundays minus active holidays).
 * Note: Uses Sunday as the only weekly off. Shift-based weekly offs can be added later.
 */
const getWorkingDaysInMonth = async (month, year) => {
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const monthName = getMonthName(month - 1);

  let sundayCount = 0;
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    if (dateObj.getDay() === 0) {
      sundayCount++;
    }
  }

  const holidays = await getActiveHolidaysForMonth(monthName, year, null, companyId);
  let holidaysNotOnSunday = 0;
  for (const h of holidays) {
    const dayNum = parseInt(h.date, 10);
    const dateObj = new Date(year, month - 1, dayNum);
    if (dateObj.getDay() !== 0) {
      holidaysNotOnSunday++;
    }
  }

  return Math.max(0, totalDaysInMonth - sundayCount - holidaysNotOnSunday);
};

module.exports = {
  MONTH_NAMES,
  getMonthName,
  getMonthIndex,
  doesHolidayApply,
  getActiveHolidaysForMonth,
  getActiveHolidayDates,
  isHoliday,
  getHolidayInfo,
  countHolidaysInMonth,
  countHolidaysInYear,
  getWorkingDaysInMonth
};
