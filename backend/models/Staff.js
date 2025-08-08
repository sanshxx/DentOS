const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const StaffSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },
  role: {
    type: String,
    required: [true, 'Please add a role'],
    enum: ['dentist', 'hygienist', 'receptionist', 'nurse', 'technician', 'admin', 'manager'],
    default: 'dentist'
  },
  specialization: {
    type: String,
    required: function() {
      return this.role === 'dentist';
    },
    trim: true,
    maxlength: [100, 'Specialization cannot be more than 100 characters']
  },
  qualification: {
    type: String,
    trim: true,
    maxlength: [100, 'Qualification cannot be more than 100 characters']
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot be more than 50 years']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot be more than 500 characters']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'terminated'],
    default: 'active'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profileImage: {
    type: String
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot be more than 1000 characters']
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Emergency contact name cannot be more than 100 characters']
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [50, 'Relationship cannot be more than 50 characters']
    }
  },
  workingHours: {
    monday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    thursday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    friday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    saturday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    sunday: { start: String, end: String, isWorking: { type: Boolean, default: false } }
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  permissions: [{
    type: String,
    enum: ['view_patients', 'edit_patients', 'view_appointments', 'edit_appointments', 'view_billing', 'edit_billing', 'view_reports', 'manage_staff', 'manage_inventory']
  }],
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

// Encrypt password using bcrypt
StaffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
StaffSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
StaffSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update the updatedAt field on save
StaffSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for faster queries
StaffSchema.index({ email: 1 });
StaffSchema.index({ role: 1 });
StaffSchema.index({ status: 1 });
StaffSchema.index({ joinDate: 1 });

module.exports = mongoose.model('Staff', StaffSchema); 