const Staff = require('../models/Staff');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private
exports.getStaff = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource - filter by organization
  const baseQuery = { organization: req.user.organization, ...JSON.parse(queryStr) };
  query = Staff.find(baseQuery);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Staff.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const staff = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: staff.length,
    pagination,
    total,
    data: staff
  });
});

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private
exports.getStaffMember = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff member not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private
exports.createStaff = asyncHandler(async (req, res, next) => {
  // Add user and organization to req.body
  req.body.createdBy = req.user.id;
  req.body.organization = req.user.organization;

  const staff = await Staff.create(req.body);

  res.status(201).json({
    success: true,
    data: staff
  });
});

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private
exports.updateStaff = asyncHandler(async (req, res, next) => {
  let staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff member not found with id of ${req.params.id}`, 404));
  }

  // Update staff member
  staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private
exports.deleteStaff = asyncHandler(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse(`Staff member not found with id of ${req.params.id}`, 404));
  }

  await staff.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get staff by role
// @route   GET /api/staff/role/:role
// @access  Private
exports.getStaffByRole = asyncHandler(async (req, res, next) => {
  const staff = await Staff.find({ role: req.params.role });

  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc    Get staff statistics
// @route   GET /api/staff/stats
// @access  Private
exports.getStaffStats = asyncHandler(async (req, res, next) => {
  const stats = await Staff.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalStaff = await Staff.countDocuments();
  const activeStaff = await Staff.countDocuments({ status: 'active' });

  res.status(200).json({
    success: true,
    data: {
      totalStaff,
      activeStaff,
      byRole: stats
    }
  });
}); 