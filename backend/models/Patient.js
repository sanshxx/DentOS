const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add patient name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [
      /^[0-9]{10}$/,
      'Please add a valid 10-digit phone number'
    ]
  },
  alternatePhone: {
    type: String,
    match: [
      /^[0-9]{10}$/,
      'Please add a valid 10-digit phone number'
    ]
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Please specify gender']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth']
  },
  age: {
    type: Number
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  occupation: String,
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
  },
  medicalHistory: {
    allergies: [String],
    currentMedications: [String],
    pastIllnesses: [String],
    surgeries: [String],
    diabetic: {
      type: Boolean,
      default: false
    },
    hypertension: {
      type: Boolean,
      default: false
    },
    pregnant: {
      type: Boolean,
      default: false
    },
    other: String
  },
  dentalHistory: {
    lastDentalVisit: Date,
    previousTreatments: [String],
    chiefComplaint: String,
    notes: String
  },
  registeredClinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  referredBy: String,
  patientId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
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

// Generate patient ID before saving
PatientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    // Format: P-YYYYMM-XXXX (e.g., P-202307-0001)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the latest patient to determine the next sequence number
    const latestPatient = await this.constructor.findOne(
      { patientId: { $regex: `P-${year}${month}-` } },
      { patientId: 1 },
      { sort: { patientId: -1 } }
    );
    
    let sequenceNumber = 1;
    if (latestPatient && latestPatient.patientId) {
      const lastSequence = parseInt(latestPatient.patientId.split('-')[2]);
      sequenceNumber = lastSequence + 1;
    }
    
    this.patientId = `P-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`;
  }
  
  // Calculate age based on date of birth
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.age = age;
  }
  
  next();
});

// Update the updatedAt field on update
PatientSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('Patient', PatientSchema);