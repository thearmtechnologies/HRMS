const express = require('express');
const router = express.Router();
const { 
  createAnnouncement, 
  getAnnouncements, 
  updateAnnouncement, 
  deleteAnnouncement, 
  getMyAnnouncements 
} = require('../controllers/announcementController');
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/permission');

router.use(authenticate);

// Employee route (gets targeted published announcements)
router.get('/my', getMyAnnouncements);

// Admin / HR routes (requires announcements module permission)
router.get('/', authorizePermission('announcements', 'view'), getAnnouncements);
router.post('/', authorizePermission('announcements', 'create'), createAnnouncement);
router.put('/:id', authorizePermission('announcements', 'edit'), updateAnnouncement);
router.delete('/:id', authorizePermission('announcements', 'delete'), deleteAnnouncement);

module.exports = router;
