const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add clinic name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  branchCode: {
    type: String,
    required: [true, 'Please add a branch code'],
    trim: true,
    maxlength: [10, 'Branch code cannot be more than 10 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add street address']
    },
    city: {
      type: String,
      required: [true, 'Please add city']
    },
    state: {
      type: String,
      required: [true, 'Please add state']
    },
    pincode: {
      type: String,
      required: [true, 'Please add pincode'],
      match: [
        /^[0-9]{6}$/,
        'Please add a valid 6-digit pincode'
      ]
    },
    country: {
      type: String,
      default: 'India'
    },
    landmark: String
  },
  contactNumbers: [{
    type: String,
    required: [true, 'Please add at least one contact number']
  }],
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  gstNumber: {
    type: String,
    match: [
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Please add a valid GST number'
    ]
  },
  operatingHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' }
    },
    saturday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '16:00' }
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: '10:00' },
      closeTime: { type: String, default: '14:00' }
    }
  },
  facilities: [{
    type: String,
    enum: [
      'X-Ray',
      'OPG',
      'CBCT',
      'Implant Center',
      'Root Canal Specialist',
      'Orthodontics',
      'Pediatric Dentistry',
      'Laser Dentistry',
      'Cosmetic Dentistry'
    ]
  }],
  numberOfChairs: {
    type: Number,
    required: [true, 'Please specify number of dental chairs'],
    min: [1, 'Must have at least 1 chair']
  },
  isHeadOffice: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'under maintenance'],
    default: 'active'
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
ClinicSchema.index({ 'address.city': 1, 'address.state': 1 });
// Create compound index for unique branchCode per organization
ClinicSchema.index({ branchCode: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('Clinic', ClinicSchema);