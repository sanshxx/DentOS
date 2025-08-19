const mongoose = require('mongoose');
require('mongoose-paginate-v2');

const DrugSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brandNames: [{
    type: String,
    trim: true
  }],
  strength: {
    type: String,
    required: true,
    trim: true
  },
  form: {
    type: String,
    enum: [
      'tablet', 'capsule', 'liquid', 'injection', 'cream', 'gel', 'drops', 'inhaler', 'suppository',
      'powder', 'suspension', 'syrup', 'spray', 'ointment', 'paste', 'patch', 'lozenge', 'chewable',
      'effervescent', 'sublingual', 'buccal', 'topical', 'ophthalmic', 'otic', 'nasal', 'rectal'
    ],
    required: true
  },
  category: {
    type: String,
    enum: [
      'antibiotic', 'analgesic', 'anti-inflammatory', 'antiseptic', 'anesthetic', 'vitamin', 'supplement',
      'antifungal', 'antiviral', 'antihistamine', 'decongestant', 'expectorant', 'cough_suppressant',
      'antiulcer', 'antiemetic', 'laxative', 'antidiarrheal', 'diuretic', 'antihypertensive',
      'antidiabetic', 'anticoagulant', 'antiplatelet', 'bronchodilator', 'corticosteroid',
      'immunosuppressant', 'hormone', 'mineral', 'probiotic', 'herbal', 'homeopathic', 'other'
    ],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  activeIngredients: [{
    name: String,
    strength: String
  }],
  contraindications: [String],
  sideEffects: [String],
  dosageInstructions: {
    type: String,
    trim: true
  },
  storageInstructions: {
    type: String,
    trim: true
  },
  isControlled: {
    type: Boolean,
    default: false
  },
  requiresPrescription: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
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
DrugSchema.index({ organization: 1, name: 1 });
DrugSchema.index({ organization: 1, genericName: 1 });
DrugSchema.index({ organization: 1, category: 1 });
DrugSchema.index({ organization: 1, isActive: 1 });

// Apply pagination plugin
DrugSchema.plugin(require('mongoose-paginate-v2'));

module.exports = mongoose.model('Drug', DrugSchema);
