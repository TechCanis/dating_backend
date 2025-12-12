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

    // Basic recommendation logic: 
    // 1. Exclude current user
    // 2. Filter by gender preference
    // 3. Filter by age preference (TODO)
    // 4. Filter by location/distance (TODO: GeoJSON query)

    let filter = {
        _id: { $ne: user._id },
        state: user.state // Match users in same state
    };

    if (user.preferences.gender !== 'Everyone') {
        filter.gender = user.preferences.gender; // Assumes 'Men', 'Women' match
    }

    try {
        const users = await User.find(filter).limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile, getDiscoveryUsers };
