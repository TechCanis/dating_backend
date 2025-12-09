const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getDiscoveryUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/discovery', protect, getDiscoveryUsers);

module.exports = router;
