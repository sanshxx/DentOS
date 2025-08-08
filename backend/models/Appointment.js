const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  dentist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please add appointment date and time']
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // Duration in minutes
    default: 30,
    min: [15, 'Appointment must be at least 15 minutes']
  },
  appointmentType: {
    type: String,
    enum: [
      'New Consultation',
      'Follow-up',
      'Emergency',
      'Cleaning',
      'Filling',
      'Root Canal',
      'Extraction',
      'Crown/Bridge Work',
      'Implant',
      'Orthodontic Adjustment',
      'Denture Fitting',
      'Surgical Procedure',
      'Other'
    ],
    required: [true, 'Please specify appointment type']
  },
  status: {
    type: String,
    enum: [
      'scheduled',
      'confirmed',
      'completed',
      'cancelled',
      'no-show',
      'rescheduled'
    ],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  reasonForVisit: {
    type: String,
    required: [true, 'Please add reason for visit'],
    maxlength: [200, 'Reason cannot be more than 200 characters']
  },
  treatmentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  cancelReason: {
    type: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Calculate end time based on duration before saving
AppointmentSchema.pre('save', function(next) {
  if (this.appointmentDate && this.duration) {
    const endTime = new Date(this.appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + this.duration);
    this.endTime = endTime;
  }
  next();
});

// Update the updatedAt field on update
AppointmentSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

// Create indexes for faster queries
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ patient: 1 });
AppointmentSchema.index({ dentist: 1, appointmentDate: 1 });
AppointmentSchema.index({ clinic: 1, appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);