const User = require('../models/User');
// We need these controllers/services to reuse their logic properly or duplicate minimal parts
const Match = require('../models/Match');
const Message = require('../models/Message');
const notificationService = require('./notificationService');
const socket = require('../socket'); // To emit message events

// Helper for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scheduleActivity = (newUserId) => {
    // Random delay between 5 and 10 minutes (300,000 to 600,000 ms)
    const minDelay = 5 * 60 * 1000;
    const maxDelay = 10 * 60 * 1000;
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);

    console.log(`[DemoActivity] Scheduled activity for user ${newUserId} in ${randomDelay / 1000 / 60} minutes.`);

    setTimeout(async () => {
        try {
            await executeDemoActivity(newUserId);
        } catch (error) {
            console.error('[DemoActivity] Execution failed:', error);
        }
    }, randomDelay);
};

const executeDemoActivity = async (targetUserId) => {
    console.log(`[DemoActivity] Executing activity for ${targetUserId}`);
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return;

    // 1. Find a random Demo User
    // Ideally one who hasn't matched yet, or just any random one.
    // We filter by opposite gender if available, or just random.
    let genderFilter = {};
    if (targetUser.gender === 'Men') genderFilter.gender = 'Women';
    else if (targetUser.gender === 'Women') genderFilter.gender = 'Men';

    const demoUsers = await User.aggregate([
        { $match: { user_type: 'demo', ...genderFilter } },
        { $sample: { size: 1 } }
    ]);

    if (demoUsers.length === 0) {
        console.log('[DemoActivity] No demo users found.');
        return;
    }

    const demoUser = demoUsers[0];
    console.log(`[DemoActivity] Selected demo user: ${demoUser.name} (${demoUser._id})`);

    // 2. Perform "Like"
    // Reuse logic similar to likeUser but direct DB operation to avoid req/res cycle
    let match = await Match.findOne({
        user1: demoUser._id,
        user2: targetUser._id
    });

    if (!match) {
        // Create the Like
        match = await Match.create({
            user1: demoUser._id,
            user2: targetUser._id,
            isMatched: false
        });

        // Notification: Like
        if (targetUser.fcmToken) {
            await notificationService.sendNotification(
                targetUser.fcmToken,
                "New Like! 💖",
                `${demoUser.name} liked your profile!`,
                { type: 'like', userId: demoUser._id.toString() }
            );
        }
        console.log('[DemoActivity] Like sent.');
    }

    // 3. Send a Message (Wait a bit more, say 30 seconds after like)
    await delay(30000);

    // Ensure match exists (it should now)
    // Actually, to send a message, usually they need to match.
    // If I message you without matching, it shows in "Requests" or similar?
    // In our app, chat usually requires a Match. 
    // BUT, a "Like" isn't a "Match" yet.
    // If we want to message, we might need to FORCE a match?
    // "make it look natural like someone really liked me and messaged" implies they want a conversation.
    // If I just like you, you see "Someone liked you". You have to like back to chat.
    // Unless valid premium feature allows messaging before match?
    // Let's assume for this "Demo" experience, the demo user "Super Likes" or similar which forces a visual message?

    // OR: We just send the message. If the app UI restricts showing messages from non-matches, this won't be seen.
    // Let's check logic: getConversations filters by `lastMessage`.
    // It finds matches where `user1` OR `user2` is ME. 
    // If I (Demo) message You (Target), I am User1. You are User2.
    // IsMatched is false. 
    // `getAllConversations` query:
    // { $or: [{ user1: userId }, { user2: userId }] } AND { lastMessage: exists }
    // It DOES NOT check `isMatched: true`.
    // So if we write a message, it WILL appear in their inbox even if not matched!
    // This effectively acts as a "Request" or "Direct Message".

    const messages = [
        "Hello 👋",
        "Hi 😊",
        "Hey 👋",
        "Hello there 🙂",
        "Hi there 👋",
        "Hey! How are you? 😊",
        "Hello! Hope you're doing well 🌟",
        "Hi! Have a great day ☀️",
        "Hey there 😄",
        "Hello 🙂"
    ];
    const text = messages[Math.floor(Math.random() * messages.length)];

    // Create Message
    const msg = await Message.create({
        matchId: match._id,
        sender: demoUser._id,
        text: text,
        read: false
    });

    match.lastMessage = text;
    match.lastMessageTime = new Date();
    // Increment unread for target (user2 usually if demo is user1)
    if (match.user1.toString() === targetUser._id.toString()) {
        match.unreadCount_user1 = (match.unreadCount_user1 || 0) + 1;
    } else {
        match.unreadCount_user2 = (match.unreadCount_user2 || 0) + 1;
    }
    await match.save();

    // Socket Emit (if user is online)
    const io = socket.getIo();
    try {
        io.to(targetUser._id.toString()).emit('new_message', {
            _id: msg._id,
            matchId: match._id,
            sender: demoUser._id,
            text: text,
            createdAt: msg.createdAt
        });
    } catch (e) { /* Socket might not be init if no connection */ }

    // Notification: Message
    if (targetUser.fcmToken) {
        await notificationService.sendNotification(
            targetUser.fcmToken,
            `Message from ${demoUser.name}`,
            text,
            {
                type: 'chat_message',
                matchId: match._id.toString(),
                senderId: demoUser._id.toString()
            }
        );
    }
    console.log(`[DemoActivity] Message sent: "${text}"`);
};

module.exports = { scheduleActivity };
