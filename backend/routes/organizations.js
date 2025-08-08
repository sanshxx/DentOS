const express = require('express');
const { check } = require('express-validator');
const {
  createOrganization,
  getOrganization,
  updateOrganization,
  getOrganizationStats,
  getMyOrganization,
  setupOrganization,
  searchOrganizations,
  requestJoinOrganization,
  getJoinRequests,
  handleJoinRequest,
  createUser
} = require('../controllers/organizations');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Get user's organization
router.get('/my', getMyOrganization);

// Setup organization for existing user
router.put('/setup', [
  check('name', 'Organization name is required').not().isEmpty(),
  check('slug', 'Organization slug is required').not().isEmpty(),
  check('slug', 'Slug must be lowercase and contain only letters, numbers, and hyphens').matches(/^[a-z0-9-]+$/),
  check('type', 'Organization type is required').not().isEmpty(),
  check('contactInfo.email', 'Please include a valid email').isEmail(),
  check('contactInfo.phone', 'Please include a valid 10-digit phone number').matches(/^[0-9]{10}$/),
  check('address.street', 'Street address is required').not().isEmpty(),
  check('address.city', 'City is required').not().isEmpty(),
  check('address.state', 'State is required').not().isEmpty(),
  check('address.pincode', 'Please include a valid 6-digit pincode').matches(/^[0-9]{6}$/)
], setupOrganization);

// Create new organization (only for new users during registration)
router.post('/', [
  check('name', 'Organization name is required').not().isEmpty(),
  check('slug', 'Organization slug is required').not().isEmpty(),
  check('slug', 'Slug must be lowercase and contain only letters, numbers, and hyphens').matches(/^[a-z0-9-]+$/),
  check('contactInfo.email', 'Please include a valid email').isEmail(),
  check('contactInfo.phone', 'Please include a valid 10-digit phone number').matches(/^[0-9]{10}$/),
  check('address.street', 'Street address is required').not().isEmpty(),
  check('address.city', 'City is required').not().isEmpty(),
  check('address.state', 'State is required').not().isEmpty(),
  check('address.pincode', 'Please include a valid 6-digit pincode').matches(/^[0-9]{6}$/)
], createOrganization);

// Search organizations
router.get('/search', searchOrganizations);

// Get organization details
router.get('/:id', getOrganization);

// Update organization (admin only)
router.put('/:id', authorize('admin'), [
  check('name', 'Organization name is required').not().isEmpty(),
  check('contactInfo.email', 'Please include a valid email').isEmail(),
  check('contactInfo.phone', 'Please include a valid 10-digit phone number').matches(/^[0-9]{10}$/),
  check('address.street', 'Street address is required').not().isEmpty(),
  check('address.city', 'City is required').not().isEmpty(),
  check('address.state', 'State is required').not().isEmpty(),
  check('address.pincode', 'Please include a valid 6-digit pincode').matches(/^[0-9]{6}$/)
], updateOrganization);

// Get organization statistics
router.get('/:id/stats', getOrganizationStats);

// Request to join organization
router.post('/:id/join-request', requestJoinOrganization);

// Get pending join requests (admin only)
router.get('/:id/join-requests', authorize('admin'), getJoinRequests);

// Handle join request (approve/deny) (admin only)
router.put('/:id/join-requests/:requestId', authorize('admin'), handleJoinRequest);

// Create new user (admin only)
router.post('/:id/users', authorize('admin'), [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Please include a valid 10-digit phone number').matches(/^[0-9]{10}$/),
  check('role', 'Role is required').isIn(['admin', 'manager', 'dentist', 'receptionist']),
  check('temporaryPassword', 'Temporary password is required').isLength({ min: 6 })
], createUser);

module.exports = router; 