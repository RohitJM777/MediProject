const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../lib/redis'); // your Redis client

exports.limiter = rateLimit({
  store: new RedisStore({
    // Pass the ioredis or node-redis client directly
    sendCommand: (...args) => redisClient.sendCommand(args),
    // OR for node-redis v4+:
    // client: redisClient
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
