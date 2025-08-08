const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res) => {
  try {
    // Build query conditions - filter by organization
    const queryConditions = {
      organization: req.user.organization
    };

    // Handle search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryConditions.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { patientId: searchRegex }
      ];
    }

    // Handle filters
    if (req.query.gender) {
      queryConditions.gender = req.query.gender.toLowerCase();
    }

    if (req.query.ageGroup) {
      let minAge, maxAge;
      
      switch (req.query.ageGroup) {
        case 'below18':
          minAge = 0;
          maxAge = 17;
          break;
        case '18to30':
          minAge = 18;
          maxAge = 30;
          break;
        case '31to45':
          minAge = 31;
          maxAge = 45;
          break;
        case '46to60':
          minAge = 46;
          maxAge = 60;
          break;
        case 'above60':
          minAge = 61;
          maxAge = 120;
          break;
        default:
          break;
      }
      
      if (minAge !== undefined && maxAge !== undefined) {
        queryConditions.age = { $gte: minAge, $lte: maxAge };
      }
    }

    // Create the base query
    let query = Patient.find(queryConditions);

    // Handle clinic filter (post-query)
    if (req.query.clinic) {
      // Will be handled after query execution
    }

    if (req.query.ageGroup) {
      let minAge, maxAge;
      
      switch (req.query.ageGroup) {
        case 'below18':
          minAge = 0;
          maxAge = 17;
          break;
        case '18to30':
          minAge = 18;
          maxAge = 30;
          break;
        case '31to45':
          minAge = 31;
          maxAge = 45;
          break;
        case '46to60':
          minAge = 46;
          maxAge = 60;
          break;
        case 'above60':
          minAge = 61;
          maxAge = 120;
          break;
        default:
          break;
      }
      
      if (minAge !== undefined && maxAge !== undefined) {
        // Use the age field directly for filtering
        query = query.where('age', { $gte: minAge, $lte: maxAge });
        console.log(`🔍 Age filter applied: ${minAge} <= age <= ${maxAge}`);
        
        // Debug: Let's also log the query to see what's happening
        console.log(`🔍 Query conditions:`, JSON.stringify(query.getQuery()));
      }
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
    
    // Count total documents before applying pagination
    const total = await Patient.countDocuments(query.getQuery());

    query = query.skip(startIndex).limit(limit);

    // Always populate clinic for consistent data structure
    query = query.populate('registeredClinic', 'name branchCode');

    // Executing query
    let patients = await query;

    // Post-query filtering for clinic
    if (req.query.clinic) {
      const beforeCount = patients.length;
      patients = patients.filter(patient => 
        patient.registeredClinic && 
        patient.registeredClinic.name.toLowerCase().includes(req.query.clinic.toLowerCase())
      );
    }

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
      count: patients.length,
      pagination,
      total: patients.length, // Use filtered count
      data: patients
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('registeredClinic', 'name branchCode address contactNumbers')
      .populate('createdBy', 'name');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient belongs to user's organization
    if (patient.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Add user and organization to req.body
    req.body.createdBy = req.user.id;
    req.body.organization = req.user.organization;

    // Check for existing patient with same phone number in the same organization
    const existingPatient = await Patient.findOne({ 
      phone: req.body.phone,
      organization: req.user.organization
    });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'A patient with this phone number already exists'
      });
    }

    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient belongs to user's organization
    if (patient.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this patient'
      });
    }

    // Update patient
    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient belongs to user's organization
    if (patient.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this patient'
      });
    }

    // Check if user is admin or manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete patients'
      });
    }

    await patient.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get patient medical history
// @route   GET /api/patients/:id/medical-history
// @access  Private
exports.getMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select('medicalHistory dentalHistory');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        medicalHistory: patient.medicalHistory,
        dentalHistory: patient.dentalHistory
      }
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update patient medical history
// @route   PUT /api/patients/:id/medical-history
// @access  Private
exports.updateMedicalHistory = async (req, res) => {
  try {
    const { medicalHistory, dentalHistory } = req.body;

    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update medical history
    patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { medicalHistory, dentalHistory },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: {
        medicalHistory: patient.medicalHistory,
        dentalHistory: patient.dentalHistory
      }
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};