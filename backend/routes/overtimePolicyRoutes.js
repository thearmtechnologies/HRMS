const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const overtimePolicyController = require("../controllers/overtimePolicyController");
const { authorizePermission } = require("../middleware/permission");

router.use(authenticate);

router
  .route("/")
  .get(authorizePermission("payroll", "view"), overtimePolicyController.getAllPolicies)
  .post(authorizePermission("payroll", "edit"), overtimePolicyController.createPolicy);

router
  .route("/:id")
  .put(authorizePermission("payroll", "edit"), overtimePolicyController.updatePolicy)
  .delete(authorizePermission("payroll", "edit"), overtimePolicyController.deletePolicy);

module.exports = router;
