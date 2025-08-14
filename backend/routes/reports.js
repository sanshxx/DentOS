const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const clinicScope = require('../middleware/clinicScope');
const {
  getReports,
  getFinancialReports,
  getPatientReports,
  getAppointmentReports,
  getTreatmentReports
} = require('../controllers/reports');

// @route   GET api/reports
// @desc    Get all reports
// @access  Private
router.get('/', protect, clinicScope, getReports);

// @route   GET api/reports/financial
// @desc    Get financial reports
// @access  Private
router.get('/financial', protect, clinicScope, getFinancialReports);

// @route   GET api/reports/patients
// @desc    Get patient reports
// @access  Private
router.get('/patients', protect, getPatientReports);

// @route   GET api/reports/appointments
// @desc    Get appointment reports
// @access  Private
router.get('/appointments', protect, getAppointmentReports);

// @route   GET api/reports/treatments
// @desc    Get treatment reports
// @access  Private
router.get('/treatments', protect, getTreatmentReports);

module.exports = router;