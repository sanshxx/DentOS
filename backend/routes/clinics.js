const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET api/clinics
// @desc    Get all clinics
// @access  Private
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Clinics route is working',
    data: []
  });
});

module.exports = router;