const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isMatched: { type: Boolean, default: false }, // True if both liked
    lastMessage: { type: String },
    lastMessageTime: { type: Date },
    unreadCount_user1: { type: Number, default: 0 },
    unreadCount_user2: { type: Number, default: 0 },
}, { timestamps: true });

// Ensure unique pair regardless of order (handled in controller usually, but index helps)
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
