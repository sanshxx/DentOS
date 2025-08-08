const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add organization name'],
    trim: true,
    maxlength: [100, 'Organization name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please add organization slug'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Slug cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['dental_clinic', 'dental_hospital', 'dental_chain', 'individual_practitioner'],
    default: 'dental_clinic'
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Please add organization email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please add organization phone'],
      match: [
        /^[0-9]{10}$/,
        'Please add a valid 10-digit phone number'
      ]
    },
    website: {
      type: String,
      match: [
        /^https?:\/\/.+/,
        'Please add a valid website URL'
      ]
    }
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
    }
  },
  businessInfo: {
    gstNumber: {
      type: String,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        'Please add a valid GST number'
      ]
    },
    panNumber: {
      type: String,
      match: [
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        'Please add a valid PAN number'
      ]
    },
    registrationNumber: String
  },
  settings: {
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    maxUsers: {
      type: Number,
      default: 10
    },
    maxClinics: {
      type: Number,
      default: 5
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    features: [{
      type: String,
      enum: [
        'basic_management',
        'advanced_analytics',
        'multi_clinic',
        'api_access',
        'priority_support'
      ]
    }]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made optional to avoid circular dependency during creation
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
OrganizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster queries
OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ 'contactInfo.email': 1 });
OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ 'subscription.status': 1 });

module.exports = mongoose.model('Organization', OrganizationSchema); 