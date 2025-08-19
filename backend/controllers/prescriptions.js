const Prescription = require('../models/Prescription');
const Drug = require('../models/Drug');
const Patient = require('../models/Patient');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all prescriptions for organization
// @route   GET /api/prescriptions
// @access  Private
exports.getPrescriptions = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search, status, patientId, doctorId, dateFrom, dateTo } = req.query;
  
  let query = { organization: req.user.organization };
  
  // Search by prescription number
  if (search) {
    query.prescriptionNumber = { $regex: search, $options: 'i' };
  }
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by patient
  if (patientId) {
    query.patient = patientId;
  }
  
  // Filter by doctor
  if (doctorId) {
    query.doctor = doctorId;
  }
  
  // Filter by date range
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { date: -1 },
    populate: [
      { path: 'patient', select: 'name phone patientId' },
      { path: 'doctor', select: 'name' },
      { path: 'medications.drug', select: 'name strength form' },
      { path: 'createdBy', select: 'name' }
    ]
  };
  
  const prescriptions = await Prescription.paginate(query, options);
  
  res.status(200).json({
    success: true,
    data: prescriptions
  });
});

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescription = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'name phone patientId email dateOfBirth gender')
    .populate('doctor', 'name')
    .populate('appointment', 'date time')
    .populate('medications.drug')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .populate('issuedBy', 'name');
  
  if (!prescription) {
    return next(new ErrorResponse(`Prescription not found with id of ${req.params.id}`, 404));
  }
  
  // Check if prescription belongs to user's organization
  if (prescription.organization.toString() !== req.user.organization.toString()) {
    return next(new ErrorResponse('Not authorized to access this prescription', 401));
  }
  
  res.status(200).json({
    success: true,
    data: prescription
  });
});

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private
exports.createPrescription = asyncHandler(async (req, res, next) => {
  req.body.organization = req.user.organization;
  req.body.doctor = req.user.id;
  req.body.createdBy = req.user.id;

  const patient = await Patient.findById(req.body.patient);
  if (!patient) {
    return next(new ErrorResponse('Patient not found', 404));
  }

  // Set clinic from patient's registered clinic
  req.body.clinic = patient.registeredClinic._id;

  // Validate medications
  if (req.body.medications && req.body.medications.length > 0) {
    for (const med of req.body.medications) {
      const drug = await Drug.findById(med.drug);
      if (!drug) {
        return next(new ErrorResponse(`Drug ${med.drug} not found`, 404));
      }
    }
  }

  const prescription = await Prescription.create(req.body);

  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate('patient', 'name phone patientId')
    .populate('doctor', 'name')
    .populate('medications.drug', 'name strength form')
    .populate('createdBy', 'name');

  res.status(201).json({ success: true, data: populatedPrescription });
});

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private
exports.updatePrescription = asyncHandler(async (req, res, next) => {
  let prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(new ErrorResponse(`Prescription not found with id of ${req.params.id}`, 404));
  }

  // Check if prescription belongs to user's organization
  if (prescription.organization.toString() !== req.user.organization.toString()) {
    return next(new ErrorResponse('Not authorized to update this prescription', 401));
  }

  // Prevent updates if prescription is already issued to patient
  if (prescription.isIssuedToPatient) {
    return next(new ErrorResponse('Cannot update prescription that has been issued to patient', 400));
  }

  // Update prescription
  prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Update updatedBy field
  prescription.updatedBy = req.user.id;
  await prescription.save();

  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate('patient', 'name phone patientId')
    .populate('doctor', 'name')
    .populate('medications.drug', 'name strength form')
    .populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    data: populatedPrescription
  });
});

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private
exports.deletePrescription = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(new ErrorResponse(`Prescription not found with id of ${req.params.id}`, 404));
  }

  // Check if prescription belongs to user's organization
  if (prescription.organization.toString() !== req.user.organization.toString()) {
    return next(new ErrorResponse('Not authorized to delete this prescription', 401));
  }

  // Prevent deletion if prescription is issued to patient
  if (prescription.isIssuedToPatient) {
    return next(new ErrorResponse('Cannot delete prescription that has been issued to patient', 400));
  }

  await prescription.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Issue prescription to patient
