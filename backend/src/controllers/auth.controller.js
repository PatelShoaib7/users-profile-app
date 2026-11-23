const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models/User');
const { getPublicKeyPem } = require('../utils/passwordCipher');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

/**
 * GET /api/auth/public-key
 * Returns RSA-OAEP-SHA256 SPKI public key so frontend can encrypt passwords before transit
 */
const getPublicKey = (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      publicKey: getPublicKeyPem(),
      algorithm: 'RSA-OAEP-256',
      ...(env.nodeEnv !== 'production'
        ? {
            demoEmails: {
              admin: env.seed.adminEmail,
              hr: env.seed.hrEmail,
              user: env.seed.userEmail,
            },
          }
        : {}),
    },
  });
};

/**
 * POST /api/auth/login
 * Authenticate active user (password arrives RSA-OAEP encrypted from client)
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.status !== 'active') {
    throw new ApiError(
      403,
      'Your account is currently inactive. Please contact an administrator.'
    );
  }

  const token = signToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: user.toJSON(),
    },
  });
});

/**
 * POST /api/auth/demo-login
 * Development-only role switcher so demo accounts can be previewed WITHOUT sending or storing passwords in frontend
 */
const demoRoleLogin = asyncHandler(async (req, res) => {
  if (env.nodeEnv === 'production') {
    throw new ApiError(403, 'Demo quick-login is disabled in production.');
  }

  const requestedRole = req.body?.role || 'admin';
  let targetEmail = env.seed.adminEmail;
  if (requestedRole === 'hr') targetEmail = env.seed.hrEmail;
  else if (requestedRole === 'user') targetEmail = env.seed.userEmail;

  const user = targetEmail
    ? await User.findOne({ email: targetEmail, status: 'active' })
    : await User.findOne({
        role: requestedRole === 'user' ? 'employee' : requestedRole,
        status: 'active',
      });

  if (!user) {
    throw new ApiError(404, `No active demo account found for role '${requestedRole}'.`);
  }

  const token = signToken(user);

  res.status(200).json({
    success: true,
    message: `Signed in as demo ${user.role}`,
    data: {
      token,
      user: user.toJSON(),
    },
  });
});

/**
 * GET /api/auth/me
 * Return currently authenticated user profile
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user.toJSON(),
    },
  });
});

module.exports = {
  getPublicKey,
  login,
  demoRoleLogin,
  getMe,
};
