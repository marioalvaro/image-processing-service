const multer = require('multer');

// Hold file in memory as a Buffer
const storage = multer.memoryStorage();

// TO Filter Non-Image Files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Hard limit of 10MB
  },
});

module.exports = upload;