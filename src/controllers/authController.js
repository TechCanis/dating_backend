const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { phoneNumber, name, gender, age, bio, interests, profileImages, state, interestedIn } = req.body;

    try {
        const userExists = await User.findOne({ phoneNumber });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            phoneNumber,
            name,
            gender,
            age,
            bio,
            interests,
            profileImages,
            state,
            preferences: {
                gender: interestedIn || 'Everyone'
            }
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if user exists
// @route   POST /api/auth/check-user
// @access  Public
const checkUser = async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        const user = await User.findOne({ phoneNumber });
        if (user) {
            res.json({ exists: true });
        } else {
            res.status(404).json({ exists: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user (Verify OTP)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    try {
        const user = await User.findOne({ phoneNumber });

        if (user) {
            // FIXED DEMO OTP
            if (otp === '123456') {
                res.json({
                    _id: user._id,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    token: generateToken(user._id),
                });
            } else {
                res.status(401).json({ message: 'Invalid OTP' });
            }
        } else {
            res.status(404).json({ message: 'User not found. Please register.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, checkUser };
