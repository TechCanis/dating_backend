const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getAllConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/', protect, getAllConversations);
router.get('/:matchId', protect, getMessages);

module.exports = router;
