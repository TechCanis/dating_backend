const User = require('../models/User');
const Match = require('../models/Match');

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
            city: user.city,
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
        // 0. Get IDs of users already liked/rejected/matched
        // We look for any Match document where current user is user1 (User Liked X)
        // OR user2 (X Liked User -> we probably shouldn't show them in discovery if we haven't acted? 
        // Actually, if someone liked me, they should appear in "Pending Likes", not necessarily discovery? 
        // Standard app behavior: IF they liked me, they might still show up in discovery usually with a "Liked you" tag or just normal.
        // BUT the user request says: "once i reject or like any account then don't show that profile again".

        // So we filter out anyone who is in 'user2' position of a match initiated by ME (user1).
        // AND anyone I explicitly "Rejected" (Need a Rejected model or status).

        // Since we don't have a "Reject" model yet, let's assume 'likeUser' creates a Match.
        // We need a 'rejectUser' endpoint which creates a Match with explicit 'isRejected' flag or similar.
        // For now, let's filter out users I have ALREADY LIKED (User1 = Me).

        const interactions = await Match.find({ user1: user._id }).select('user2');
        const interactedUserIds = interactions.map(i => i.user2);

        // Also exclude myself
        interactedUserIds.push(user._id);

        let query = {
            _id: { $nin: interactedUserIds }
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
            query.profileImages = { $not: { $size: 0 } };
        }

        // 4. Location Filter (Complex with Demo Users)
        // Logic: Real users must match location if strict. Demo users (user_type='demo') are always valid but we override their location in memory.

        if (!user.preferences.expandSearch) {
            // Strict Location: Match State/City OR be a Demo User
            // MongoDB query for: (State=X AND City=Y) OR (user_type='demo')
            // But we still apply other filters.

            query.$or = [
                { state: user.state, city: user.city },
                { user_type: 'demo' }
            ];
        }

        // Execute Query using Aggregation Sample for Randomness
        // Note: $sample does NOT work with skip because it reshuffles every time.
        // We accept that "page 2" is just "next random batch".
        // With 'interactedUserIds' filtering, the pool shrinks as user interacts.
        const users = await User.aggregate([
            { $match: query },
            { $sample: { size: limit } }
        ]);

        // Post-processing: Override location for Demo Users
        const processedUsers = users.map(u => {
            // Aggregate returns plain objects, so we don't need toObject()
            // We clone it to avoid mutating the original array elements just in case
            const userObj = { ...u };

            if (userObj.user_type === 'demo') {
                userObj.state = user.state;
                userObj.city = user.city;
                // Also can randomize distance if needed
                userObj.distance = Math.floor(Math.random() * 10) + 1;
            }
            return userObj;
        });

        res.json(processedUsers);

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
        // logic: If searching for a location, INCLUDE demo users as if they are there.
        if (state || city) {
            const locFilter = {};
            if (state) locFilter.state = state;
            if (city) locFilter.city = city;

            query.$or = [
                locFilter,
                { user_type: 'demo' }
            ];
        }

        const users = await User.find(query).limit(50);

        // Post-processing: Override location for Demo Users matches
        const processedUsers = users.map(u => {
            const userObj = u.toObject(); // Search uses .find(), so toObject() is valid here (unlike aggregate)
            if (userObj.user_type === 'demo') {
                // If the search specified a city, adopt it. 
                // If not (e.g. only state), adopt user's city or the searched state?
                // Let's adopt the CURRENT USER's location or the SEARCHED location?
                // User expectation: "Show demo accounts... with same city name as user". 
                // So we should probably use the User's actual location? Or the Searched location?
                // If I search "New York", I expect results to be "New York".
                if (city) userObj.city = city;
                if (state) userObj.state = state;

                // If search didn't specify, maybe fallback to user's?
                if (!city && currentUser.city) userObj.city = currentUser.city;
                if (!state && currentUser.state) userObj.state = currentUser.state;

                userObj.distance = Math.floor(Math.random() * 10) + 1;
            }
            return userObj;
        });

        res.json(processedUsers);

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
