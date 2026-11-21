const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const shouldSkipInTest = (req) =>
  env.nodeEnv === 'test' && !req.headers['x-test-rate-limit'];

const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipInTest,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipInTest,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
