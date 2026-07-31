const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/permission');
const leaveTypeController = require('../controllers/leaveTypeController');

router.use(authenticate);

// Any authenticated user can view active leave types to check balances or apply for leaves
router.get('/', leaveTypeController.getLeaveTypes);

router.post('/', authorizePermission('settings', 'edit'), leaveTypeController.createLeaveType);
router.post('/manual-accrual', authorizePermission('settings', 'edit'), leaveTypeController.triggerManualAccrual);
router.put('/:id', authorizePermission('settings', 'edit'), leaveTypeController.updateLeaveType);
router.delete('/:id', authorizePermission('settings', 'edit'), leaveTypeController.deleteLeaveType);

module.exports = router;
