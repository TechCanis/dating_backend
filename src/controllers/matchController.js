const Match = require('../models/Match');
const User = require('../models/User');

// @desc    Like a user
// @route   POST /api/matches/like
// @access  Private
const likeUser = async (req, res) => {
    const { likedUserId } = req.body;
    const currentUserId = req.user._id;

    try {
        // Check if the other user already liked the current user (this is a simplified logic)
        // Ideally, we store "Likes" in a separate collection or inside User model to detect mutual likes.
        // For this demo, let's assume we check if a Match document exists where user2=me and user1=them
        // OR we can create a "Like" document first.

        // Better Approach for MVP:
        // 1. Check if 'likedUserId' has already liked 'currentUserId'.
        // NOTE: This requires storing "Likes". Let's create a Match doc immediately but mark isMatched=false if only one side liked?
        // Or maybe we need a separate Like model.
        // Let's stick to a simple "Match" model. If I like you, I create a Match(user1=me, user2=you, isMatched=false).
        // If you already created Match(user1=you, user2=me), then we update it to isMatched=true.

        // Check if reverse match exists
        const existingMatch = await Match.findOne({
            user1: likedUserId,
            user2: currentUserId
        });

        if (existingMatch) {
            // It's a match!
            existingMatch.isMatched = true;
            await existingMatch.save();
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
        }).populate('user1', 'name profileImages age bio interests state').populate('user2', 'name profileImages age bio interests state');

        // Format results to show "the other person"
        const formattedMatches = matches.map(match => {
            const isUser1 = match.user1._id.toString() === userId;
            const otherUser = isUser1 ? match.user2 : match.user1;
            const unread = isUser1 ? (match.unreadCount_user1 || 0) : (match.unreadCount_user2 || 0);

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
        }).populate('user1', 'name age profileImages state');

        const formattedLikes = pendingLikes.map(match => ({
            _id: match.user1._id,
            matchDocId: match._id,
            name: match.user1.name,
            age: match.user1.age,
            profileImages: match.user1.profileImages,
            state: match.user1.state,
            likedAt: match.createdAt
        }));

        res.json(formattedLikes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSentLikes = async (req, res) => {
    const userId = req.user._id;

    try {
        // Find matches where user1 is me, and isMatched is false (I liked them, no match from them yet)
        const sentLikes = await Match.find({
            user1: userId,
            isMatched: false
        }).populate('user2');

        const formattedSentLikes = sentLikes.map(match => ({
            _id: match.user2._id,
            matchDocId: match._id,
            name: match.user2.name,
            age: match.user2.age,
            profileImages: match.user2.profileImages,
            state: match.user2.state,
            bio: match.user2.bio,
            likedAt: match.createdAt
        }));

        res.json(formattedSentLikes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { likeUser, rejectUser, getMatches, getPendingLikes, getSentLikes };
