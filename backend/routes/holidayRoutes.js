const express = require("express");
const router = express.Router();
const { getHolidaysByYear, setHolidayConfig, updateHolidayForMonth } = require("../controllers/holidayController");
const { authenticate } = require("../middleware/auth");
const { authorizePermission } = require("../middleware/permission");

router.get("/:year", authenticate, authorizePermission('holiday_management', 'view'), getHolidaysByYear);
router.post("/", authenticate, authorizePermission('holiday_management', 'create'), setHolidayConfig);
router.put("/:year/month", authenticate, authorizePermission('holiday_management', 'edit'), updateHolidayForMonth);

module.exports = router;
