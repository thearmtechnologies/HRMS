const { Holiday, HolidayConfig } = require("../models/HolidaysStructure");
const { MONTH_NAMES, getActiveHolidaysForMonth, doesHolidayApply } = require("../utils/holidayUtils");
const Employee = require("../models/Employee");
const User = require("../models/User");
const Site = require("../models/Site");
const { createMultipleNotifications } = require("../utils/notificationService");
const { createCompanyRecord, findCompanyRecords, updateCompanyRecord, deleteCompanyRecord, findOneCompanyRecord } = require("../utils/tenantUtils");

// ============================================================
// HELPER: Check Overlap & Scope Intersection
// ============================================================
const checkOverlap = async (req, startStr, endStr, newScope, newDepts, newLocs, newEmps, excludeId = null, targetYear = null) => {
  const start = new Date(startStr);
  const end = new Date(endStr || startStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const query = { isActive: true };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingHolidays = await findCompanyRecords(Holiday, query, req.company);
  for (const h of existingHolidays) {
    let hStart, hEnd;
    if (h.repeatEveryYear && targetYear) {
      if (h.excludedYears?.includes(targetYear)) continue;
      const sp = h.startDate.split('-');
      const ep = h.endDate.split('-');
      const sm = parseInt(sp[1], 10) - 1;
      const em = parseInt(ep[1], 10) - 1;
      hStart = new Date(targetYear, sm, parseInt(sp[2], 10));
      const ey = em < sm ? targetYear + 1 : targetYear;
      hEnd = new Date(ey, em, parseInt(ep[2], 10));
    } else {
      hStart = new Date(h.startDate);
      hEnd = new Date(h.endDate || h.startDate);
    }

    // Date range intersection check
    if (start <= hEnd && end >= hStart) {
      // Scope intersection check:
      // If either applies to Entire Company, they overlap
      if (newScope === 'Entire Company' || h.appliesTo === 'Entire Company') {
        return h;
      }
      // If Selected Departments, check if any department overlaps
      if (newScope === 'Selected Departments' && h.appliesTo === 'Selected Departments') {
        const depts = (newDepts || []).map(id => id.toString());
        const hDepts = (h.applicableDepartments || []).map(id => id.toString());
        if (depts.some(id => hDepts.includes(id))) return h;
      }
      // If Selected Locations, check if any location overlaps
      if (newScope === 'Selected Locations' && h.appliesTo === 'Selected Locations') {
        const locs = (newLocs || []).map(id => id.toString());
        const hLocs = (h.applicableLocations || []).map(id => id.toString());
        if (locs.some(id => hLocs.includes(id))) return h;
      }
      // If Selected Employees, check if any employee overlaps
      if (newScope === 'Selected Employees' && h.appliesTo === 'Selected Employees') {
        const emps = (newEmps || []).map(id => id.toString());
        const hEmps = (h.applicableEmployees || []).map(id => id.toString());
        if (emps.some(id => hEmps.includes(id))) return h;
      }
    }
  }
  return null;
};

// ============================================================
// GET — Holidays by Year (with auto-migration from legacy)
// ============================================================
const getHolidaysByYear = async (req, res) => {
  const { year } = req.params;
  const targetYear = parseInt(year, 10);
  if (isNaN(targetYear)) {
    return res.status(400).json({ message: "Invalid year parameter" });
  }

  // By default, fetch only active holidays unless includeArchived is true
  const query = {};
  if (req.query.includeArchived !== 'true') {
    query.isActive = true;
  }

  try {
    // 1. Fetch clean enterprise Holiday documents
    let holidaysList = await findCompanyRecords(Holiday, {
      ...query,
      $or: [
        { year: targetYear },
        { repeatEveryYear: true, excludedYears: { $ne: targetYear } },
        { year: targetYear - 1 }
      ]
    }, req.company, null, { startDate: 1 });
    holidaysList = holidaysList.map(h => h.toObject ? h.toObject() : h); // Simulate lean()

    // 2. Auto-migrate legacy HolidayConfig records if clean collection is empty for this year
    if (holidaysList.length === 0) {
      let legacyConfig = await findOneCompanyRecord(HolidayConfig, { year: targetYear }, req.company);
      if (legacyConfig) legacyConfig = legacyConfig.toObject ? legacyConfig.toObject() : legacyConfig;
      if (legacyConfig && legacyConfig.holidays) {
        for (const mEntry of legacyConfig.holidays) {
          const mIdx = MONTH_NAMES.indexOf(mEntry.month);
          if (mIdx !== -1 && Array.isArray(mEntry.holidays)) {
            for (const h of mEntry.holidays) {
              const padM = String(mIdx + 1).padStart(2, '0');
              const padD = String(h.date).padStart(2, '0');
              const dateStr = `${targetYear}-${padM}-${padD}`;
              await Holiday.create({
                name: h.name || 'Holiday',
                type: h.type || 'Company',
                description: h.description || '',
                startDate: dateStr,
                endDate: dateStr,
                durationType: 'Single Day',
                isPaid: h.isPaid !== false,
                isActive: h.isActive !== false,
                year: targetYear
              });
            }
          }
        }
        // Re-fetch after auto-migration
        holidaysList = await findCompanyRecords(Holiday, {
          $or: [
            { year: targetYear },
            { repeatEveryYear: true, excludedYears: { $ne: targetYear } }
          ]
        }, req.company, null, { startDate: 1 });
        holidaysList = holidaysList.map(h => h.toObject ? h.toObject() : h);
      }
    }

    // 3. Resolve employee context if requester is an employee
    let empContext = null;
    if (req.user && req.user.role === 'employee') {
      const userIdStr = (req.user.userId || req.user.id || '').toString();
      const userDoc = await User.findById(userIdStr);
      const empDoc = await Employee.findOne({ $or: [{ user: userIdStr }, { email: req.user.email }] });

      let siteId = null;
      if (empDoc && empDoc.workLocation) {
        const siteDoc = await Site.findOne({ siteName: { $regex: new RegExp(`^${empDoc.workLocation}$`, 'i') } });
        if (siteDoc) siteId = siteDoc._id.toString();
      }

      empContext = {
        userId: userIdStr,
        empId: empDoc ? empDoc._id.toString() : null,
        employeeId: empDoc ? empDoc.employeeId : null,
        departmentId: (empDoc?.department || userDoc?.department || '').toString(),
        location: empDoc?.workLocation || '',
        siteId: siteId
      };
    }

    // Filter clean enterprise list by employee scope
    if (empContext) {
      holidaysList = holidaysList.filter(h => doesHolidayApply(h, empContext));
    }

    // 4. Build legacy month-bucketed array for any older UI components or scripts
    const legacyMonthBuckets = [];
    for (const mName of MONTH_NAMES) {
      const expandedDays = await getActiveHolidaysForMonth(mName, targetYear, empContext, req.company);
      legacyMonthBuckets.push({
        month: mName,
        holidays: expandedDays
      });
    }

    res.json({
      year: targetYear,
      holidaysList, // New Enterprise clean array (1 doc per holiday event)
      holidays: legacyMonthBuckets // Legacy expanded buckets
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================================
// GET — All available years
// ============================================================
const getAllYears = async (req, res) => {
  try {
    const newYears = await Holiday.distinct('year');
    const legacyYears = await HolidayConfig.distinct('year');
    const combined = [...new Set([...newYears, ...legacyYears])].filter(y => !isNaN(y)).sort((a, b) => b - a);
    if (combined.length === 0) {
      combined.push(new Date().getFullYear());
    }
    res.json(combined);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================================
// POST — Create year config (initialize a year)
// ============================================================
const setHolidayConfig = async (req, res) => {
  const { year } = req.body;
  if (!year) return res.status(400).json({ message: "Year is required" });
  try {
    const existing = await Holiday.findOne({ year: parseInt(year, 10) });
    if (existing) {
      return res.status(409).json({ message: "Holidays for this year already exist" });
    }
    res.status(201).json({ year: parseInt(year, 10), holidaysList: [], holidays: [] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================================
// POST — Add a new holiday
// ============================================================
const addHoliday = async (req, res) => {
  const {
    name, type, description, startDate, endDate,
    durationType = 'Single Day', halfDayType = 'First Half', customTime,
    isPaid = true, repeatEveryYear = false,
    appliesTo = 'Entire Company', applicableDepartments = [], applicableLocations = [], applicableEmployees = []
  } = req.body;

  let targetYear = req.params.year ? parseInt(req.params.year, 10) : null;
  if (!targetYear && startDate) {
    targetYear = new Date(startDate).getFullYear();
  }

  if (!name || !startDate) {
    return res.status(400).json({ message: "Holiday name and start date are required." });
  }

  const effectiveEndDate = durationType === 'Single Day' || durationType === 'Half Day' ? startDate : (endDate || startDate);

  if (new Date(effectiveEndDate) < new Date(startDate)) {
    return res.status(400).json({ message: "End Date cannot be earlier than Start Date." });
  }

  // Validate custom half-day times
  if (durationType === 'Half Day' && halfDayType === 'Custom Time') {
    if (!customTime || !customTime.startTime || !customTime.endTime) {
      return res.status(400).json({ message: "Start Time and End Time are required for custom half day." });
    }
    if (customTime.endTime <= customTime.startTime) {
      return res.status(400).json({ message: "End Time must be later than Start Time." });
    }
  }

  try {
    // Check overlap
    const overlap = await checkOverlap(
      startDate, effectiveEndDate, appliesTo, applicableDepartments, applicableLocations, applicableEmployees, null, targetYear
    );
    if (overlap) {
      return res.status(409).json({
        message: `Holiday date range overlaps with existing holiday: "${overlap.name}" (${overlap.startDate} to ${overlap.endDate}).`
      });
    }

    const newHoliday = await Holiday.create({
      name: name.trim(),
      type: type || 'Company',
      description: description || '',
      startDate,
      endDate: effectiveEndDate,
      durationType,
      halfDayType: durationType === 'Half Day' ? halfDayType : undefined,
      customTime: durationType === 'Half Day' && halfDayType === 'Custom Time' ? customTime : undefined,
      isPaid,
      repeatEveryYear,
      appliesTo,
      applicableDepartments: appliesTo === 'Selected Departments' ? applicableDepartments : [],
      applicableLocations: appliesTo === 'Selected Locations' ? applicableLocations : [],
      applicableEmployees: appliesTo === 'Selected Employees' ? applicableEmployees : [],
      isActive: true,
      year: targetYear || new Date(startDate).getFullYear()
    });

    const activeEmployees = await Employee.find({ isActive: true }).select('user department location').lean();
    const notifs = [];
    for (const emp of activeEmployees) {
      if (!emp.user) continue;
      if (appliesTo === 'Selected Departments' && (!emp.department || !applicableDepartments.includes(emp.department.toString()))) continue;
      if (appliesTo === 'Selected Locations' && (!emp.location || !applicableLocations.includes(emp.location.toString()))) continue;
      if (appliesTo === 'Selected Employees' && !applicableEmployees.includes(emp._id.toString())) continue;

      notifs.push({
        recipient: emp.user,
        sender: req.user?.userId || null,
        title: 'New Holiday Published',
        message: `A new holiday "${newHoliday.name}" (${newHoliday.startDate}) has been added to the calendar.`,
        type: 'holiday',
        module: 'holiday_management',
        link: '/employee/holidays'
      });
    }
    if (notifs.length > 0) {
      createMultipleNotifications(notifs).catch(e => console.error('Holiday notification error:', e));
    }

    res.status(201).json(newHoliday);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================================
// PUT — Edit a holiday (with Series vs. Occurrence support)
// ============================================================
const updateHoliday = async (req, res) => {
  const { holidayId } = req.params;
  const {
    name, type, description, startDate, endDate,
    durationType, halfDayType, customTime,
    isPaid, repeatEveryYear, editScope = 'entire_series',
    appliesTo, applicableDepartments, applicableLocations, applicableEmployees
  } = req.body;

  try {
    const doc = await Holiday.findById(holidayId);
    if (!doc) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    const effectiveEndDate = durationType === 'Single Day' || durationType === 'Half Day' ? startDate : (endDate || startDate);
    const targetYear = req.params.year ? parseInt(req.params.year, 10) : new Date(startDate || doc.startDate).getFullYear();

    // If editing ONLY THIS OCCURRENCE of a recurring series
    if (doc.repeatEveryYear && editScope === 'this_occurrence') {
      // Exclude this year/date from the original recurring series
      if (!doc.excludedYears.includes(targetYear)) {
        doc.excludedYears.push(targetYear);
      }
      const formattedDate = startDate || doc.startDate;
      if (!doc.excludedDates.includes(formattedDate)) {
        doc.excludedDates.push(formattedDate);
      }
      await doc.save();

      // Check overlap for the new override
      const overlap = await checkOverlap(
        startDate || doc.startDate, effectiveEndDate || doc.endDate,
        appliesTo || doc.appliesTo, applicableDepartments || doc.applicableDepartments,
        applicableLocations || doc.applicableLocations, applicableEmployees || doc.applicableEmployees,
        doc._id, targetYear
      );
      if (overlap) {
        return res.status(409).json({
          message: `Holiday override overlaps with existing holiday: "${overlap.name}" (${overlap.startDate} to ${overlap.endDate}).`
        });
      }

      // Create new override document for this year only
      const overrideHoliday = await Holiday.create({
        name: (name || doc.name).trim(),
        type: type || doc.type,
        description: description !== undefined ? description : doc.description,
        startDate: startDate || doc.startDate,
        endDate: effectiveEndDate || doc.endDate,
        durationType: durationType || doc.durationType,
        halfDayType: durationType === 'Half Day' ? (halfDayType || doc.halfDayType) : undefined,
        customTime: durationType === 'Half Day' && (halfDayType === 'Custom Time' || doc.halfDayType === 'Custom Time') ? (customTime || doc.customTime) : undefined,
        isPaid: isPaid !== undefined ? isPaid : doc.isPaid,
        repeatEveryYear: false,
        appliesTo: appliesTo || doc.appliesTo,
        applicableDepartments: appliesTo === 'Selected Departments' ? (applicableDepartments || doc.applicableDepartments) : [],
        applicableLocations: appliesTo === 'Selected Locations' ? (applicableLocations || doc.applicableLocations) : [],
        applicableEmployees: appliesTo === 'Selected Employees' ? (applicableEmployees || doc.applicableEmployees) : [],
        isActive: true,
        year: targetYear
      });

      return res.status(200).json(overrideHoliday);
    }

    // Otherwise, updating the entire series or standard non-recurring holiday
    if (startDate) {
      if (new Date(effectiveEndDate) < new Date(startDate)) {
        return res.status(400).json({ message: "End Date cannot be earlier than Start Date." });
      }
      const overlap = await checkOverlap(
        startDate, effectiveEndDate, appliesTo || doc.appliesTo,
        applicableDepartments || doc.applicableDepartments, applicableLocations || doc.applicableLocations,
        applicableEmployees || doc.applicableEmployees, doc._id, targetYear
      );
      if (overlap) {
        return res.status(409).json({
          message: `Updated holiday date range overlaps with existing holiday: "${overlap.name}" (${overlap.startDate} to ${overlap.endDate}).`
        });
      }
      doc.startDate = startDate;
      doc.endDate = effectiveEndDate;
      doc.year = new Date(startDate).getFullYear();
    }

    if (name !== undefined) doc.name = name.trim();
    if (type !== undefined) doc.type = type;
    if (description !== undefined) doc.description = description;
    if (durationType !== undefined) doc.durationType = durationType;
    if (halfDayType !== undefined) doc.halfDayType = halfDayType;
    if (customTime !== undefined) doc.customTime = customTime;
    if (isPaid !== undefined) doc.isPaid = isPaid;
    if (repeatEveryYear !== undefined) doc.repeatEveryYear = repeatEveryYear;
    if (appliesTo !== undefined) doc.appliesTo = appliesTo;
    if (applicableDepartments !== undefined) doc.applicableDepartments = applicableDepartments;
    if (applicableLocations !== undefined) doc.applicableLocations = applicableLocations;
    if (applicableEmployees !== undefined) doc.applicableEmployees = applicableEmployees;

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================================
// DELETE — Archive a holiday (with Series vs. Occurrence support)
// ============================================================
const deleteHoliday = async (req, res) => {
  const { holidayId } = req.params;
  const deleteScope = req.query.deleteScope || req.body.deleteScope || 'entire_series';
  const targetYear = req.params.year ? parseInt(req.params.year, 10) : new Date().getFullYear();

  try {
    const doc = await Holiday.findById(holidayId);
    if (!doc) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    // Revert Attendance records marked as "Worked on Holiday" back to "Present"
    const Attendance = require("../models/Attendance");
    let startD = new Date(doc.startDate);
    let endD = doc.endDate ? new Date(doc.endDate) : new Date(doc.startDate);
    startD.setHours(0, 0, 0, 0);
    endD.setHours(23, 59, 59, 999);
    
    await Attendance.updateMany(
      { date: { $gte: startD, $lte: endD }, status: "Worked on Holiday" },
      { $set: { status: "Present" } }
    );

    if (doc.repeatEveryYear && deleteScope === 'this_occurrence') {
      if (!doc.excludedYears.includes(targetYear)) {
        doc.excludedYears.push(targetYear);
      }
      if (!doc.excludedDates.includes(doc.startDate)) {
        doc.excludedDates.push(doc.startDate);
      }
      await doc.save();
      return res.json({ message: `Archived ${targetYear} occurrence of recurring holiday. Attendance updated.`, holiday: doc });
    }

    // Archive entire series / standard holiday
    doc.isActive = false;
    await doc.save();
    res.json({ message: "Holiday archived successfully. Attendance updated.", holiday: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================================
// PUT — Restore an archived holiday
// ============================================================
const reactivateHoliday = async (req, res) => {
  const { holidayId } = req.params;
  try {
    const doc = await Holiday.findById(holidayId);
    if (!doc) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    doc.isActive = true;
    await doc.save();
    res.json({ message: "Holiday restored successfully.", holiday: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================================
// PUT — Legacy bulk update for a specific month
// ============================================================
const updateHolidayForMonth = async (req, res) => {
  const { year } = req.params;
  const { month, holidays } = req.body;
  if (!month || !Array.isArray(holidays)) {
    return res.status(400).json({ message: "Month and holidays array are required" });
  }
  try {
    const targetYear = parseInt(year, 10);
    const monthIdx = MONTH_NAMES.indexOf(month);
    if (monthIdx === -1) return res.status(400).json({ message: "Invalid month name" });

    // Mark existing non-repeating holidays for this month as inactive
    const padM = String(monthIdx + 1).padStart(2, '0');
    const monthPrefix = `${targetYear}-${padM}-`;
    await Holiday.updateMany({ startDate: { $regex: `^${monthPrefix}` }, repeatEveryYear: false }, { $set: { isActive: false } });

    // Create new records
    for (const h of holidays) {
      const padD = String(h.date).padStart(2, '0');
      const dateStr = `${monthPrefix}${padD}`;
      await Holiday.create({
        name: h.name || 'Holiday',
        type: h.type || 'Company',
        description: h.description || '',
        startDate: dateStr,
        endDate: dateStr,
        durationType: 'Single Day',
        isPaid: h.isPaid !== false,
        isActive: h.isActive !== false,
        year: targetYear
      });
    }

    res.json({ message: `Updated holidays for ${month} ${targetYear}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getHolidaysByYear,
  getAllYears,
  setHolidayConfig,
  updateHolidayForMonth,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  reactivateHoliday
};