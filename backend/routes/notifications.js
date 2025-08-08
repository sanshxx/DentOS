const express = require('express');
const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotification
} = require('../controllers/notifications');

const { protect } = require('../middleware/auth');

router.use(protect);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Get single notification
router.get('/:id', getNotification);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Create notification (internal use)
router.post('/', createNotification);

module.exports = router;