// @route   PUT /api/prescriptions/:id/issue
// @access  Private
exports.issuePrescriptionToPatient = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return next(new ErrorResponse(`Prescription not found with id of ${req.params.id}`, 404));
  }
  
  // Check if prescription belongs to user's organization
  if (prescription.organization.toString() !== req.user.organization.toString()) {
    return next(new ErrorResponse('Not authorized to issue this prescription', 401));
  }
  
  // Check if prescription is already issued to patient
  if (prescription.isIssuedToPatient) {
    return next(new ErrorResponse('Prescription is already issued to patient', 400));
  }
  
  // Check if prescription is active
  if (prescription.status !== 'active') {
    return next(new ErrorResponse('Only active prescriptions can be issued to patient', 400));
  }
  
  // Update prescription status
  prescription.isIssuedToPatient = true;
  prescription.issuedToPatientDate = new Date();
  prescription.issuedBy = req.user.id;
  prescription.status = 'completed';
  
  // Mark all medications as issued to patient
  prescription.medications.forEach(medication => {
    medication.isIssuedToPatient = true;
    medication.issuedToPatientDate = new Date();
    medication.issuedBy = req.user.id;
  });
  
  await prescription.save();
  
  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate('patient', 'name phone patientId')
    .populate('doctor', 'name')
    .populate('medications.drug', 'name strength form')
    .populate('issuedBy', 'name');
  
  res.status(200).json({
    success: true,
    data: populatedPrescription
  });
});

