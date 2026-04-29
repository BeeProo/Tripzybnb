const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all listings with search, filter, sort, pagination
// @route   GET /api/v1/listings
exports.getListings = catchAsync(async (req, res) => {
  const {
    search,
    city,
    country,
    tags,
    amenities,
    minPrice,
    maxPrice,
    minRating,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  // Location filters
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (country) filter['location.country'] = new RegExp(country, 'i');

  // Tags filter
  if (tags) {
    const tagArray = tags.split(',').map((t) => t.trim().toLowerCase());
    filter.tags = { $in: tagArray };
  }

  // Amenities filter
  if (amenities) {
    const amenityArray = amenities.split(',').map((a) => a.trim());
    filter.amenities = { $all: amenityArray };
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (minRating) {
    filter.avgRating = { $gte: Number(minRating) };
  }

  // Sort options
  let sortOption = { createdAt: -1 }; // default: newest first
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { avgRating: -1 };
  else if (sort === 'popular') sortOption = { reviewCount: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [listings, total] = await Promise.all([
    Listing.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
    Listing.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: listings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get featured listings (top rated)
// @route   GET /api/v1/listings/featured
exports.getFeaturedListings = catchAsync(async (req, res) => {
  const listings = await Listing.find()
    .sort({ avgRating: -1, reviewCount: -1 })
    .limit(8);

  res.status(200).json({ success: true, data: listings });
});

// @desc    Get single listing
// @route   GET /api/v1/listings/:id
exports.getListing = catchAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(
    'createdBy',
    'name'
  );

  if (!listing) {
    throw new ApiError('Listing not found', 404);
  }

  res.status(200).json({ success: true, data: listing });
});

// @desc    Create listing (admin or host)
// @route   POST /api/v1/listings
exports.createListing = catchAsync(async (req, res) => {
  req.body.createdBy = req.user._id;

  // Normalize tags and amenities to lowercase
  if (req.body.tags) {
    req.body.tags = req.body.tags.map((t) => t.toLowerCase().trim());
  }
  if (req.body.amenities) {
    req.body.amenities = req.body.amenities.map((a) => a.trim());
  }

  const listing = await Listing.create(req.body);
  res.status(201).json({ success: true, data: listing });
});

// @desc    Update listing (admin can update any, host can only update own)
// @route   PUT /api/v1/listings/:id
exports.updateListing = catchAsync(async (req, res) => {
  if (req.body.tags) {
    req.body.tags = req.body.tags.map((t) => t.toLowerCase().trim());
  }
  if (req.body.amenities) {
    req.body.amenities = req.body.amenities.map((a) => a.trim());
  }

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ApiError('Listing not found', 404);
  }

  // Hosts can only update their own listings
  if (req.user.role === 'host' && listing.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError('You can only update your own listings', 403);
  }

  const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete listing (admin only)
// @route   DELETE /api/v1/listings/:id
exports.deleteListing = catchAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ApiError('Listing not found', 404);
  }

  // Delete associated bookings and reviews
  await Promise.all([
    Booking.deleteMany({ listing: listing._id }),
    Review.deleteMany({ listing: listing._id }),
    listing.deleteOne(),
  ]);

  res.status(200).json({ success: true, message: 'Listing deleted' });
});
