const express = require('express');
const router = express.Router();
const { likeUser, rejectUser, getMatches, getPendingLikes, getSentLikes } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.post('/like', protect, likeUser);
router.post('/reject', protect, rejectUser);
router.get('/', protect, getMatches);
router.get('/likes', protect, getPendingLikes);
router.get('/sent-likes', protect, getSentLikes);

module.exports = router;
