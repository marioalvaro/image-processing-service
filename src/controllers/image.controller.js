const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { uploadToS3 } = require('../services/storage.service');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const userId = req.user.userId;

    const s3Url = await uploadToS3(req.file);

    const image = await prisma.image.create({
      data: {
        userId: userId,
        originalUrl: s3Url,
        metadata: {
          size: req.file.size,
          mimetype: req.file.mimetype,
          originalName: req.file.originalname,
        },
      },
    });

    res.status(201).json({ message: 'Image uploaded successfully', image });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process image upload.' });
  }
};

const listImages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const images = await prisma.image.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { uploadImage, listImages };