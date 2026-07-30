const express = require("express");
const router = express.Router();
const overtimePolicyController = require("../controllers/overtimePolicyController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

router.use(authenticate);
router.use(authorizeRoles("admin", "hr", "finance"));

router
  .route("/")
  .get(overtimePolicyController.getAllPolicies)
  .post(overtimePolicyController.createPolicy);

router
  .route("/:id")
  .put(overtimePolicyController.updatePolicy)
  .delete(overtimePolicyController.deletePolicy);

module.exports = router;
