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
            // match.isMatched = true; // Should be true already
            await match.save();
        }

        // 3. Fetch Recipient for FCM Token
        const recipient = await User.findById(recipientId);

        if (recipient && recipient.fcmToken) {
            // 4. Send FCM Notification
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

module.exports = { sendMessage };
