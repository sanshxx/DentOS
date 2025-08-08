const asyncHandler = require('../middleware/async');
const Clinic = require('../models/Clinic');
const { validationResult } = require('express-validator');

// @desc    Get all clinics
// @route   GET /api/clinics
// @access  Private
exports.getClinics = asyncHandler(async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource - filter by organization
    const baseQuery = { organization: req.user.organization, ...JSON.parse(queryStr) };
    query = Clinic.find(baseQuery);

    // Handle search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { name: searchRegex },
        { branchCode: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex }
      ]);
    }

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
    const total = await Clinic.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const clinics = await query;

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
      count: clinics.length,
      pagination,
      total,
      data: clinics
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get single clinic
// @route   GET /api/clinics/:id
// @access  Private
exports.getClinic = asyncHandler(async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    res.status(200).json({
      success: true,
      data: clinic
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Create new clinic
// @route   POST /api/clinics
// @access  Private
exports.createClinic = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check for existing clinic with same branch code in the same organization
    const existingClinic = await Clinic.findOne({ 
      branchCode: req.body.branchCode,
      organization: req.user.organization
    });
    if (existingClinic) {
      return res.status(400).json({
        success: false,
        message: 'A clinic with this branch code already exists in your organization'
      });
    }

    // Add organization to req.body
    req.body.organization = req.user.organization;
    const clinic = await Clinic.create(req.body);

    res.status(201).json({
      success: true,
      data: clinic
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Update clinic
// @route   PUT /api/clinics/:id
// @access  Private
exports.updateClinic = asyncHandler(async (req, res) => {
  try {
    let clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    // Update clinic
    clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: clinic
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Delete clinic
// @route   DELETE /api/clinics/:id
// @access  Private
exports.deleteClinic = asyncHandler(async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    await clinic.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});