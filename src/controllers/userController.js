const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            gender: user.gender,
            age: user.age,
            bio: user.bio,
            interests: user.interests,
            profileImages: user.profileImages,
            preferences: user.preferences,
            state: user.state,
            isPremium: user.isPremium,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.bio = req.body.bio || user.bio;
        user.interests = req.body.interests || user.interests;
        user.profileImages = req.body.profileImages || user.profileImages;
        user.preferences = req.body.preferences || user.preferences;
        // ... add other updatable fields as needed

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            phoneNumber: updatedUser.phoneNumber,
            bio: updatedUser.bio,
            // ...
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get users for discovery
// @route   GET /api/users/discovery
// @access  Private
const getDiscoveryUsers = async (req, res) => {
    const user = req.user;

    try {
        // Base Filter: Always exclude current user
        let baseFilter = {
            _id: { $ne: user._id }
        };

        // 1. Gender Filter
        if (user.preferences.gender !== 'Everyone') {
            baseFilter.gender = user.preferences.gender;
        }

        // 2. Age Filter
        if (user.preferences.ageRange) {
            baseFilter.age = {
                $gte: user.preferences.ageRange.min,
                $lte: user.preferences.ageRange.max
            };
        }

        // 3. Photos Only Filter
        if (user.preferences.showPhotosOnly) {
            baseFilter.profileImages = { $not: { $size: 0 } }; // Array not empty
        }

        // 4. Location (State) Filter Strategy
        let localMatches = [];

        // Primary Query: Match State
        const localFilter = { ...baseFilter, state: user.state };
        localMatches = await User.find(localFilter).limit(10);

        // 5. Expand Search Logic
        let expandedMatches = [];
        if (localMatches.length < 10 && user.preferences.expandSearch) {
            const limit = 10 - localMatches.length;
            const excludeIds = [user._id, ...localMatches.map(u => u._id)];

            const expandFilter = {
                ...baseFilter,
                _id: { $nin: excludeIds } // Exclude already found local matches
            };

            expandedMatches = await User.find(expandFilter).limit(limit);
        }

        // Combine
        res.json([...localMatches, ...expandedMatches]);

    } catch (error) {
        console.error('Discovery Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upgrade user to premium
// @route   POST /api/users/premium
// @access  Private
const updatePremiumStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.isPremium = true;
            await user.save();
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isPremium: user.isPremium,
                // Assuming generateToken is defined elsewhere or not needed for this response
                // token: generateToken(user._id), 
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile, getDiscoveryUsers, updatePremiumStatus };
