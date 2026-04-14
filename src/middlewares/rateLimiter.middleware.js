const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const IORedis = require('ioredis');

const redisClient = new IORedis(process.env.REDIS_URL);

const globalWindowMs = parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 10) || 15 * 60 * 1000;
const globalMax = parseInt(process.env.RATE_LIMIT_GLOBAL_MAX, 10) || 100;

const strictWindowMs = parseInt(process.env.RATE_LIMIT_STRICT_WINDOW_MS, 10) || 60 * 60 * 1000;
const strictMax = parseInt(process.env.RATE_LIMIT_STRICT_MAX, 10) || 20;

const globalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: globalWindowMs,
  max: globalMax,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const heavyTaskLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: strictWindowMs,
  max: strictMax,
  message: { error: 'Image processing limit reached. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, heavyTaskLimiter };