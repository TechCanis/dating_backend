const express = require('express');
const router = express.Router();
const { getConfig } = require('../controllers/configController');

router.get('/init', getConfig);

module.exports = router;
