const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', createAnnouncement);
router.get('/', getAnnouncements);

module.exports = router;
