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
            dob: user.dob,
            bio: user.bio,
            interests: user.interests,
            profileImages: user.profileImages,
            preferences: user.preferences,
            state: user.state,
            maritalStatus: user.maritalStatus,
            hobbies: user.hobbies,
            lookingFor: user.lookingFor,
            isPremium: user.isPremium,
            premiumExpiresAt: user.premiumExpiresAt,
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

        // Add missing fields update logic
        user.state = req.body.state || user.state;
        user.city = req.body.city || user.city;
        user.maritalStatus = req.body.maritalStatus || user.maritalStatus;
        user.hobbies = req.body.hobbies || user.hobbies;
        user.lookingFor = req.body.lookingFor || user.lookingFor;

        if (req.body.dob) {
            user.dob = req.body.dob;
            // Recalculate age from DOB
            const dobDate = new Date(user.dob);
            const today = new Date();
            let age = today.getFullYear() - dobDate.getFullYear();
            const m = today.getMonth() - dobDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
                age--;
            }
            user.age = age;
        } else if (req.body.age) {
            user.age = req.body.age;
        }

        if (req.body.gender) {
            let g = req.body.gender;
            if (g === 'Male') g = 'Men';
            if (g === 'Female') g = 'Women';
            user.gender = g;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            phoneNumber: updatedUser.phoneNumber,
            bio: updatedUser.bio,
            state: updatedUser.state,
            city: updatedUser.city,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        // Base Filter: Always exclude current user
        let query = {
            _id: { $ne: user._id }
        };

        // 1. Gender Filter
        if (user.preferences.gender !== 'Everyone') {
            query.gender = user.preferences.gender;
        }

        // 2. Age Filter
        if (user.preferences.ageRange) {
            query.age = {
                $gte: user.preferences.ageRange.min,
                $lte: user.preferences.ageRange.max
            };
        }

        // 3. Photos Only Filter
        if (user.preferences.showPhotosOnly) {
            query.profileImages = { $not: { $size: 0 } }; // Array not empty
        }

        // 4. Location (State/City) Filter
        // If expandSearch is FALSE, we strict filter by state AND city if available
        if (!user.preferences.expandSearch) {
            if (user.state) query.state = user.state;
            if (user.city) query.city = user.city;
        }

        // Execute Query with Pagination
        const users = await User.find(query)
            .skip(skip)
            .limit(limit);

        res.json(users);

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
        const { durationInDays } = req.body; // Expect duration in days
        const user = await User.findById(req.user._id);

        if (user) {
            const now = new Date();
            let newExpiryDate;

            // If already premium and not expired, extend from current expiry
            if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > now) {
                newExpiryDate = new Date(user.premiumExpiresAt);
                newExpiryDate.setDate(newExpiryDate.getDate() + (durationInDays || 30));
            } else {
                // Otherwise start from now
                newExpiryDate = new Date();
                newExpiryDate.setDate(newExpiryDate.getDate() + (durationInDays || 30));
            }

            user.isPremium = true;
            user.premiumExpiresAt = newExpiryDate;

            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isPremium: user.isPremium,
                premiumExpiresAt: user.premiumExpiresAt,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search users with filters
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
    try {
        const { gender, minAge, maxAge, interests, city, state } = req.query;
        const currentUser = req.user;

        let query = {
            _id: { $ne: currentUser._id } // Exclude current user
        };

        // Gender Filter
        if (gender && gender !== 'Everyone') {
            query.gender = gender;
        }

        // Age Filter
        if (minAge || maxAge) {
            query.age = {};
            if (minAge) query.age.$gte = parseInt(minAge);
            if (maxAge) query.age.$lte = parseInt(maxAge);
        }

        // Interests Filter (at least one matching interest)
        if (interests) {
            const interestList = interests.split(',').map(i => i.trim());
            if (interestList.length > 0) {
                query.interests = { $in: interestList };
            }
        }

        // Location Filter (Search)
        if (state) query.state = state;
        if (city) query.city = city;

        const users = await User.find(query).limit(50); // Limit results
        res.json(users);

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Server Error during search' });
    }
};

// @desc    Update FCM Token
// @route   PUT /api/users/fcm-token
// @access  Private
const updateFcmToken = async (req, res) => {
    const { fcmToken } = req.body;
    try {
        await User.findByIdAndUpdate(req.user._id, { fcmToken });
        res.json({ message: 'FCM Token updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating FCM Token' });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

module.exports = { getUserProfile, updateUserProfile, getDiscoveryUsers, updatePremiumStatus, searchUsers, updateFcmToken, deleteUser };
