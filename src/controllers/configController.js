const appConfig = require('../config/appConfig');

// @desc    Get application configuration
// @route   GET /api/config/init
// @access  Public
const getConfig = (req, res) => {
    try {
        res.status(200).json(appConfig);
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getConfig
};
