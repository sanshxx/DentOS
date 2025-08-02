const mongoose = require('mongoose');

const TreatmentSchema = new mongoose.Schema({
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
  treatmentPlanId: {
    type: String,
    unique: true
  },
  diagnosis: {
    type: String,
    required: [true, 'Please add diagnosis']
  },
  chiefComplaint: {
    type: String,
    required: [true, 'Please add chief complaint']
  },
  treatmentItems: [{
    procedure: {
      type: String,
      required: [true, 'Please specify procedure']
    },
    tooth: {
      type: String
    },
    quadrant: {
      type: String,
      enum: ['upper right', 'upper left', 'lower right', 'lower left', 'full mouth', 'not applicable']
    },
    status: {
      type: String,
      enum: ['planned', 'in progress', 'completed', 'cancelled'],
      default: 'planned'
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    plannedDate: Date,
    completedDate: Date,
    notes: String,
    cost: {
      type: Number,
      required: [true, 'Please add cost for the procedure']
    },
    discount: {
      type: Number,
      default: 0
    },
    appointments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }]
  }],
  xrays: [{
    type: String, // URL to stored X-ray image
    date: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  attachments: [{
    type: String, // URL to stored attachment
    name: String,
    date: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  estimatedEndDate: Date,
  actualEndDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'on hold', 'cancelled'],
    default: 'active'
  },
  totalCost: {
    type: Number,
    required: [true, 'Please add total cost']
  },
  discount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: [true, 'Please add final amount']
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially paid', 'fully paid'],
    default: 'unpaid'
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: function() {
      return this.finalAmount;
    }
  },
  notes: String,
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

// Generate treatment plan ID before saving
TreatmentSchema.pre('save', async function(next) {
  if (!this.treatmentPlanId) {
    // Format: TP-YYYYMM-XXXX (e.g., TP-202307-0001)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the latest treatment plan to determine the next sequence number
    const latestTreatment = await this.constructor.findOne(
      { treatmentPlanId: { $regex: `TP-${year}${month}-` } },
      { treatmentPlanId: 1 },
      { sort: { treatmentPlanId: -1 } }
    );
    
    let sequenceNumber = 1;
    if (latestTreatment && latestTreatment.treatmentPlanId) {
      const lastSequence = parseInt(latestTreatment.treatmentPlanId.split('-')[2]);
      sequenceNumber = lastSequence + 1;
    }
    
    this.treatmentPlanId = `TP-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`;
  }
  
  // Calculate final amount and balance
  this.finalAmount = this.totalCost - this.discount;
  this.balance = this.finalAmount - this.amountPaid;
  
  // Update payment status based on amount paid
  if (this.amountPaid === 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.amountPaid < this.finalAmount) {
    this.paymentStatus = 'partially paid';
  } else {
    this.paymentStatus = 'fully paid';
  }
  
  next();
});

// Update the updatedAt field on update
TreatmentSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

// Create indexes for faster queries
TreatmentSchema.index({ patient: 1 });
TreatmentSchema.index({ clinic: 1 });
TreatmentSchema.index({ status: 1 });
TreatmentSchema.index({ treatmentPlanId: 1 });

module.exports = mongoose.model('Treatment', TreatmentSchema);