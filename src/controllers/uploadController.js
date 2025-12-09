const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Public (or Private)
const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the URL. Assumes server is hosting 'uploads' folder publicly.
    // Construct URL based on host.
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/${req.file.path}`;

    res.status(200).json({
        message: 'Image uploaded',
        imageUrl: fileUrl
    });
};

module.exports = { upload, uploadImage };
