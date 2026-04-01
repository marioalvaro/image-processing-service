require('dotenv').config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const sharp = require('sharp');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const TransformerFactory = require('../transformers/TransformerFactory');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const redisConnection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) { chunks.push(chunk); }
  return Buffer.concat(chunks);
};

console.log('👷 Background Worker started...');

const worker = new Worker('image-processing', async (job) => {
  const { imageId, s3Key, transformations } = job.data;
  console.log(`[Job ${job.id}] Processing image transformations...`);

  try {
    const getCommand = new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: s3Key });
    const s3Response = await s3Client.send(getCommand);
    const rawBuffer = await streamToBuffer(s3Response.Body);

    let imagePipeline = sharp(rawBuffer);

    const transformerList = TransformerFactory.buildPipeline(transformations);

    for (const transformer of transformerList) {
      imagePipeline = await transformer.transform(imagePipeline);
    }

    // Finalize format
    const format = transformations.format || 'jpeg'; 
    const processedBuffer = await imagePipeline.toBuffer();
    const transformedKey = `transformed-${s3Key.split('.')[0]}.${format}`;
    
    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: transformedKey,
      Body: processedBuffer,
      ContentType: `image/${format}`,
    });
    await s3Client.send(putCommand);

    const transformedUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${transformedKey}`;

    // Update database
    const currentImage = await prisma.image.findUnique({ where: { id: imageId } });
    await prisma.image.update({
      where: { id: imageId },
      data: {
        transformedUrl: transformedUrl,
        metadata: { 
            ...currentImage.metadata, 
            processedAt: new Date().toISOString() 
        }
      },
    });

    console.log(`[Job ${job.id}] ✅ Successfully completed.`);
    return { success: true, transformedUrl };

  } catch (error) {
    console.error(`[Job ${job.id}] ❌ Failed:`, error.message);
    throw error; 
  }
}, { connection: redisConnection });