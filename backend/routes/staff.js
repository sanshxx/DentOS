const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByRole,
  getStaffStats
} = require('../controllers/staff');

// Staff routes
router.route('/')
  .get(protect, getStaff)
  .post(protect, createStaff);

router.route('/:id')
  .get(protect, getStaffMember)
  .put(protect, updateStaff)
  .delete(protect, deleteStaff);

router.route('/role/:role')
  .get(protect, getStaffByRole);

router.route('/stats')
  .get(protect, getStaffStats);

module.exports = router;