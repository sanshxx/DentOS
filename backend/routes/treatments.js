const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET api/treatments
// @desc    Get all treatments
// @access  Private
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Treatments route is working',
    data: []
  });
});

module.exports = router;