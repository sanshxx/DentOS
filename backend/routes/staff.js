const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET api/staff
// @desc    Get all staff
// @access  Private
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Staff route is working',
    data: []
  });
});

module.exports = router;