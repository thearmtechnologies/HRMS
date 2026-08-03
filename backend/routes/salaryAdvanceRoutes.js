const express = require('express');
const router = express.Router();
const { 
  createAdvance, 
  getAllAdvances, 
  updateAdvanceStatus, 
  updateAdvance, 
  deleteAdvance 
} = require('../controllers/salaryAdvanceController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.route('/')
  .post(authenticate, authorizeRoles('admin', 'hr'), createAdvance)
  .get(authenticate, authorizeRoles('admin', 'hr'), getAllAdvances);

router.route('/:id/status')
  .patch(authenticate, authorizeRoles('admin', 'hr'), updateAdvanceStatus);

router.route('/:id')
  .put(authenticate, authorizeRoles('admin', 'hr'), updateAdvance)
  .delete(authenticate, authorizeRoles('admin', 'hr'), deleteAdvance);

module.exports = router;
