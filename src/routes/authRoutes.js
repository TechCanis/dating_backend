const express = require('express');
const router = express.Router();
const { registerUser, loginUser, checkUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase-login', require('../controllers/authController').firebaseLogin);
router.post('/firebase-register', require('../controllers/authController').firebaseRegister);
router.post('/otpless-login', require('../controllers/authController').otplessLogin);
router.post('/check-user', checkUser);

module.exports = router;
