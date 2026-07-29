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
  .post(authenticate, authorizeRoles('admin', 'hr', 'finance'), createAdvance)
  .get(authenticate, authorizeRoles('admin', 'hr', 'finance'), getAllAdvances);

router.route('/:id/status')
  .patch(authenticate, authorizeRoles('admin', 'hr', 'finance'), updateAdvanceStatus);

router.route('/:id')
  .put(authenticate, authorizeRoles('admin', 'hr', 'finance'), updateAdvance)
  .delete(authenticate, authorizeRoles('admin', 'hr', 'finance'), deleteAdvance);

module.exports = router;
