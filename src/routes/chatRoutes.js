const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getAllConversations, markAsRead } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/', protect, getAllConversations);
router.get('/:matchId', protect, getMessages);
router.post('/read/:matchId', protect, markAsRead);

module.exports = router;
