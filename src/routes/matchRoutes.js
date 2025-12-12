const express = require('express');
const router = express.Router();
const { likeUser, getMatches, getPendingLikes } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.post('/like', protect, likeUser);
router.get('/', protect, getMatches);
router.get('/likes', protect, getPendingLikes);

module.exports = router;
