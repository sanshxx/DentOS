const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  filename: {
    type: String,
    required: [true, 'Please provide a filename']
  },
  originalFilename: {
    type: String,
    required: [true, 'Please provide the original filename']
  },
  fileType: {
    type: String,
    required: [true, 'Please provide the file type']
  },
  fileSize: {
    type: Number,
    required: [true, 'Please provide the file size']
  },
  filePath: {
    type: String,
    required: [true, 'Please provide the file path']
  },
  category: {
    type: String,
    enum: ['medical_history', 'treatment_plan', 'prescription', 'lab_report', 'consent_form', 'insurance', 'invoice', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
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

// Update the updatedAt field on update
DocumentSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('Document', DocumentSchema);