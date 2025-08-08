const TreatmentDefinition = require('../models/TreatmentDefinition');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all treatment definitions
// @route   GET /api/treatments
// @access  Private
const getTreatments = asyncHandler(async (req, res, next) => {
  const treatments = await TreatmentDefinition.find({ organization: req.user.organization })
    .populate('user', 'name email');

  res.status(200).json({
    success: true,
    count: treatments.length,
    data: treatments
  });
});

// @desc    Get single treatment definition
// @route   GET /api/treatments/:id
// @access  Private
const getTreatment = asyncHandler(async (req, res, next) => {
  const treatment = await TreatmentDefinition.findOne({ 
    _id: req.params.id, 
    organization: req.user.organization 
  }).populate('user', 'name email');

  if (!treatment) {
    return next(new ErrorResponse(`Treatment not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: treatment
  });
});

// @desc    Create new treatment definition
// @route   POST /api/treatments
// @access  Private
const createTreatment = asyncHandler(async (req, res, next) => {
  // Add user and organization to req.body
  req.body.user = req.user.id;
  req.body.organization = req.user.organization;

  console.log('Creating treatment with data:', req.body);

  const treatment = await TreatmentDefinition.create(req.body);

  console.log('Treatment created successfully:', treatment);

  res.status(201).json({
    success: true,
    data: treatment
  });
});

// @desc    Update treatment definition
// @route   PUT /api/treatments/:id
// @access  Private
const updateTreatment = asyncHandler(async (req, res, next) => {
  let treatment = await TreatmentDefinition.findOne({ 
    _id: req.params.id, 
    organization: req.user.organization 
  });

  if (!treatment) {
    return next(new ErrorResponse(`Treatment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns treatment or is admin
  if (treatment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this treatment`, 401));
  }

  treatment = await TreatmentDefinition.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: treatment
  });
});

// @desc    Delete treatment definition
// @route   DELETE /api/treatments/:id
// @access  Private
const deleteTreatment = asyncHandler(async (req, res, next) => {
  const treatment = await TreatmentDefinition.findOne({ 
    _id: req.params.id, 
    organization: req.user.organization 
  });

  if (!treatment) {
    return next(new ErrorResponse(`Treatment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns treatment or is admin
  if (treatment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this treatment`, 401));
  }

  await treatment.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getTreatments,
  getTreatment,
  createTreatment,
  updateTreatment,
  deleteTreatment
}; 