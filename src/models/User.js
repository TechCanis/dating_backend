const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ['Men', 'Women', 'Other'], required: true },
    bio: { type: String },
    age: { type: Number, required: true },
    profileImages: [{ type: String }], // URLs to images
    interests: [{ type: String }],
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number], // [longitude, latitude]
    },
    preferences: {
        ageRange: { min: { type: Number, default: 18 }, max: { type: Number, default: 99 } },
        distance: { type: Number, default: 50 }, // km
        gender: { type: String, enum: ['Men', 'Women', 'Everyone'], default: 'Everyone' },
    },
    isPremium: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
