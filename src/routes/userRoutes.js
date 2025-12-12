const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getDiscoveryUsers, updatePremiumStatus } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/premium', protect, updatePremiumStatus);
router.get('/discovery', protect, getDiscoveryUsers);

module.exports = router;
