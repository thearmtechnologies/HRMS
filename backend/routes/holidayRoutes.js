const express = require("express");
const router = express.Router();
const {
  getHolidaysByYear,
  getAllYears,
  setHolidayConfig,
  updateHolidayForMonth,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  reactivateHoliday
} = require("../controllers/holidayController");
const { authenticate } = require("../middleware/auth");
const { authorizePermission } = require("../middleware/permission");

// Read
router.get("/all-years", authenticate, getAllYears);
router.get("/:year", authenticate, getHolidaysByYear);

// Create (support both root and year-prefixed)
router.post("/", authenticate, authorizePermission('holiday_management', 'create'), addHoliday);
router.post("/:year/holiday", authenticate, authorizePermission('holiday_management', 'create'), addHoliday);
router.post("/init-year", authenticate, authorizePermission('holiday_management', 'create'), setHolidayConfig);

// Update (support both root and year-prefixed)
router.put("/holiday/:holidayId", authenticate, authorizePermission('holiday_management', 'edit'), updateHoliday);
router.put("/:year/holiday/:holidayId", authenticate, authorizePermission('holiday_management', 'edit'), updateHoliday);
router.put("/holiday/:holidayId/reactivate", authenticate, authorizePermission('holiday_management', 'edit'), reactivateHoliday);
router.put("/:year/holiday/:holidayId/reactivate", authenticate, authorizePermission('holiday_management', 'edit'), reactivateHoliday);
router.put("/:year/month", authenticate, authorizePermission('holiday_management', 'edit'), updateHolidayForMonth);

// Soft Delete / Archive (support both root and year-prefixed)
router.delete("/holiday/:holidayId", authenticate, authorizePermission('holiday_management', 'delete'), deleteHoliday);
router.delete("/:year/holiday/:holidayId", authenticate, authorizePermission('holiday_management', 'delete'), deleteHoliday);

module.exports = router;
