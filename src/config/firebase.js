const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

try {
    const serviceAccount = require('../../serviceAccountKey.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    console.log('Firebase Admin Initialized');
} catch (error) {
    console.error('Firebase Admin Initialization Failed. Make sure serviceAccountKey.json exists in backend root.', error.message);
}

module.exports = admin;
