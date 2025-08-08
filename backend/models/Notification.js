const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add notification title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add notification message'],
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['appointment', 'patient', 'inventory', 'billing', 'treatment', 'system', 'reminder'],
    required: [true, 'Please specify notification type']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  relatedEntity: {
    type: {
      type: String,
      enum: ['appointment', 'patient', 'inventory', 'invoice', 'treatment']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  actionUrl: {
    type: String
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient querying
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ organization: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

module.exports = mongoose.model('Notification', NotificationSchema);
