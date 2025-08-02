const mongoose = require('mongoose');

const PatientDocumentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  fileName: {
    type: String,
    required: [true, 'Please provide a file name'],
    trim: true
  },
  fileType: {
    type: String,
    required: [true, 'Please provide a file type']
  },
  fileSize: {
    type: Number,
    required: [true, 'Please provide a file size']
  },
  category: {
    type: String,
    enum: ['X-Ray', 'Lab Report', 'Prescription', 'Medical History', 'Consent Form', 'Insurance', 'Treatment Plan', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'Please provide a file path']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  // For audit trail
  accessLog: [{
    accessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessedAt: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['view', 'download', 'share', 'delete', 'update'],
      required: true
    }
  }]
});

// Create index for faster queries
PatientDocumentSchema.index({ patient: 1, category: 1 });
PatientDocumentSchema.index({ fileName: 'text', description: 'text' });

module.exports = mongoose.model('PatientDocument', PatientDocumentSchema);