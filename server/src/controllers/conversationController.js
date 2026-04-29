const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get user's conversations
// @route   GET /api/v1/conversations
exports.getConversations = catchAsync(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name avatar email')
    .populate('listing', 'title images')
    .sort({ updatedAt: -1 });

  res.status(200).json({ success: true, data: conversations });
});

// @desc    Start or get existing conversation
// @route   POST /api/v1/conversations
exports.startConversation = catchAsync(async (req, res) => {
  const { recipientId, listingId } = req.body;

  if (!recipientId) {
    throw new ApiError('Recipient is required', 400);
  }

  if (recipientId === req.user._id.toString()) {
    throw new ApiError('Cannot start conversation with yourself', 400);
  }

  // Check if conversation already exists between these users for this listing
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, recipientId] },
    ...(listingId && { listing: listingId }),
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      ...(listingId && { listing: listingId }),
    });
  }

  await conversation.populate('participants', 'name avatar email');

  res.status(201).json({ success: true, data: conversation });
});

// @desc    Get messages for a conversation
// @route   GET /api/v1/conversations/:id/messages
exports.getMessages = catchAsync(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    throw new ApiError('Conversation not found', 404);
  }

  // Verify user is participant
  if (!conversation.participants.includes(req.user._id)) {
    throw new ApiError('Not authorized to view these messages', 403);
  }

  const messages = await Message.find({ conversation: req.params.id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 });

  res.status(200).json({ success: true, data: messages });
});

// @desc    Send a message
// @route   POST /api/v1/conversations/:id/messages
exports.sendMessage = catchAsync(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    throw new ApiError('Conversation not found', 404);
  }

  // Verify user is participant
  if (!conversation.participants.includes(req.user._id)) {
    throw new ApiError('Not authorized to send messages here', 403);
  }

  const message = await Message.create({
    conversation: req.params.id,
    sender: req.user._id,
    text: req.body.text,
  });

  // Update last message on conversation
  conversation.lastMessage = {
    text: req.body.text,
    sender: req.user._id,
    createdAt: new Date(),
  };
  await conversation.save();

  await message.populate('sender', 'name avatar');

  // Send notification to the other participant
  const { createNotification } = require('./notificationController');
  const recipientId = conversation.participants.find(
    (p) => p.toString() !== req.user._id.toString()
  );
  if (recipientId) {
    const io = req.app.get('io');
    const preview = req.body.text.length > 50 ? req.body.text.substring(0, 50) + '…' : req.body.text;
    createNotification({
      recipient: recipientId,
      type: 'message',
      title: `New message from ${req.user.name}`,
      body: preview,
      link: `/messages?convo=${req.params.id}`,
      metadata: { conversationId: req.params.id, senderId: req.user._id },
      io,
    }).catch(() => {}); // Fire and forget
  }

  res.status(201).json({ success: true, data: message });
});
