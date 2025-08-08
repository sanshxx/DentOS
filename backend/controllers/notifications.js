const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return next(new ErrorResponse('Invalid pagination parameters', 400));
  }
  
  const total = await Notification.countDocuments({ user: req.user.id });

  const notifications = await Notification.find({ user: req.user.id })
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: notifications.length,
    pagination,
    data: notifications
  });
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({ 
    user: req.user.id, 
    isRead: false 
  });

  res.status(200).json({
    success: true,
    count
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Check if notification belongs to the user
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this notification', 403));
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Check if notification belongs to the user
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this notification', 403));
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Create notification (internal use)
// @route   POST /api/notifications
// @access  Private
exports.createNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.create({
    ...req.body,
    user: req.body.user || req.user.id,
    organization: req.user.organization
  });

  res.status(201).json({
    success: true,
    data: notification
  });
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Check if notification belongs to the user
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this notification', 403));
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});
