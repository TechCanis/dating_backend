const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getDiscoveryUsers, updatePremiumStatus, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/premium', protect, updatePremiumStatus);
router.get('/discovery', protect, getDiscoveryUsers);
router.get('/search', protect, searchUsers);

module.exports = router;
