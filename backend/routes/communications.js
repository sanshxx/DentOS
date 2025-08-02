const express = require('express');
const router = express.Router({ mergeParams: true });
const { check } = require('express-validator');

// Import controllers
const {
  getPatientCommunications,
  getCommunication,
  sendCommunication,
  updateCommunicationStatus,
  getCommunicationStats,
  sendBulkCommunications
} = require('../controllers/communications');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Routes

// Get all communications for a patient
router.get('/', protect, getPatientCommunications);

// Send a communication
router.post('/',
  protect,
  [
    check('channel', 'Channel is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty(),
    check('subject', 'Subject is required when channel is Email').optional().custom((value, { req }) => {
      if (req.body.channel === 'Email' && !value) {
        throw new Error('Subject is required for email communications');
      }
      return true;
    })
  ],
  sendCommunication
);

// Get communication statistics
router.get('/stats', protect, authorize('admin', 'manager'), getCommunicationStats);

// Send bulk communications
router.post('/bulk',
  protect,
  authorize('admin', 'manager'),
  [
    check('patientIds', 'Patient IDs are required').isArray().not().isEmpty(),
    check('channel', 'Channel is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty(),
    check('subject', 'Subject is required when channel is Email').optional().custom((value, { req }) => {
      if (req.body.channel === 'Email' && !value) {
        throw new Error('Subject is required for email communications');
      }
      return true;
    })
  ],
  sendBulkCommunications
);

// Get a single communication
router.get('/:id', protect, getCommunication);

// Update communication status
router.put('/:id/status',
  protect,
  [
    check('status', 'Status is required').not().isEmpty(),
    check('status', 'Invalid status').isIn(['Pending', 'Sent', 'Delivered', 'Read', 'Failed'])
  ],
  updateCommunicationStatus
);

module.exports = router;