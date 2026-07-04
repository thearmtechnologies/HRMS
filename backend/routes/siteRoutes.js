const express = require('express');
const { createSite, getSites, deleteSite, updateSite } = require('../controllers/siteController');
const { authenticate } = require('../middleware/auth');
const { authorizePermission } = require('../middleware/permission');
const router = express.Router();

router.post('/site', authenticate, authorizePermission('site_management', 'create'), createSite);
router.get('/site', authenticate, authorizePermission('site_management', 'view'), getSites);
router.delete('/site/:id', authenticate, authorizePermission('site_management', 'delete'), deleteSite);
router.put('/site/:id', authenticate, authorizePermission('site_management', 'edit'), updateSite);

module.exports = router;