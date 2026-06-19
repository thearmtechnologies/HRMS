const express = require("express");
const router = express.Router();
const { createShift, getShifts, assignShift, getMyShift } = require("../controllers/shiftController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, createShift);
router.get("/", authenticate, getShifts);
router.post("/assign", authenticate, assignShift);
router.get("/my-shift", authenticate, getMyShift);

module.exports = router;
