const express = require('express');
const { check } = require('express-validator');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getCalendarAppointments,
  sendReminders
} = require('../controllers/appointments');
const { protect, authorize } = require('../middleware/auth');
const clinicScope = require('../middleware/clinicScope');

const router = express.Router();

// Apply protection and clinic scope to all routes
router.use(protect, clinicScope);

// Get calendar appointments
router.get('/calendar', getCalendarAppointments);

// Send appointment reminders
router.post(
  '/send-reminders',
  authorize('admin', 'manager', 'receptionist'),
  sendReminders
);

// Get all appointments and create new appointment
router.route('/')
  .get(getAppointments)
  .post(
    [
      check('patient', 'Patient is required').not().isEmpty(),
      check('clinic', 'Clinic is required').not().isEmpty(),
      check('dentist', 'Dentist is required').not().isEmpty(),
      check('appointmentDate', 'Appointment date is required').not().isEmpty(),
      check('appointmentType', 'Appointment type is required').not().isEmpty(),
      check('reasonForVisit', 'Reason for visit is required').not().isEmpty()
    ],
    createAppointment
  );

// Get, update and delete single appointment
router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(authorize('admin', 'manager'), deleteAppointment);

module.exports = router;