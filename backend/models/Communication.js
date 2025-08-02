const mongoose = require('mongoose');

const CommunicationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    enum: ['SMS', 'WhatsApp', 'Email', 'Automated', 'Manual'],
    required: true
  },
  channel: {
    type: String,
    enum: ['SMS', 'WhatsApp', 'Email'],
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    trim: true
  },
  subject: {
    type: String,
    trim: true
    // Required only for email
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // May be null for automated messages
  },
  status: {
    type: String,
    enum: ['Pending', 'Sent', 'Delivered', 'Read', 'Failed'],
    default: 'Pending'
  },
  statusUpdatedAt: {
    type: Date
  },
  errorMessage: String,
  // For tracking message delivery and read receipts
  deliveryDetails: {
    deliveredAt: Date,
    readAt: Date,
    failedAt: Date,
    retryCount: {
      type: Number,
      default: 0
    },
    externalId: String // ID from external service (Twilio, etc.)
  },
  // For automated messages
  triggerEvent: {
    type: String,
    enum: [
      'appointment_reminder', 
      'appointment_confirmation', 
      'appointment_cancelled',
      'treatment_followup',
      'recall_checkup',
      'birthday_wish',
      'payment_reminder',
      'invoice_sent',
      'custom'
    ]
  },
  // Reference to related entity
  reference: {
    type: {
      type: String,
      enum: ['appointment', 'treatment', 'invoice', 'other']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reference.type'
    }
  },
  // For template-based messages
  template: {
    type: String
  },
  templateData: {
    type: mongoose.Schema.Types.Mixed
  }
});

// Create indexes for faster queries
CommunicationSchema.index({ patient: 1, sentAt: -1 });
CommunicationSchema.index({ status: 1 });
CommunicationSchema.index({ triggerEvent: 1 });

module.exports = mongoose.model('Communication', CommunicationSchema);