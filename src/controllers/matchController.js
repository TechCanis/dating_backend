const Match = require('../models/Match');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// @desc    Like a user
// @route   POST /api/matches/like
// @access  Private
const likeUser = async (req, res) => {
    const { likedUserId } = req.body;
    const currentUserId = req.user._id;
    const currentUser = req.user; // Get full user object for name

    try {

        // Check if reverse match exists
        const existingMatch = await Match.findOne({
            user1: likedUserId,
            user2: currentUserId
        });

        if (existingMatch) {
            // Check if they rejected me
            if (existingMatch.isRejected) {
                // They rejected us, so do not match, do not notify.
                // We can just return success mimicking a successful like so the UI updates
                return res.json({ message: 'Liked' });
            }

            // It's a match!
            existingMatch.isMatched = true;

            await existingMatch.save();

            // Notify BOTH users
            const likedUser = await User.findById(likedUserId);

            // Notify the person who just got matched (the one being liked now)
            if (likedUser && likedUser.fcmToken) {
                await notificationService.sendNotification(
                    likedUser.fcmToken,
                    "It's a Match! 🎉",
                    `You and ${currentUser.name} liked each other!`,
                    { type: 'match', matchId: existingMatch._id.toString() }
                );
            }

            // Notify the current user (optional, usually UI handles this, but good for consistency)
            // But usually push is for when you are NOT in the app. 
            // The current user IS in the app performing the action.
            // So mainly notify the OTHER person.

            // Actually, if the OTHER person (user1) liked me (user2) a week ago, 
            // they need to know I just liked them back.
            // So yes, notify 'likedUser' (user1).

            return res.json({ message: 'It\'s a Match!', match: existingMatch });
        }

        // Check if I already liked them
        const myLike = await Match.findOne({
            user1: currentUserId,
            user2: likedUserId
        });

        if (myLike) {
            return res.status(400).json({ message: 'You already liked this user' });
        }

        // Create new "Like"
        const newMatch = await Match.create({
            user1: currentUserId,
            user2: likedUserId,
            isMatched: false // One-way like for now
        });

        // Notify the person being liked
        const likedUser = await User.findById(likedUserId);
        if (likedUser && likedUser.fcmToken) {
            await notificationService.sendNotification(
                likedUser.fcmToken,
                "New Like! 💖",
                `${currentUser.name} liked your profile!`,
                { type: 'like', userId: currentUserId.toString() }
            );
        }

        res.json({ message: 'Liked', match: newMatch });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Reject a user (Pass)
// @route   POST /api/matches/reject
// @access  Private
const rejectUser = async (req, res) => {
    const { rejectedUserId } = req.body;
    const currentUserId = req.user._id;

    try {
        const existingInteraction = await Match.findOne({
            user1: currentUserId,
            user2: rejectedUserId
        });

        if (existingInteraction) {
            return res.status(400).json({ message: 'You already interacted with this user' });
        }

        // Create a "Pass" interaction
        // We use the Match model but maybe add a status field or just imply based on isMatched=false?
        // But normal likes are also isMatched=false initially.
        // Let's assume we add a 'status' field to Match model: 'pending', 'matched', 'rejected'.
        // OR simpler given constraints: Just create a Match and maybe we need a way to distinguish Like vs Pass.

        // Let's add 'action' or 'status' to Match Schema or simply use a separate Pass mechanism.
        // Given current Match Schema is: user1, user2, isMatched.
        // If I 'Pass', I don't want to match ever. 
        // Force-fitting into Match model without schema change is risky.
        // Let's add `isRejected: true` to the Match document we create. *We need to update User/Match model or just add the field dynamically if Schema is loose*
        // checking the Match model first is safer.
        await Match.create({
            user1: currentUserId,
            user2: rejectedUserId,
            isMatched: false,
            isRejected: true // Need to ensure Schema allows this or is flexible
        });

        res.json({ message: 'User rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all matches
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
    const userId = req.user._id.toString();

    try {
        const matches = await Match.find({
            $and: [
                { $or: [{ user1: userId }, { user2: userId }] },
                {
                    $or: [
                        { isMatched: true },
                        { lastMessage: { $exists: true, $ne: null } }
                    ]
                }
            ]
        }).populate('user1', 'name profileImages age bio interests state city user_type').populate('user2', 'name profileImages age bio interests state city user_type');

        // Format results to show "the other person"
        const formattedMatches = matches.map(match => {
            const isUser1 = match.user1._id.toString() === userId;
            const otherUserDoc = isUser1 ? match.user2 : match.user1;
            const unread = isUser1 ? (match.unreadCount_user1 || 0) : (match.unreadCount_user2 || 0);

            // Handle Demo User location masking
            let otherUser = otherUserDoc ? otherUserDoc.toObject() : null;
            if (otherUser && otherUser.user_type === 'demo') {
                otherUser.city = req.user.city;
                otherUser.state = req.user.state;
            }

            return {
                _id: match._id,
                user: otherUser,
                lastMessage: match.lastMessage,
                updatedAt: match.updatedAt,
                unreadCount: unread
            };
        });

        res.json(formattedMatches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingLikes = async (req, res) => {
    const userId = req.user._id;

    try {
        // Find matches where user2 is me, and isMatched is false
        // This means user1 liked me, but I haven't liked back yet (or matched back)
        const pendingLikes = await Match.find({
            user2: userId,
            isMatched: false
        }).populate('user1', 'name age profileImages state city user_type');

        const formattedLikes = pendingLikes.map(match => {
            let u = match.user1.toObject();
            if (u.user_type === 'demo') {
                u.city = req.user.city;
                u.state = req.user.state;
            }
            return {
                _id: u._id,
                matchDocId: match._id,
                name: u.name,
                age: u.age,
                profileImages: u.profileImages,
                state: u.state,
                city: u.city,
                likedAt: match.createdAt
            };
        });

        res.json(formattedLikes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSentLikes = async (req, res) => {
    const userId = req.user._id;

    try {
        // Find matches where user1 is me, and isMatched is false (I liked them, no match from them yet)
        // AND isRejected is not true (exclude passed users)
        const sentLikes = await Match.find({
            user1: userId,
            isMatched: false,
            isRejected: { $ne: true }
        }).populate('user2');

        const formattedSentLikes = sentLikes.map(match => {
            let u = match.user2.toObject();
            if (u.user_type === 'demo') {
                u.city = req.user.city;
                u.state = req.user.state;
            }
            return {
                _id: u._id,
                matchDocId: match._id,
                name: u.name,
                age: u.age,
                profileImages: u.profileImages,
                state: u.state,
                city: u.city,
                bio: u.bio,
                likedAt: match.createdAt
            };
        });

        res.json(formattedSentLikes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { likeUser, rejectUser, getMatches, getPendingLikes, getSentLikes };
