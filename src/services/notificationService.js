const admin = require('../config/firebase');

const sendNotification = async (token, title, body, data = {}) => {
    if (!token) return;

    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK' // Standard for Flutter
            },
            token: token
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = {
    sendNotification
};
