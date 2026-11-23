const express = require('express');
const Joi = require('joi');
const {
  getPublicKey,
  login,
  demoRoleLogin,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const validate = require('../middleware/validate.middleware');
const { loginSchema } = require('../validators/auth.validator');
const { decryptPasswordMiddleware } = require('../utils/passwordCipher');

const router = express.Router();

const demoLoginSchema = Joi.object({
  role: Joi.string().valid('admin', 'hr', 'user').required(),
});

router.get('/public-key', getPublicKey);
router.post('/login', authLimiter, decryptPasswordMiddleware, validate(loginSchema), login);
router.post('/demo-login', authLimiter, validate(demoLoginSchema), demoRoleLogin);
router.get('/me', protect, getMe);

module.exports = router;
