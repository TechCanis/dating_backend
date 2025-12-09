const express = require('express');
const router = express.Router();
const { likeUser, getMatches } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.post('/like', protect, likeUser);
router.get('/', protect, getMatches);

module.exports = router;
