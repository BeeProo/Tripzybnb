const HostRequest = require('../models/HostRequest');
const User = require('../models/User');
const Listing = require('../models/Listing');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Submit a host request (user)
// @route   POST /api/v1/host-requests
exports.createHostRequest = catchAsync(async (req, res) => {
  // Check if user already has a pending request
  const existing = await HostRequest.findOne({
    user: req.user._id,
    status: 'pending',
  });

  if (existing) {
    throw new ApiError('You already have a pending host request', 400);
  }

  const request = await HostRequest.create({
    user: req.user._id,
    ...req.body,
  });

  res.status(201).json({ success: true, data: request });
});

// @desc    Get my host requests (user)
// @route   GET /api/v1/host-requests/my
exports.getMyHostRequests = catchAsync(async (req, res) => {
  const requests = await HostRequest.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: requests });
});

// @desc    Get all host requests (admin)
// @route   GET /api/v1/host-requests
exports.getAllHostRequests = catchAsync(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const requests = await HostRequest.find(filter)
    .populate('user', 'name email avatar createdAt')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: requests });
});

// @desc    Get single host request (admin)
// @route   GET /api/v1/host-requests/:id
exports.getHostRequest = catchAsync(async (req, res) => {
  const request = await HostRequest.findById(req.params.id)
    .populate('user', 'name email avatar createdAt')
    .populate('reviewedBy', 'name');

  if (!request) {
    throw new ApiError('Host request not found', 404);
  }

  res.status(200).json({ success: true, data: request });
});

// @desc    Approve host request (admin) — promotes user to host + creates listing
// @route   PATCH /api/v1/host-requests/:id/approve
exports.approveHostRequest = catchAsync(async (req, res) => {
  const request = await HostRequest.findById(req.params.id);

  if (!request) {
    throw new ApiError('Host request not found', 404);
  }

  if (request.status !== 'pending') {
    throw new ApiError(`Request already ${request.status}`, 400);
  }

  // Promote user to host role
  await User.findByIdAndUpdate(request.user, { role: 'host' });

  // Create a listing from the request data
  const listing = await Listing.create({
    title: request.propertyTitle,
    description: request.propertyDescription,
    location: {
      city: request.location.city,
      state: request.location.state,
      country: request.location.country,
    },
    price: request.price,
    maxGuests: request.maxGuests,
    amenities: request.amenities,
    images: request.images,
    tags: [request.propertyType.toLowerCase()],
    createdBy: request.user,
  });

  // Update request status
  request.status = 'approved';
  request.adminNote = req.body.adminNote || 'Approved';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  res.status(200).json({
    success: true,
    message: 'Host request approved. User promoted to host.',
    data: { request, listing },
  });
});

// @desc    Reject host request (admin)
// @route   PATCH /api/v1/host-requests/:id/reject
exports.rejectHostRequest = catchAsync(async (req, res) => {
  const request = await HostRequest.findById(req.params.id);

  if (!request) {
    throw new ApiError('Host request not found', 404);
  }

  if (request.status !== 'pending') {
    throw new ApiError(`Request already ${request.status}`, 400);
  }

  request.status = 'rejected';
  request.adminNote = req.body.adminNote || 'Rejected';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  res.status(200).json({
    success: true,
    message: 'Host request rejected.',
    data: request,
  });
});

// @desc    Get host's own listings (host)
// @route   GET /api/v1/host-requests/my-listings
exports.getMyListings = catchAsync(async (req, res) => {
  const listings = await Listing.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: listings });
});
