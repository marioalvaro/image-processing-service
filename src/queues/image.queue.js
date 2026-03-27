const { Queue } = require('bullmq');
const IORedis = require('ioredis');


const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const imageQueue = new Queue('image-processing', { connection });

const enqueueImageJob = async (imageId, s3Key, originalName) => {
  await imageQueue.add('process-image', {
    imageId,
    s3Key,
    originalName
  }, {
    attempts: 3, 
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
};

module.exports = { imageQueue, enqueueImageJob };