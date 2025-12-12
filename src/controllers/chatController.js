const Message = require('../models/Message');
const Match = require('../models/Match');

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
    const { matchId, text, recipientId } = req.body;
    const senderId = req.user._id;

    try {
        let match;

        if (matchId) {
            match = await Match.findById(matchId);
            if (!match) {
                return res.status(404).json({ message: 'Match not found' });
            }
            // Verify user is part of the match
            if (match.user1.toString() !== senderId.toString() && match.user2.toString() !== senderId.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
        } else if (recipientId) {
            // Check for existing match
            match = await Match.findOne({
                $or: [
                    { user1: senderId, user2: recipientId },
                    { user1: recipientId, user2: senderId }
                ]
            });

            if (!match) {
                // If NO match, check if sender is Premium
                if (req.user.isPremium) {
                    // Create a new "Forced" match
                    match = await Match.create({
                        user1: senderId,
                        user2: recipientId,
                        isMatched: true, // Force match so it appears in inbox
                        lastMessage: text,
                        lastMessageTime: Date.now()
                    });
                } else {
                    return res.status(403).json({ message: 'You must match first or be Premium to message directly.' });
                }
            } else {
                // Existing match found (maybe one-way like?). ensure isMatched=true if premium?
                // For now just use it. If it was false (one-way), messaging usually requires isMatched=true.
                // Let's auto-upgrade it to true if premium sender.
                if (req.user.isPremium && !match.isMatched) {
                    match.isMatched = true;
                }
                if (!match.isMatched) {
                    return res.status(403).json({ message: 'Wait for them to match you back.' });
                }
            }
        } else {
            return res.status(400).json({ message: 'MatchId or RecipientId required' });
        }

        const newMessage = await Message.create({
            matchId: match._id,
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
