const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Delete a user (admin only)
// @route   DELETE /api/v1/users/:id
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return next(new ApiError('You cannot delete your own account', 400));
  }

  // Prevent deleting other admins
  if (user.role === 'admin') {
    return next(new ApiError('Cannot delete another admin', 403));
  }

  // Cascade: delete user's bookings and reviews
  await Booking.deleteMany({ user: user._id });
  await Review.deleteMany({ user: user._id });

  await user.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
