const express = require('express');
const { uploadImage, getImage, listImages, transformImage } = require('../controllers/image.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { heavyTaskLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

// Protect with JWT
router.use(authenticateToken);

// The 'image' string must match the key in form-data
router.post('/', heavyTaskLimiter, upload.single('image'), uploadImage);
router.post('/:id/transform', heavyTaskLimiter, transformImage);

router.get('/:id', getImage);
router.get('/', listImages);

module.exports = router;