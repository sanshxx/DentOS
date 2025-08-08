const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  itemName: {
    type: String,
    required: [true, 'Please add item name'],
    trim: true
  },
  itemCode: {
    type: String,
    required: [true, 'Please add item code'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add category'],
    enum: [
      'Consumables',
      'Instruments',
      'Equipment',
      'Medicines',
      'Implants',
      'Orthodontic Supplies',
      'Office Supplies',
      'Others'
    ]
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  unit: {
    type: String,
    required: [true, 'Please add unit of measurement'],
    enum: [
      'Piece',
      'Box',
      'Pack',
      'Set',
      'Kit',
      'Bottle',
      'Tube',
      'Syringe',
      'Gram',
      'Kilogram',
      'Milliliter',
      'Liter',
      'Other'
    ]
  },
  clinics: [{
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true
    },
    currentStock: {
      type: Number,
      default: 0
    },
    minStockLevel: {
      type: Number,
      default: 5
    },
    location: {
      type: String,
      default: 'Main Storage'
    }
  }],
  manufacturer: {
    type: String
  },
  supplier: {
    name: String,
    contactPerson: String,
    phone: String,
    email: String,
    address: String
  },
  costPrice: {
    type: Number,
    required: [true, 'Please add cost price']
  },
  sellingPrice: {
    type: Number
  },
  expiryDate: {
    type: Date
  },
  batchNumber: {
    type: String
  },
  purchaseDate: {
    type: Date
  },
  lastStockUpdate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'discontinued', 'out of stock', 'low stock'],
    default: 'active'
  },
  image: {
    type: String // URL to stored image
  },
  notes: {
    type: String
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

// Create a virtual for total stock across all clinics
InventorySchema.virtual('totalStock').get(function() {
  return this.clinics.reduce((total, clinic) => total + clinic.currentStock, 0);
});

// Create a virtual for low stock status
InventorySchema.virtual('lowStock').get(function() {
  return this.clinics.some(clinic => clinic.currentStock <= clinic.minStockLevel);
});

// Update the updatedAt field on update
InventorySchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date(), lastStockUpdate: new Date() });
});

// Create indexes for faster queries
InventorySchema.index({ category: 1 });
InventorySchema.index({ 'clinics.clinic': 1 });
InventorySchema.index({ status: 1 });
// Create compound index for unique itemCode per organization
InventorySchema.index({ itemCode: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', InventorySchema);