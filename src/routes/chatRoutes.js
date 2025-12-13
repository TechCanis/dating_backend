const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversation } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/user/:userId', protect, getConversation);
router.get('/:matchId', protect, getMessages);

module.exports = router;
