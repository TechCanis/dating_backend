const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const demoActivityService = require('../services/demoActivityService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    // ... (existing register implementation, unchanged for now or update if needed)
    // ... (existing register implementation, unchanged for now or update if needed)
    const { phoneNumber, name, gender, age, bio, interests, profileImages, state, city, interestedIn, maritalStatus, hobbies, lookingFor } = req.body;

    try {
        const userExists = await User.findOne({ phoneNumber });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Normalize gender
        let normalizedGender = gender;
        if (gender === 'Male') normalizedGender = 'Men';
        if (gender === 'Female') normalizedGender = 'Women';

        const user = await User.create({
            phoneNumber,
            name,
            gender: normalizedGender,
            age,
            bio,
            interests,
            profileImages,
            state,
            city: req.body.city,
            maritalStatus,
            hobbies,
            lookingFor,
            preferences: {
                gender: interestedIn || 'Everyone',
                ageRange: {
                    min: req.body.preferredAgeMin || 18,
                    max: req.body.preferredAgeMax || 60
                },
                distance: 50,
                showPhotosOnly: false,
                expandSearch: true
            }
        });

        if (user) {
            // Schedule Demo User Activity
            demoActivityService.scheduleActivity(user._id);

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

// @desc    Login user (Verify OTP) - DEPRECATED for pure backend, but kept for legacy
// @desc    Login user (Verify OTP) - DEPRECATED for pure backend, but kept for legacy
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    try {
        const user = await User.findOne({ phoneNumber });

        if (user) {
            // FIXED DEMO OTP - DISABLED FOR PRODUCTION
            /*
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
            */
            res.status(400).json({ message: 'Direct Login Disabled. Use Firebase/Otpless.' });
        } else {
            res.status(404).json({ message: 'User not found. Please register.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const firebaseConfig = require('../config/firebase');

// @desc    Firebase Login (Exchange ID Token for App JWT)
// @route   POST /api/auth/firebase-login
// @access  Public
const firebaseLogin = async (req, res) => {
    const { idToken } = req.body;

    try {
        // 1. Verify Firebase ID Token
        const decodedToken = await firebaseConfig.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Invalid Token: No phone number found' });
        }

        // 2. Find User by Phone Number
        const user = await User.findOne({ phoneNumber });

        if (user) {
            // 3. Generate App JWT
            res.json({
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                token: generateToken(user._id),
                isNewUser: false
            });
        } else {
            // User not found, frontend should redirect to Registration
            res.status(404).json({
                message: 'User not found',
                phoneNumber,
                isNewUser: true
            });
        }
    } catch (error) {
        console.error('Firebase Login Error:', error);
        res.status(401).json({ message: 'Invalid Firebase ID Token' });
    }
};

// @desc    Firebase Register
// @route   POST /api/auth/firebase-register
// @access  Public
const firebaseRegister = async (req, res) => {
    const { idToken, ...profileData } = req.body;

    try {
        // 1. Verify Firebase ID Token
        const decodedToken = await firebaseConfig.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Invalid Token: No phone number found' });
        }

        const userExists = await User.findOne({ phoneNumber });

        if (userExists) {
            // User already exists, so we log them in instead of erroring.
            return res.status(200).json({
                _id: userExists._id,
                name: userExists.name,
                phoneNumber: userExists.phoneNumber,
                token: generateToken(userExists._id),
                isNewUser: false
            });
        }

        const { name, gender, age, dob, bio, interests, profileImages, state, interestedIn, maritalStatus, hobbies, lookingFor } = profileData;

        // Normalize gender
        let normalizedGender = gender;
        if (gender === 'Male') normalizedGender = 'Men';
        if (gender === 'Female') normalizedGender = 'Women';

        const user = await User.create({
            phoneNumber,
            name,
            gender: normalizedGender,
            age,
            dob,
            bio,
            interests,
            profileImages,
            state,
            city: profileData.city,
            maritalStatus,
            hobbies,
            lookingFor,
            preferences: {
                gender: interestedIn || 'Everyone',
                ageRange: {
                    min: profileData.preferredAgeMin || 18,
                    max: profileData.preferredAgeMax || 60
                },
                distance: 50,
                showPhotosOnly: false,
                expandSearch: true
            }
        });

        // Schedule Demo User Activity
        demoActivityService.scheduleActivity(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error('Firebase Register Error:', error);
        res.status(401).json({ message: 'Registration Failed: ' + error.message });
    }
};

// @desc    Otpless Login
// @route   POST /api/auth/otpless-login
// @access  Public
const otplessLogin = async (req, res) => {
    const { token, phoneNumber: providedPhone } = req.body;

    try {
        // Ideally verify token with Otpless API here.
        // For now, we trust the phone number provided by the trusted status from SDK if strict verification isn't set up yet.

        if (!providedPhone) {
            return res.status(400).json({ message: 'Phone number required' });
        }

        // Ensure format +91...
        const phoneNumber = providedPhone;

        const user = await User.findOne({ phoneNumber });

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                token: generateToken(user._id),
                isNewUser: false
            });
        } else {
            // Note: This endpoint only CHECKS user presence for Otpless flow.
            // Actual registration happens via standard 'registerUser' likely,
            // OR frontend sends profile data later?
            // If Otpless flow involves automatic registration here, we'd need to create user.
            // BUT current logic returns 404 isNewUser:true, meaning frontend will call 'register' (or firebaseRegister? no, 'registerUser').
            // So we don't need to hook here. The hook in 'registerUser' covers it.
            res.status(404).json({
                message: 'User not found',
                phoneNumber,
                isNewUser: true
            });
        }

    } catch (error) {
        console.error('Otpless Login Error:', error);
        res.status(500).json({ message: 'Otpless Login Failed' });
    }
};


// @desc    Create Demo Account
// @route   POST /api/auth/create-demo-account
// @access  Public
const createDemoAccount = async (req, res) => {
    const {
        name, phoneNumber, gender, dob, bio,
        state, city,
        interestedIn, maritalStatus, hobbies, lookingFor, interests
    } = req.body;

    let profileImages = req.body.profileImages || [];

    // Handle File Uploads (Multipart)
    if (req.files && req.files.length > 0) {
        const protocol = req.protocol;
        const host = req.get('host');
        profileImages = req.files.map(file => `${protocol}://${host}/uploads/${file.filename}`);
    } else if (typeof profileImages === 'string') {
        profileImages = [profileImages];
    }

    try {
        const userExists = await User.findOne({ phoneNumber });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Calculate age from DOB
        let age = 18; // Default
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        // Normalize gender
        let normalizedGender = gender;
        if (gender === 'Male') normalizedGender = 'Men';
        if (gender === 'Female') normalizedGender = 'Women';

        const user = await User.create({
            phoneNumber,
            name,
            gender: normalizedGender,
            age,
            dob,
            bio,
            interests: interests || [],
            profileImages: profileImages || [],
            state,
            city,
            maritalStatus,
            hobbies: hobbies || [],
            lookingFor: lookingFor || [],
            user_type: 'demo',
            preferences: {
                gender: interestedIn || 'Everyone',
                ageRange: { min: 18, max: 99 },
                distance: 50
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

module.exports = { registerUser, loginUser, checkUser, firebaseLogin, firebaseRegister, otplessLogin, createDemoAccount };
