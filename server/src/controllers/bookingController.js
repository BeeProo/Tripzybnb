const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Create booking
// @route   POST /api/v1/bookings
exports.createBooking = catchAsync(async (req, res) => {
  const { listing: listingId, checkIn, checkOut, guests, paymentDetails } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError('Listing not found', 404);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    throw new ApiError('Check-out must be after check-in', 400);
  }

  if (checkInDate < new Date()) {
    throw new ApiError('Check-in date cannot be in the past', 400);
  }

  // Check availability - no overlapping confirmed bookings
  const overlapping = await Booking.findOne({
    listing: listingId,
    status: 'confirmed',
    $or: [
      { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
    ],
  });

  if (overlapping) {
    throw new ApiError('Listing is not available for the selected dates', 400);
  }

  // Calculate total price
  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = nights * listing.price;

  const booking = await Booking.create({
    listing: listingId,
    user: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: guests || 1,
    totalPrice,
    paymentDetails,
    status: paymentDetails?.transactionId ? 'confirmed' : 'pending',
  });

  await booking.populate('listing', 'title images location price createdBy');

  // Notify the host about the new booking
  const { createNotification } = require('./notificationController');
  const io = req.app.get('io');
  if (listing.createdBy) {
    createNotification({
      recipient: listing.createdBy,
      type: 'booking_new',
      title: 'New Booking!',
      body: `${req.user.name} booked ${listing.title} for ₹${totalPrice.toLocaleString()}`,
      link: `/host/listing/${listingId}`,
      metadata: { bookingId: booking._id, listingId },
      io,
    }).catch(() => {});
  }

  res.status(201).json({ success: true, data: booking });
});

// @desc    Get current user's bookings
// @route   GET /api/v1/bookings/my
exports.getMyBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('listing', 'title images location price')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: bookings });
});

// @desc    Get all bookings (admin)
// @route   GET /api/v1/bookings
exports.getAllBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find()
    .populate('listing', 'title location price')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: bookings });
});

// @desc    Check listing availability
// @route   GET /api/v1/listings/:id/availability
exports.checkAvailability = catchAsync(async (req, res) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    throw new ApiError('Please provide check-in and check-out dates', 400);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const overlapping = await Booking.findOne({
    listing: req.params.id,
    status: 'confirmed',
    $or: [
      { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
    ],
  });

  res.status(200).json({
    success: true,
    available: !overlapping,
  });
});

// @desc    Cancel booking
// @route   PATCH /api/v1/bookings/:id/cancel
exports.cancelBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('listing', 'createdBy');

  if (!booking) {
    throw new ApiError('Booking not found', 404);
  }

  // Allow: booking owner, admin, or host who owns the listing
  const isBookingOwner = booking.user.toString() === req.user._id.toString();
  const isAdminUser = req.user.role === 'admin';
  const isListingHost = req.user.role === 'host' && booking.listing?.createdBy?.toString() === req.user._id.toString();

  if (!isBookingOwner && !isAdminUser && !isListingHost) {
    throw new ApiError('Not authorized to cancel this booking', 403);
  }

  if (booking.status === 'cancelled') {
    throw new ApiError('Booking is already cancelled', 400);
  }

  booking.status = 'cancelled';
  await booking.save();

  // Notify relevant parties about cancellation
  const { createNotification } = require('./notificationController');
  const io = req.app.get('io');
  await booking.populate('listing', 'title createdBy');

  // If cancelled by host/admin → notify the user
  if (!isBookingOwner) {
    createNotification({
      recipient: booking.user,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      body: `Your booking for ${booking.listing?.title || 'a property'} has been cancelled`,
      link: '/dashboard',
      io,
    }).catch(() => {});
  }

  // If cancelled by user → notify the host
  if (isBookingOwner && booking.listing?.createdBy) {
    createNotification({
      recipient: booking.listing.createdBy,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      body: `${req.user.name} cancelled their booking for ${booking.listing?.title || 'your property'}`,
      link: `/host/listing/${booking.listing._id}`,
      io,
    }).catch(() => {});
  }

  res.status(200).json({ success: true, data: booking });
});

// @desc    Confirm a pending booking (host approves)
// @route   PATCH /api/v1/bookings/:id/confirm
exports.confirmBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('listing', 'createdBy');

  if (!booking) {
    throw new ApiError('Booking not found', 404);
  }

  // Only host who owns the listing or admin can confirm
  const isAdminUser = req.user.role === 'admin';
  const isListingHost = req.user.role === 'host' && booking.listing?.createdBy?.toString() === req.user._id.toString();

  if (!isAdminUser && !isListingHost) {
    throw new ApiError('Not authorized to confirm this booking', 403);
  }

  if (booking.status !== 'pending') {
    throw new ApiError(`Booking cannot be confirmed (current status: ${booking.status})`, 400);
  }

  booking.status = 'confirmed';
  await booking.save();

  res.status(200).json({ success: true, data: booking });
});

// @desc    Get bookings for a specific listing (host sees their property's bookings)
// @route   GET /api/v1/bookings/listing/:listingId
exports.getListingBookings = catchAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.listingId);

  if (!listing) {
    throw new ApiError('Listing not found', 404);
  }

  // Host can only see bookings for their own listings; admin can see any
  if (
    req.user.role === 'host' &&
    listing.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError('Not authorized to view bookings for this listing', 403);
  }

  const bookings = await Booking.find({ listing: req.params.listingId })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: bookings });
});

// @desc    Get all bookings across all host's listings
// @route   GET /api/v1/bookings/host/all
exports.getHostAllBookings = catchAsync(async (req, res) => {
  // Find all listings owned by this host
  const hostListings = await Listing.find({ createdBy: req.user._id }).select('_id');
  const listingIds = hostListings.map((l) => l._id);

  const bookings = await Booking.find({ listing: { $in: listingIds } })
    .populate('user', 'name email phone')
    .populate('listing', 'title images location price')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: bookings });
});

