const Review = require('../models/Review');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Add review to listing
// @route   POST /api/v1/listings/:id/reviews
exports.createReview = catchAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ApiError('Listing not found', 404);
  }

  // Check if user already reviewed this listing
  const existing = await Review.findOne({
    listing: req.params.id,
    user: req.user._id,
  });

  if (existing) {
    throw new ApiError('You have already reviewed this listing', 400);
  }

  const review = await Review.create({
    listing: req.params.id,
    user: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, data: review });
});

// @desc    Get reviews for a listing
// @route   GET /api/v1/listings/:id/reviews
exports.getListingReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ listing: req.params.id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: reviews });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
exports.deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError('Review not found', 404);
  }

  // Only review owner or admin can delete
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new ApiError('Not authorized to delete this review', 403);
  }

  await Review.findOneAndDelete({ _id: req.params.id });

  res.status(200).json({ success: true, message: 'Review deleted' });
});
