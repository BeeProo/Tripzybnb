const Wishlist = require('../models/Wishlist');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get user's wishlist
// @route   GET /api/v1/wishlist
exports.getWishlist = catchAsync(async (req, res) => {
  const items = await Wishlist.find({ user: req.user._id })
    .populate('listing')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: items });
});

// @desc    Add to wishlist
// @route   POST /api/v1/wishlist
exports.addToWishlist = catchAsync(async (req, res) => {
  const { listing: listingId } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError('Listing not found', 404);
  }

  // Check if already in wishlist
  const existing = await Wishlist.findOne({
    user: req.user._id,
    listing: listingId,
  });

  if (existing) {
    throw new ApiError('Already in wishlist', 400);
  }

  const item = await Wishlist.create({
    user: req.user._id,
    listing: listingId,
  });

  await item.populate('listing');

  res.status(201).json({ success: true, data: item });
});

// @desc    Remove from wishlist
// @route   DELETE /api/v1/wishlist/:listingId
exports.removeFromWishlist = catchAsync(async (req, res) => {
  const result = await Wishlist.findOneAndDelete({
    user: req.user._id,
    listing: req.params.listingId,
  });

  if (!result) {
    throw new ApiError('Not in wishlist', 404);
  }

  res.status(200).json({ success: true, message: 'Removed from wishlist' });
});

// @desc    Check if listing is in wishlist
// @route   GET /api/v1/wishlist/check/:listingId
exports.checkWishlist = catchAsync(async (req, res) => {
  const item = await Wishlist.findOne({
    user: req.user._id,
    listing: req.params.listingId,
  });

  res.status(200).json({ success: true, inWishlist: !!item });
});
