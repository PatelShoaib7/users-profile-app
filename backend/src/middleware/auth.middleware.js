const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protects routes by verifying JWT Bearer token and ensuring account is active.
 */
const protect = asyncHandler(async (req, _res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Invalid or expired authentication token.');
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new ApiError(401, 'The user belonging to this token no longer exists.');
  }

  if (currentUser.status !== 'active') {
    throw new ApiError(403, 'Your account has been deactivated. Contact an administrator.');
  }

  req.user = currentUser;
  next();
});

/**
 * Role-based access control middleware.
 */
const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(
      new ApiError(
        403,
        `Access denied. Role '${req.user?.role || 'unknown'}' is not authorized for this action.`
      )
    );
  }
  return next();
};

module.exports = {
  protect,
  authorize,
};
