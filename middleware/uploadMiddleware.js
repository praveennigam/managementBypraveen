// middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

// Define storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    // Creating a unique filename using timestamp and original file extension
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// File filter function to allow only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);  // Reject the file but don't throw error
    req.fileValidationError = 'Only image files are allowed!';  // Custom error message
  }
};

// Multer configuration with storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB size limit
});

module.exports = upload;
