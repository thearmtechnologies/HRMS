const express = require("express");
const router = express.Router();
const { createShift, getShifts, assignShift, getMyShift, updateShift, deleteShift } = require("../controllers/shiftController");
const { authenticate } = require("../middleware/auth");
const { authorizePermission } = require("../middleware/permission");

router.post("/", authenticate, authorizePermission('shift_management', 'create'), createShift);
router.get("/", authenticate, authorizePermission('shift_management', 'view'), getShifts);
router.put("/:id", authenticate, authorizePermission('shift_management', 'edit'), updateShift);
router.delete("/:id", authenticate, authorizePermission('shift_management', 'delete'), deleteShift);
router.post("/assign", authenticate, authorizePermission('shift_management', 'edit'), assignShift);
router.get("/my-shift", authenticate, getMyShift);

module.exports = router;
