const mongoose = require('mongoose');

const JoinRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  adminResponse: {
    type: String,
    maxlength: [500, 'Admin response cannot be more than 500 characters']
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
JoinRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster queries
JoinRequestSchema.index({ user: 1, organization: 1 });
JoinRequestSchema.index({ organization: 1, status: 1 });
JoinRequestSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('JoinRequest', JoinRequestSchema); 