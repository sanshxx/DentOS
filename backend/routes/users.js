const express = require('express');
const { check } = require('express-validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserClinicAccess
} = require('../controllers/users');
const clinicScope = require('../middleware/clinicScope');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Get all users (admin only)
router.get('/', authorize('admin'), clinicScope, getUsers);

// Get single user
router.get('/:id', getUser);

// Update user
router.put('/:id', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Please include a valid 10-digit phone number').matches(/^[0-9]{10}$/)
], updateUser);

// Delete user (admin only)
router.delete('/:id', authorize('admin'), deleteUser);

// Update clinic access (admin only)
router.put('/:id/clinic-access', authorize('admin'), updateUserClinicAccess);

module.exports = router; 