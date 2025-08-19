const express = require('express');
const {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
  issuePrescriptionToPatient,
  getPrescriptionAnalytics,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  bulkUpdateStatus,
  exportPrescriptions,
  searchPrescriptions,
  getPrescriptionStats
} = require('../controllers/prescriptions');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const clinicScope = require('../middleware/clinicScope');

// Apply middleware to all routes
router.use(protect);
router.use(clinicScope);

// Routes
router.route('/')
  .get(getPrescriptions)
  .post(authorize('doctor', 'admin'), createPrescription);

router.route('/analytics')
  .get(authorize('doctor', 'admin'), getPrescriptionAnalytics);

router.route('/stats')
  .get(authorize('doctor', 'admin'), getPrescriptionStats);

router.route('/search')
  .get(searchPrescriptions);

router.route('/export')
  .get(authorize('doctor', 'admin'), exportPrescriptions);

router.route('/bulk-status')
  .put(authorize('doctor', 'admin'), bulkUpdateStatus);

router.route('/patient/:patientId')
  .get(getPrescriptionsByPatient);

router.route('/doctor/:doctorId')
  .get(getPrescriptionsByDoctor);

router.route('/:id')
  .get(getPrescription)
  .put(authorize('doctor', 'admin'), updatePrescription)
  .delete(authorize('doctor', 'admin'), deletePrescription);

router.route('/:id/issue')
  .put(authorize('doctor', 'admin'), issuePrescriptionToPatient);

module.exports = router;