// @desc    Get prescription analytics
// @route   GET /api/prescriptions/analytics
// @access  Private
exports.getPrescriptionAnalytics = asyncHandler(async (req, res, next) => {
  const { dateFrom, dateTo } = req.query;
  
  let dateFilter = {};
  if (dateFrom || dateTo) {
    dateFilter.date = {};
    if (dateFrom) dateFilter.date.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.date.$lte = new Date(dateTo);
  }
  
  const baseQuery = { organization: req.user.organization, ...dateFilter };
  
  // Total prescriptions
  const totalPrescriptions = await Prescription.countDocuments(baseQuery);
  
  // Prescriptions by status
  const statusCounts = await Prescription.aggregate([
    { $match: baseQuery },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Prescriptions by month
  const monthlyPrescriptions = await Prescription.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Top prescribed drugs
  const topDrugs = await Prescription.aggregate([
    { $match: baseQuery },
    { $unwind: '$medications' },
    {
      $group: {
        _id: '$medications.drug',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Prescriptions issued to patient count
  const issuedToPatientCount = await Prescription.countDocuments({
    ...baseQuery,
    isIssuedToPatient: true
  });
  
  // Prescriptions not yet issued to patient count
  const notIssuedToPatientCount = await Prescription.countDocuments({
    ...baseQuery,
    isIssuedToPatient: false
  });
  
  res.status(200).json({
    success: true,
    data: {
      totalPrescriptions,
      statusCounts,
      monthlyPrescriptions,
      topDrugs,
      issuedToPatientCount,
      notIssuedToPatientCount
    }
  });
});

// @desc    Get prescription statistics
// @route   GET /api/prescriptions/stats
// @access  Private
exports.getPrescriptionStats = asyncHandler(async (req, res, next) => {
  const { period = 'month' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  if (period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = { date: { $gte: weekAgo } };
  } else if (period === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = { date: { $gte: monthAgo } };
  } else if (period === 'year') {
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    dateFilter = { date: { $gte: yearAgo } };
  }
  
  const baseQuery = { organization: req.user.organization, ...dateFilter };
  
  // Total prescriptions in period
  const totalInPeriod = await Prescription.countDocuments(baseQuery);
  
  // Prescriptions issued to patient in period
  const issuedInPeriod = await Prescription.countDocuments({
    ...baseQuery,
    isIssuedToPatient: true
  });
  
  // Prescriptions not yet issued to patient in period
  const notIssuedInPeriod = await Prescription.countDocuments({
    ...baseQuery,
    isIssuedToPatient: false
  });
  
  // Average prescriptions per day
  const daysInPeriod = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const avgPerDay = totalInPeriod / daysInPeriod;
  
  res.status(200).json({
    success: true,
    data: {
      period,
      totalInPeriod,
      issuedInPeriod,
      notIssuedInPeriod,
      avgPerDay: Math.round(avgPerDay * 100) / 100
    }
  });
});

// @desc    Search prescriptions
// @route   GET /api/prescriptions/search
// @access  Private
exports.searchPrescriptions = asyncHandler(async (req, res, next) => {
  const { q, limit = 20 } = req.query;
  
  if (!q) {
    return next(new ErrorResponse('Search query is required', 400));
  }
  
  const searchQuery = {
    organization: req.user.organization,
    $or: [
      { prescriptionNumber: { $regex: q, $options: 'i' } },
      { diagnosis: { $regex: q, $options: 'i' } },
      { notes: { $regex: q, $options: 'i' } }
    ]
  };
  
  const prescriptions = await Prescription.find(searchQuery)
    .limit(parseInt(limit))
    .sort({ date: -1 })
    .populate('patient', 'name phone patientId')
    .populate('doctor', 'name')
    .populate('medications.drug', 'name strength form');
  
  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

// @desc    Get prescriptions by patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
exports.getPrescriptionsByPatient = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const query = {
    organization: req.user.organization,
    patient: req.params.patientId
  };
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { date: -1 },
    populate: [
      { path: 'patient', select: 'name phone patientId' },
      { path: 'doctor', select: 'name' },
      { path: 'medications.drug', select: 'name strength form' },
      { path: 'createdBy', select: 'name' }
    ]
  };
  
  const prescriptions = await Prescription.paginate(query, options);
  
  res.status(200).json({
    success: true,
    data: prescriptions
  });
});

// @desc    Get prescriptions by doctor
// @route   GET /api/prescriptions/doctor/:doctorId
// @access  Private
exports.getPrescriptionsByDoctor = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const query = {
    organization: req.user.organization,
    doctor: req.params.doctorId
  };
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { date: -1 },
    populate: [
      { path: 'patient', select: 'name phone patientId' },
      { path: 'doctor', select: 'name' },
      { path: 'medications.drug', select: 'name strength form' },
      { path: 'createdBy', select: 'name' }
    ]
  };
  
  const prescriptions = await Prescription.paginate(query, options);
  
  res.status(200).json({
    success: true,
    data: prescriptions
  });
});

// @desc    Bulk update prescription status
// @route   PUT /api/prescriptions/bulk-status
// @access  Private
exports.bulkUpdateStatus = asyncHandler(async (req, res, next) => {
  const { prescriptionIds, status } = req.body;
  
  if (!prescriptionIds || !Array.isArray(prescriptionIds) || prescriptionIds.length === 0) {
    return next(new ErrorResponse('Prescription IDs array is required', 400));
  }
  
  if (!status) {
    return next(new ErrorResponse('Status is required', 400));
  }
  
  // Validate status
  const validStatuses = ['active', 'completed', 'cancelled', 'expired'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }
  
  // Update prescriptions
  const result = await Prescription.updateMany(
    {
      _id: { $in: prescriptionIds },
      organization: req.user.organization
    },
    {
      status,
      updatedBy: req.user.id
    }
  );
  
  res.status(200).json({
    success: true,
    data: {
      modifiedCount: result.modifiedCount,
      message: `Successfully updated ${result.modifiedCount} prescriptions`
    }
  });
});

// @desc    Export prescriptions
// @route   GET /api/prescriptions/export
// @access  Private
exports.exportPrescriptions = asyncHandler(async (req, res, next) => {
  const { format = 'json', dateFrom, dateTo } = req.query;
  
  let query = { organization: req.user.organization };
  
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }
  
  const prescriptions = await Prescription.find(query)
    .populate('patient', 'name phone patientId')
    .populate('doctor', 'name')
    .populate('medications.drug', 'name strength form')
    .sort({ date: -1 });
  
  if (format === 'csv') {
    // Convert to CSV format
    const csvData = prescriptions.map(prescription => ({
      'Prescription Number': prescription.prescriptionNumber,
      'Date': prescription.date.toISOString().split('T')[0],
      'Patient': prescription.patient?.name || '',
      'Doctor': `${prescription.doctor?.name || ''}`,
      'Diagnosis': prescription.diagnosis || '',
      'Status': prescription.status,
      'Issued to Patient': prescription.isIssuedToPatient ? 'Yes' : 'No',
      'Issued Date': prescription.issuedToPatientDate ? prescription.issuedToPatientDate.toISOString().split('T')[0] : '',
      'Created By': `${prescription.createdBy?.name || ''}`
    }));
    
    res.status(200).json({
      success: true,
      data: csvData,
      format: 'csv'
    });
  } else {
    res.status(200).json({
      success: true,
      data: prescriptions,
      format: 'json'
    });
  }
});
