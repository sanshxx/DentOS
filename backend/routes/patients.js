const express = require('express');
const { check } = require('express-validator');
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getMedicalHistory,
  updateMedicalHistory
} = require('../controllers/patients');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Get all patients and create new patient
router.route('/')
  .get(getPatients)
  .post(
    [
      check('name', 'Name is required').not().isEmpty(),
      check('phone', 'Please include a valid 10-digit phone number').matches(/^[0-9]{10}$/),
      check('gender', 'Gender is required').not().isEmpty(),
      check('dateOfBirth', 'Date of birth is required').not().isEmpty(),
      check('registeredClinic', 'Registered clinic is required').not().isEmpty()
    ],
    createPatient
  );

// Get, update and delete single patient
router.route('/:id')
  .get(getPatient)
  .put(updatePatient)
  .delete(authorize('admin', 'manager'), deletePatient);

// Get and update medical history
router.route('/:id/medical-history')
  .get(getMedicalHistory)
  .put(updateMedicalHistory);

module.exports = router;