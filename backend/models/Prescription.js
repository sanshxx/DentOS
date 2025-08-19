const mongoose = require('mongoose');
require('mongoose-paginate-v2');

const PrescriptionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  prescriptionNumber: {
    type: String,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  diagnosis: {
    type: String,
    trim: true
  },
  medications: [{
    drug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drug',
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['tablets', 'capsules', 'ml', 'mg', 'units', 'puffs'],
      required: true
    },
    beforeMeal: {
      type: Boolean,
      default: false
    },
    afterMeal: {
      type: Boolean,
      default: false
    },
    isIssuedToPatient: {
      type: Boolean,
      default: false
    },
    issuedToPatientDate: Date,
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  instructions: {
    type: String,
    trim: true
  },
  followUpDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  isIssuedToPatient: {
    type: Boolean,
    default: false
  },
  issuedToPatientDate: Date,
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
PrescriptionSchema.index({ organization: 1, patient: 1 });
PrescriptionSchema.index({ organization: 1, doctor: 1 });
PrescriptionSchema.index({ organization: 1, date: -1 });
PrescriptionSchema.index({ organization: 1, status: 1 });
PrescriptionSchema.index({ organization: 1, prescriptionNumber: 1 });

// Generate prescription number before saving
PrescriptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.prescriptionNumber) {
    const count = await this.constructor.countDocuments({ organization: this.organization });
    this.prescriptionNumber = `RX${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Apply pagination plugin
PrescriptionSchema.plugin(require('mongoose-paginate-v2'));

module.exports = mongoose.model('Prescription', PrescriptionSchema);
