const Message = require('../models/Message');
const Match = require('../models/Match');

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
    const { matchId, text } = req.body;
    const senderId = req.user._id;

    try {
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Verify user is part of the match
        if (match.user1.toString() !== senderId.toString() && match.user2.toString() !== senderId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const newMessage = await Message.create({
            matchId,
            sender: senderId,
            text,
        });

        // Update last message in Match
        match.lastMessage = text;
        match.lastMessageTime = Date.now();
        await match.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a match
// @route   GET /api/chat/:matchId
// @access  Private
const getMessages = async (req, res) => {
    const { matchId } = req.params;
    const userId = req.user._id;

    try {
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        if (match.user1.toString() !== userId.toString() && match.user2.toString() !== userId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const messages = await Message.find({ matchId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getMessages };
