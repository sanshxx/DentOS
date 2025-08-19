const Drug = require('../models/Drug');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all drugs for organization
// @route   GET /api/drugs
// @access  Private
exports.getDrugs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search, category, isActive } = req.query;
  
  let query = { organization: req.user.organization };
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
      { brandNames: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by category
  if (category) {
    query.category = category;
  }
  
  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { name: 1 },
    populate: [
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'updatedBy', select: 'firstName lastName' }
    ]
  };
  
  const drugs = await Drug.paginate(query, options);
  
  res.status(200).json({
    success: true,
    data: drugs
  });
});

// @desc    Get single drug
// @route   GET /api/drugs/:id
// @access  Private
exports.getDrug = asyncHandler(async (req, res, next) => {
  const drug = await Drug.findById(req.params.id)
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName');
  
  if (!drug) {
    return next(new ErrorResponse(`Drug not found with id of ${req.params.id}`, 404));
  }
  
  // Check if drug belongs to user's organization
  if (drug.organization.toString() !== req.user.organization.toString()) {
    return next(new ErrorResponse('Not authorized to access this drug', 401));
  }
  
  res.status(200).json({
    success: true,
    data: drug
  });
});

// @desc    Create new drug
// @route   POST /api/drugs
// @access  Private
exports.createDrug = asyncHandler(async (req, res, next) => {
  req.body.organization = req.user.organization;
  req.body.createdBy = req.user.id;
  
  const drug = await Drug.create(req.body);
  
  res.status(201).json({
    success: true,
    data: drug
  });
});

// @desc    Update drug
// @route   PUT /api/drugs/:id
// @access  Private
exports.updateDrug = asyncHandler(async (req, res, next) => {
  let drug = await Drug.findById(req.params.id);
  
  if (!drug) {
    return next(new ErrorResponse(`Drug not found with id of ${req.params.id}`, 404));
  }
  
  // Check if drug belongs to user's organization
  if (drug.organization.toString() !== req.user.organization.toString()) {
    return next(new ErrorResponse('Not authorized to update this drug', 401));
  }
  
  req.body.updatedBy = req.user.id;
  
  drug = await Drug.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: drug
  });
});

// @desc    Delete drug
// @route   DELETE /api/drugs/:id
// @access  Private
exports.deleteDrug = asyncHandler(async (req, res, next) => {
  const drug = await Drug.findById(req.params.id);
  
  if (!drug) {
    return next(new ErrorResponse(`Drug not found with id of ${req.params.id}`, 404));
  }
  
  // Check if drug belongs to user's organization
  if (drug.organization.toString() !== req.user.organization.toString()) {
    return next(new ErrorResponse('Not authorized to delete this drug', 401));
  }
  
  // Check if drug is being used in prescriptions
  const Prescription = require('../models/Prescription');
  const prescriptionCount = await Prescription.countDocuments({
    'medications.drug': req.params.id,
    status: { $in: ['active', 'completed'] }
  });
  
  if (prescriptionCount > 0) {
    return next(new ErrorResponse('Cannot delete drug as it is being used in prescriptions', 400));
  }
  
  await drug.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get drug categories
// @route   GET /api/drugs/categories
// @access  Private
exports.getDrugCategories = asyncHandler(async (req, res, next) => {
  // Return all available categories from the schema enum
  const categories = [
    'antibiotic', 'analgesic', 'anti-inflammatory', 'antiseptic', 'anesthetic', 'vitamin', 'supplement',
    'antifungal', 'antiviral', 'antihistamine', 'decongestant', 'expectorant', 'cough_suppressant',
    'antiulcer', 'antiemetic', 'laxative', 'antidiarrheal', 'diuretic', 'antihypertensive',
    'antidiabetic', 'anticoagulant', 'antiplatelet', 'bronchodilator', 'corticosteroid',
    'immunosuppressant', 'hormone', 'mineral', 'probiotic', 'herbal', 'homeopathic', 'other'
  ];
  
  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get drug forms
// @route   GET /api/drugs/forms
// @access  Private
exports.getDrugForms = asyncHandler(async (req, res, next) => {
  // Return all available forms from the schema enum
  const forms = [
    'tablet', 'capsule', 'liquid', 'injection', 'cream', 'gel', 'drops', 'inhaler', 'suppository',
    'powder', 'suspension', 'syrup', 'spray', 'ointment', 'paste', 'patch', 'lozenge', 'chewable',
    'effervescent', 'sublingual', 'buccal', 'topical', 'ophthalmic', 'otic', 'nasal', 'rectal'
  ];
  
  res.status(200).json({
    success: true,
    data: forms
  });
});

// @desc    Check drug interactions
// @route   POST /api/drugs/check-interactions
// @access  Private
exports.checkDrugInteractions = asyncHandler(async (req, res, next) => {
  const { drugIds } = req.body;
  
  if (!drugIds || !Array.isArray(drugIds) || drugIds.length < 2) {
    return next(new ErrorResponse('Please provide at least 2 drug IDs to check interactions', 400));
  }
  
  const drugs = await Drug.find({
    _id: { $in: drugIds },
    organization: req.user.organization
  });
  
  if (drugs.length !== drugIds.length) {
    return next(new ErrorResponse('Some drugs not found', 404));
  }
  
  // Simple interaction checking logic (can be enhanced with external API)
  const interactions = [];
  
  // Check for common contraindications
  const allContraindications = drugs.flatMap(drug => drug.contraindications || []);
  const contraindicationCounts = {};
  
  allContraindications.forEach(contraindication => {
    contraindicationCounts[contraindication] = (contraindicationCounts[contraindication] || 0) + 1;
  });
  
  Object.entries(contraindicationCounts).forEach(([contraindication, count]) => {
    if (count > 1) {
      interactions.push({
        type: 'contraindication',
        severity: 'high',
        description: `Multiple drugs have contraindication: ${contraindication}`,
        drugs: drugs.filter(drug => 
          drug.contraindications && drug.contraindications.includes(contraindication)
        ).map(drug => drug.name)
      });
    }
  });
  
  // Check for controlled substances
  const controlledDrugs = drugs.filter(drug => drug.isControlled);
  if (controlledDrugs.length > 1) {
    interactions.push({
      type: 'controlled_substance',
      severity: 'medium',
      description: 'Multiple controlled substances detected',
      drugs: controlledDrugs.map(drug => drug.name)
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      drugs: drugs.map(drug => ({
        id: drug._id,
        name: drug.name,
        category: drug.category,
        isControlled: drug.isControlled
      })),
      interactions
    }
  });
});

// @desc    Bulk import drugs
// @route   POST /api/drugs/bulk-import
// @access  Private
exports.bulkImportDrugs = asyncHandler(async (req, res, next) => {
  const { drugs } = req.body;
  
  if (!drugs || !Array.isArray(drugs)) {
    return next(new ErrorResponse('Please provide drugs array', 400));
  }
  
  const drugsToInsert = drugs.map(drug => ({
    ...drug,
    organization: req.user.organization,
    createdBy: req.user.id
  }));
  
  const insertedDrugs = await Drug.insertMany(drugsToInsert);
  
  res.status(201).json({
    success: true,
    count: insertedDrugs.length,
    data: insertedDrugs
  });
});
