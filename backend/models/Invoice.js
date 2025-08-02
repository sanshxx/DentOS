const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
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
  treatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment'
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: function() {
      return this.totalAmount;
    }
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially paid', 'paid', 'overdue', 'cancelled'],
    default: 'unpaid'
  },
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit card', 'debit card', 'upi', 'bank transfer', 'cheque', 'insurance', 'other'],
      required: true
    },
    transactionId: String,
    notes: String,
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  notes: String,
  termsAndConditions: String,
  isGstInvoice: {
    type: Boolean,
    default: false
  },
  gstDetails: {
    gstNumber: String,
    cgst: Number,
    sgst: Number,
    igst: Number,
    hsnCode: String
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

// Generate invoice number before saving
InvoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    // Format: INV-YYYYMM-XXXX (e.g., INV-202307-0001)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the latest invoice to determine the next sequence number
    const latestInvoice = await this.constructor.findOne(
      { invoiceNumber: { $regex: `INV-${year}${month}-` } },
      { invoiceNumber: 1 },
      { sort: { invoiceNumber: -1 } }
    );
    
    let sequenceNumber = 1;
    if (latestInvoice && latestInvoice.invoiceNumber) {
      const lastSequence = parseInt(latestInvoice.invoiceNumber.split('-')[2]);
      sequenceNumber = lastSequence + 1;
    }
    
    this.invoiceNumber = `INV-${year}${month}-${String(sequenceNumber).padStart(4, '0')}`;
  }
  
  // Calculate balance amount
  this.balanceAmount = this.totalAmount - this.amountPaid;
  
  // Update payment status based on amount paid and due date
  if (this.amountPaid === 0) {
    this.paymentStatus = this.dueDate < new Date() ? 'overdue' : 'unpaid';
  } else if (this.amountPaid < this.totalAmount) {
    this.paymentStatus = this.dueDate < new Date() ? 'overdue' : 'partially paid';
  } else {
    this.paymentStatus = 'paid';
  }
  
  next();
});

// Update the updatedAt field on update
InvoiceSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

// Create indexes for faster queries
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ patient: 1 });
InvoiceSchema.index({ clinic: 1 });
InvoiceSchema.index({ invoiceDate: 1 });
InvoiceSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);