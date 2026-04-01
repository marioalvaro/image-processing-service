const express = require('express');
const { uploadImage, getImage, listImages, transformImage } = require('../controllers/image.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Protect with JWT
router.use(authenticateToken);

// The 'image' string must match the key in form-data
router.post('/', upload.single('image'), uploadImage);
router.get('/:id', getImage);
router.get('/', listImages);
router.post('/:id/transform', transformImage);

module.exports = router;