const express = require('express');
const router = express.Router();
const {
  getPendingVerifications,
  getVerifiedRecords,
  getRejectedRecords,
  verifyDocument,
  rejectDocument
} = require('../controllers/verificationController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// All routes here should be protected for admin or hr
router.use(authenticate, authorizeRoles('admin', 'hr'));

router.get('/pending', getPendingVerifications);
router.get('/verified', getVerifiedRecords);
router.get('/rejected', getRejectedRecords);
router.put('/:id/verify', verifyDocument);
router.put('/:id/reject', rejectDocument);

module.exports = router;
