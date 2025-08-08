const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTreatments,
  getTreatment,
  createTreatment,
  updateTreatment,
  deleteTreatment
} = require('../controllers/treatments');

// @route   GET api/treatments
// @desc    Get all treatments
// @access  Private
router.get('/', protect, getTreatments);

// @route   GET api/treatments/:id
// @desc    Get single treatment
// @access  Private
router.get('/:id', protect, getTreatment);

// @route   POST api/treatments
// @desc    Create new treatment
// @access  Private
router.post('/', protect, createTreatment);

// @route   PUT api/treatments/:id
// @desc    Update treatment
// @access  Private
router.put('/:id', protect, updateTreatment);

// @route   DELETE api/treatments/:id
// @desc    Delete treatment
// @access  Private
router.delete('/:id', protect, deleteTreatment);

module.exports = router;