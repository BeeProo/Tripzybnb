const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');

// @desc    Get my notifications
// @route   GET /api/v1/notifications
exports.getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.status(200).json({ success: true, data: notifications, unreadCount });
});

// @desc    Mark a notification as read
// @route   PATCH /api/v1/notifications/:id/read
exports.markAsRead = catchAsync(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true }
  );
  res.status(200).json({ success: true });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
exports.markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );
  res.status(200).json({ success: true });
});

// @desc    Get unread count
// @route   GET /api/v1/notifications/unread-count
exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });
  res.status(200).json({ success: true, count });
});

// Helper: Create notification and emit via Socket.io
exports.createNotification = async ({ recipient, type, title, body, link, metadata, io }) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    body,
    link: link || '',
    metadata: metadata || {},
  });

  // Emit real-time notification if io is available
  if (io) {
    io.to(`user:${recipient}`).emit('notification:new', notification);
  }

  return notification;
};
