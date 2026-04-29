const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// Protect routes - require authentication
const protect = catchAsync(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token) {
    throw new ApiError('Not authorized, please log in', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      throw new ApiError('User not found', 401);
    }
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Not authorized, invalid token', 401);
  }
});

// Admin only middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new ApiError('Not authorized as admin', 403);
  }
};

// Host or Admin middleware
const hostOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'host' || req.user.role === 'admin')) {
    next();
  } else {
    throw new ApiError('Not authorized. Host or admin access required.', 403);
  }
};

module.exports = { protect, admin, hostOrAdmin };
