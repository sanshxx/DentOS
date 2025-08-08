const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getClinics,
  getClinic,
  createClinic,
  updateClinic,
  deleteClinic
} = require('../controllers/clinics');

// @route   GET api/clinics
// @desc    Get all clinics
// @access  Private
router.get('/', protect, getClinics);

// @route   GET api/clinics/:id
// @desc    Get single clinic
// @access  Private
router.get('/:id', protect, getClinic);

// @route   POST api/clinics
// @desc    Create new clinic
// @access  Private (Admin and Manager only)
router.post('/', protect, authorize('admin', 'manager'), createClinic);

// @route   PUT api/clinics/:id
// @desc    Update clinic
// @access  Private (Admin and Manager only)
router.put('/:id', protect, authorize('admin', 'manager'), updateClinic);

// @route   DELETE api/clinics/:id
// @desc    Delete clinic
// @access  Private (Admin and Manager only)
router.delete('/:id', protect, authorize('admin', 'manager'), deleteClinic);

module.exports = router;