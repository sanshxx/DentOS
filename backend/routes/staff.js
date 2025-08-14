const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const clinicScope = require('../middleware/clinicScope');
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
  .get(protect, clinicScope, getStaff)
  .post(protect, clinicScope, createStaff);

router.route('/:id')
  .get(protect, clinicScope, getStaffMember)
  .put(protect, clinicScope, updateStaff)
  .delete(protect, clinicScope, deleteStaff);

router.route('/role/:role')
  .get(protect, clinicScope, getStaffByRole);

router.route('/stats')
  .get(protect, clinicScope, getStaffStats);

module.exports = router;