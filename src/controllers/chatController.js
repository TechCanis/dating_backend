const firebaseConfig = require('../config/firebase'); // Initialized firebase-admin
const User = require('../models/User');
const Match = require('../models/Match');

// @desc    Send a message (Write to RTDB & Send FCM)
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
    const { text, matchId, recipientId } = req.body;
    const senderId = req.user._id.toString();

    if (!text || !recipientId) {
        return res.status(400).json({ message: 'Text and recipientId are required' });
    }

    try {
        // 1. Write to Firebase Realtime Database
        // Structure: /chats/{minId_maxId}/{messageId}
        const chatId = [senderId, recipientId].sort().join('_');
        const db = firebaseConfig.database();
        const ref = db.ref(`chats/${chatId}`);
        const newMessageRef = ref.push();

        const messageData = {
            senderId,
            text,
            timestamp: firebaseConfig.database.ServerValue.TIMESTAMP
        };

        await newMessageRef.set(messageData);

        // 2. Update Match Document in MongoDB (for recent chats list)
        // Find match where user1=sender, user2=recipient OR user1=recipient, user2=sender
        const match = await Match.findOne({
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
            console.log(`Chat: Updated unread counts. U1: ${match.unreadCount_user1}, U2: ${match.unreadCount_user2}`);
            await match.save();
        } else {
            // Create new "Soft Match" / Conversation
            await Match.create({
                user1: senderId,
                user2: recipientId,
                isMatched: false,
                lastMessage: text,
                lastMessageTime: new Date(),
                unreadCount_user1: senderId === recipientId ? 1 : 0, // Should not happen self-msg
                unreadCount_user2: senderId !== recipientId ? 1 : 0  // Recipient (user2) gets 1 unread
            });
            console.log('Chat: Created new conversation with unread counts.');
            // Note: In create above, I assumed sender is user1. If I enforce order elsewhere, might differ.
            // But usually sender=user1 for new creation is fine.
            // Better to be safe: user1 is senderId, user2 is recipientId.
            // So unreadCount_user2 = 1.
        }

        // 3. Signal Firebase for "List Refresh" (Lightweight update)
        console.log(`Chat: Signaling update to user_updates/${recipientId}/last_update`);
        await db.ref(`user_updates/${recipientId}/last_update`).set(firebaseConfig.database.ServerValue.TIMESTAMP);


        // 4. Fetch Recipient for FCM Token
        const recipient = await User.findById(recipientId);

        if (recipient && recipient.fcmToken) {
            // 5. Send FCM Notification
            const message = {
                notification: {
                    title: req.user.name,
                    body: text,
                },
                data: {
                    type: 'CHAT',
                    chatId: chatId,
                    senderId: senderId,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK'
                },
                token: recipient.fcmToken
            };

            await firebaseConfig.messaging().send(message)
                .catch(err => console.error('Error sending FCM:', err));
        }

        res.status(201).json({ message: 'Message sent', messageId: newMessageRef.key });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a specific chat (API Fallback)
// @route   GET /api/chat/:matchId
// @access  Private
const getMessages = async (req, res) => {
    const { matchId } = req.params;
    const currentUserId = req.user._id.toString();

    try {
        const chatId = [currentUserId, matchId].sort().join('_');
        const db = firebaseConfig.database();
        const ref = db.ref(`chats/${chatId}`);

        const snapshot = await ref.orderByChild('timestamp').once('value');
        const messages = [];

        snapshot.forEach(child => {
            messages.push(child.val());
        });

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
