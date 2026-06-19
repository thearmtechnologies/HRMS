const express = require("express");
const router = express.Router();
const { getHolidaysByYear, setHolidayConfig, updateHolidayForMonth } = require("../controllers/holidayController");
const { authenticate } = require("../middleware/auth");

router.get("/:year", authenticate, getHolidaysByYear);
router.post("/", authenticate, setHolidayConfig);
router.put("/:year/month", authenticate, updateHolidayForMonth);

module.exports = router;
