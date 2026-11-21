const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

/**
 * POST /api/auth/login
 * Authenticate active user (Admin/HR -> Admin Console, Employee/Manager -> User Portal)
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
  login,
  getMe,
};
