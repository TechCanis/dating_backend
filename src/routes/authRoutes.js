const express = require('express');
const router = express.Router();
const { registerUser, loginUser, checkUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/check-user', checkUser);

module.exports = router;
