const socket = require('../socket');
const Message = require('../models/Message');

// @desc    Send a message (Write to MongoDB & Emit Socket Event)
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
    const { text, recipientId } = req.body;
    const senderId = req.user._id.toString();

    if (!text || !recipientId) {
        return res.status(400).json({ message: 'Text and recipientId are required' });
    }

    try {
        // 1. Find or Create Match
        let match = await Match.findOne({
            $or: [
                { user1: senderId, user2: recipientId },
                { user1: recipientId, user2: senderId }
            ]
        });

        if (match) {
            match.lastMessage = text;
            match.lastMessageTime = new Date();
            // Increment Unread Count
            if (match.user1.toString() === recipientId) {
                match.unreadCount_user1 = (match.unreadCount_user1 || 0) + 1;
            } else {
                match.unreadCount_user2 = (match.unreadCount_user2 || 0) + 1;
            }
            await match.save();
        } else {
            // Create new Match
            match = await Match.create({
                user1: senderId,
                user2: recipientId,
                isMatched: false,
                lastMessage: text,
                lastMessageTime: new Date(),
                unreadCount_user1: senderId === recipientId ? 1 : 0,
                unreadCount_user2: senderId !== recipientId ? 1 : 0
            });
        }

        // 2. Create Message in MongoDB
        const message = await Message.create({
            matchId: match._id,
            sender: senderId,
            text: text,
            read: false
        });

        // 3. Emit Socket Event
        const io = socket.getIo();

        // Emit to recipient
        io.to(recipientId).emit('new_message', {
            _id: message._id,
            matchId: match._id,
            sender: senderId,
            text: text,
            createdAt: message.createdAt
        });

        // Emit to sender (optional, can be useful for confirmation or multi-device sync)
        io.to(senderId).emit('new_message', {
            _id: message._id,
            matchId: match._id,
            sender: senderId,
            text: text,
            createdAt: message.createdAt
        });

        res.status(201).json(message);

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a specific chat (from MongoDB)
// @route   GET /api/chat/:matchId
// @access  Private
const getMessages = async (req, res) => {
    const { matchId } = req.params; // potentially matchId or recipientId?
    // The previous implementation used "matchId" in params but calculated chatId from user IDs.
    // However, the route says /:matchId.
    // If the frontend is passing the Match ObjectID, we can query by matchId.
    // If the frontend is passing the OTHER USER ID, we have to find the match first.

    // Let's assume for now the frontend might be passing a Match ID OR User ID.
    // To be safe and consistent with previous logic (which calculated chatId from IDs),
    // let's check if the param is a valid MatchId, if not assume it's a User ID.

    // Actually, looking at previous existing code:
    // const chatId = [currentUserId, matchId].sort().join('_');
    // It treated `matchId` param as the `otherUserId` !!
    // This is confusing naming in the old code. 

    // Let's stick to the behavior: logic implies `matchId` param IS `otherUserId`.
    // I should find the Match document first.

    const otherUserId = req.params.matchId;
    const currentUserId = req.user._id.toString();

    try {
        const match = await Match.findOne({
            $or: [
                { user1: currentUserId, user2: otherUserId },
                { user1: otherUserId, user2: currentUserId }
            ]
        });

        if (!match) {
            return res.json([]); // No conversation yet
        }

        const messages = await Message.find({ matchId: match._id })
            .sort({ createdAt: 1 }); // Oldest first

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active conversations
// @route   GET /api/chat
// @access  Private
const getAllConversations = async (req, res) => {
    const userId = req.user._id.toString();
    console.log(`Chat: Getting conversations for ${userId}`);

    try {
        const matches = await Match.find({
            $and: [
                { $or: [{ user1: userId }, { user2: userId }] },
                { lastMessage: { $exists: true, $ne: null } }
            ]
        }).populate('user1', 'name profileImages age bio interests state').populate('user2', 'name profileImages age bio interests state')
            .sort({ lastMessageTime: -1 });

        const formattedMatches = matches.map(match => {
            const isUser1 = match.user1._id.toString() === userId;
            const otherUser = isUser1 ? match.user2 : match.user1;
            const unread = isUser1 ? (match.unreadCount_user1 || 0) : (match.unreadCount_user2 || 0);

            console.log(`Match ${match._id}: isUser1=${isUser1}, Unread=${unread}`);

            return {
                _id: match._id,
                user: otherUser,
                lastMessage: match.lastMessage,
                updatedAt: match.updatedAt || match.lastMessageTime,
                unreadCount: unread
            };
        });

        res.json(formattedMatches);
    } catch (error) {
        console.error('GetAllConversations Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark chat as read
// @route   POST /api/chat/read/:matchId
// @access  Private
const markAsRead = async (req, res) => {
    const { matchId } = req.params;
    const userId = req.user._id.toString();

    try {
        const match = await Match.findOne({
            $or: [
                { user1: userId, user2: matchId },
                { user1: matchId, user2: userId }
            ]
        });

        if (match) {
            if (match.user1.toString() === userId) {
                match.unreadCount_user1 = 0;
            } else {
                match.unreadCount_user2 = 0;
            }
            await match.save();
        }

        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getMessages, getAllConversations, markAsRead };
