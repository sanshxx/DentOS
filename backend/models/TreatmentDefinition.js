const mongoose = require('mongoose');

const TreatmentDefinitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a treatment name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Please add a treatment code'],
    trim: true,
    maxlength: [20, 'Code cannot be more than 20 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Diagnostic',
      'Preventive',
      'Restorative',
      'Endodontic',
      'Periodontic',
      'Prosthodontic',
      'Oral Surgery',
      'Orthodontic',
      'Cosmetic',
      'Pediatric'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  duration: {
    type: Number,
    required: [true, 'Please add duration in minutes'],
    min: [1, 'Duration must be at least 1 minute']
  },
  requiredEquipment: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for unique code per organization
TreatmentDefinitionSchema.index({ code: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('TreatmentDefinition', TreatmentDefinitionSchema); 