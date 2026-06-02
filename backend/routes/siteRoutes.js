const express = require('express');
const { createSite, getSites, deleteSite, updateSite } = require('../controllers/siteController');
const router = express.Router();

router.post('/site', createSite);
router.get('/site', getSites);
router.delete('/site/:id', deleteSite);
router.put('/site/:id', updateSite);

module.exports = router;