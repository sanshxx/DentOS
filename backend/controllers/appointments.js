const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Staff = require('../models/Staff');
const { validationResult } = require('express-validator');
const sendSMS = require('../utils/sendSMS');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Special handling for patientId - convert to ObjectId and map to patient field
    if (reqQuery.patientId) {
      reqQuery.patient = reqQuery.patientId;
      delete reqQuery.patientId;
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource - filter by organization
    const baseQuery = { organization: req.user.organization, ...JSON.parse(queryStr) };
    // Apply clinic scope if present
    const scopedBase = req.scope && req.scope.clinicFilter ? { ...baseQuery, ...req.scope.clinicFilter } : baseQuery;
    query = Appointment.find(scopedBase);

    // Handle search
    if (req.query.search) {
      // Get patients matching the search (filtered by organization)
      const patients = await Patient.find({
        organization: req.user.organization,
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { phone: { $regex: req.query.search, $options: 'i' } },
          { patientId: { $regex: req.query.search, $options: 'i' } }
        ]
      }).select('_id');

      const patientIds = patients.map(patient => patient._id);

      // Get dentists matching the search (filtered by organization)
      const dentists = await Staff.find({
        organization: req.user.organization,
        $and: [
          { role: 'dentist' },
          { 
            $or: [
              { firstName: { $regex: req.query.search, $options: 'i' } },
              { lastName: { $regex: req.query.search, $options: 'i' } }
            ]
          }
        ]
      }).select('_id');

      const dentistIds = dentists.map(dentist => dentist._id);

      // Add to query
      query = query.or([
        { patient: { $in: patientIds } },
        { dentist: { $in: dentistIds } },
        { appointmentType: { $regex: req.query.search, $options: 'i' } },
        { reasonForVisit: { $regex: req.query.search, $options: 'i' } }
      ]);
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('appointmentDate');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Appointment.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Populate
    query = query.populate([
      { path: 'patient', select: 'name phone patientId' },
      { path: 'dentist', select: 'firstName lastName specialization' },
      { path: 'clinic', select: 'name branchCode' },
      { path: 'treatment', select: 'name code category duration price' }
    ]);

    // Executing query
    const appointments = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      pagination,
      total,
      data: appointments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name phone email patientId')
      .populate('dentist', 'firstName lastName specialization')
      .populate('clinic', 'name branchCode address')
      .populate('createdBy', 'name')
      .populate('treatment', 'name code category duration price');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Add user and organization to req.body
    req.body.createdBy = req.user.id;
    req.body.organization = req.user.organization;

    // Check for conflicting appointments
    const { dentist, appointmentDate, duration } = req.body;
    
    // Calculate end time
    const startTime = new Date(appointmentDate);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    // Check if dentist has another appointment at the same time
    const conflictingAppointment = await Appointment.findOne({
      dentist,
      $and: [
        { appointmentDate: { $lt: endTime } },
        { endTime: { $gt: startTime } }
      ],
      status: { $nin: ['cancelled', 'no-show'] }
    });
    
    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'The dentist already has an appointment scheduled during this time'
      });
    }

    const appointment = await Appointment.create(req.body);

    // Populate the response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name phone email')
      .populate('dentist', 'firstName lastName specialization')
      .populate('clinic', 'name branchCode')
      .populate('treatment', 'name code category duration price');

    // Send confirmation SMS if patient has phone number
    if (populatedAppointment.patient.phone) {
      try {
        const appointmentDate = new Date(populatedAppointment.appointmentDate);
        const formattedDate = appointmentDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const formattedTime = appointmentDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const message = `Dear ${populatedAppointment.patient.name}, your appointment is confirmed at ${populatedAppointment.clinic.name} on ${formattedDate} at ${formattedTime}. For any changes, please call us.`;

        await sendSMS(populatedAppointment.patient.phone, message);
      } catch (error) {
        console.error('SMS notification failed:', error);
      }
    }

    // Send confirmation email if patient has email
    if (populatedAppointment.patient.email) {
      try {
        const appointmentDate = new Date(populatedAppointment.appointmentDate);
        const formattedDate = appointmentDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const formattedTime = appointmentDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const subject = 'Appointment Confirmation';
        const message = `Dear ${populatedAppointment.patient.name},\n\nYour appointment is confirmed at ${populatedAppointment.clinic.name} on ${formattedDate} at ${formattedTime}.\n\nAppointment Details:\nDoctor: ${populatedAppointment.dentist.firstName} ${populatedAppointment.dentist.lastName}\nType: ${populatedAppointment.appointmentType}\nReason: ${populatedAppointment.reasonForVisit}\n\nFor any changes, please call us.\n\nThank you,\n${populatedAppointment.clinic.name}`;

        await sendEmail({
          email: populatedAppointment.patient.email,
          subject,
          message
        });
      } catch (error) {
        console.error('Email notification failed:', error);
      }
    }

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check for conflicting appointments if date/time is being changed
    if (req.body.appointmentDate || req.body.duration || req.body.dentist) {
      const dentist = req.body.dentist || appointment.dentist;
      const appointmentDate = req.body.appointmentDate || appointment.appointmentDate;
      const duration = req.body.duration || appointment.duration;
      
      // Calculate end time
      const startTime = new Date(appointmentDate);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      // Check if dentist has another appointment at the same time (excluding this one)
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        dentist,
        $and: [
          { appointmentDate: { $lt: endTime } },
          { endTime: { $gt: startTime } }
        ],
        status: { $nin: ['cancelled', 'no-show'] }
      });
      
      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'The dentist already has an appointment scheduled during this time'
        });
      }
    }

    // If status is being changed to cancelled, add cancellation details
    if (req.body.status === 'cancelled' && appointment.status !== 'cancelled') {
      req.body.cancelledBy = req.user.id;
      if (!req.body.cancelReason) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a reason for cancellation'
        });
      }
    }

    // Update appointment
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Populate the response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name phone email')
      .populate('dentist', 'name')
      .populate('clinic', 'name branchCode')
      .populate('treatment', 'name code category duration price');

    // Send notification if status changed to confirmed or cancelled
    if ((req.body.status === 'confirmed' || req.body.status === 'cancelled') && 
        populatedAppointment.patient.phone) {
      try {
        const appointmentDate = new Date(populatedAppointment.appointmentDate);
        const formattedDate = appointmentDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const formattedTime = appointmentDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        let message;
        if (req.body.status === 'confirmed') {
          message = `Dear ${populatedAppointment.patient.name}, your appointment is confirmed at ${populatedAppointment.clinic.name} on ${formattedDate} at ${formattedTime}. For any changes, please call us.`;
        } else if (req.body.status === 'cancelled') {
          message = `Dear ${populatedAppointment.patient.name}, your appointment at ${populatedAppointment.clinic.name} on ${formattedDate} at ${formattedTime} has been cancelled. Please call us to reschedule.`;
        }

        await sendSMS(populatedAppointment.patient.phone, message);
      } catch (error) {
        console.error('SMS notification failed:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: populatedAppointment
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is admin, manager, or receptionist
    if (!['admin', 'manager', 'receptionist'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete appointments'
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get appointments for a specific date range
// @route   GET /api/appointments/calendar
// @access  Private
exports.getCalendarAppointments = async (req, res) => {
  try {
    const { startDate, endDate, dentist, clinic } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start and end dates'
      });
    }
    
    const query = {
      appointmentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (dentist) {
      query.dentist = dentist;
    }
    
    if (clinic) {
      query.clinic = clinic;
    }
    
    const appointments = await Appointment.find(query)
      .populate('patient', 'name phone patientId')
      .populate('dentist', 'name')
      .populate('clinic', 'name branchCode')
      .sort('appointmentDate');
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Send appointment reminders
// @route   POST /api/appointments/send-reminders
// @access  Private
exports.sendReminders = async (req, res) => {
  try {
    // Check if user is admin, manager or receptionist
    if (!['admin', 'manager', 'receptionist'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send reminders'
      });
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    // Find appointments for tomorrow that haven't had reminders sent
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: { $in: ['scheduled', 'confirmed'] },
      reminderSent: false
    }).populate('patient', 'name phone email')
      .populate('dentist', 'name')
      .populate('clinic', 'name branchCode');
    
    if (appointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No appointments found that need reminders'
      });
    }
    
    let successCount = 0;
    let failureCount = 0;
    
    // Send reminders
    for (const appointment of appointments) {
      try {
        const appointmentDate = new Date(appointment.appointmentDate);
        const formattedDate = appointmentDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const formattedTime = appointmentDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        // Send SMS if phone number exists
        if (appointment.patient.phone) {
          const message = `Reminder: Dear ${appointment.patient.name}, you have an appointment tomorrow (${formattedDate}) at ${formattedTime} with Dr. ${appointment.dentist.name} at ${appointment.clinic.name}. Please confirm your attendance.`;
          
          await sendSMS(appointment.patient.phone, message);
        }
        
        // Send email if email exists
        if (appointment.patient.email) {
          const subject = 'Appointment Reminder';
          const message = `Dear ${appointment.patient.name},\n\nThis is a reminder that you have an appointment tomorrow (${formattedDate}) at ${formattedTime} with Dr. ${appointment.dentist.name} at ${appointment.clinic.name}.\n\nAppointment Details:\nType: ${appointment.appointmentType}\nReason: ${appointment.reasonForVisit}\n\nPlease arrive 10 minutes before your scheduled time. If you need to reschedule, please call us as soon as possible.\n\nThank you,\n${appointment.clinic.name}`;
          
          await sendEmail({
            email: appointment.patient.email,
            subject,
            message
          });
        }
        
        // Mark reminder as sent
        await Appointment.findByIdAndUpdate(appointment._id, { reminderSent: true });
        
        successCount++;
      } catch (error) {
        console.error(`Failed to send reminder for appointment ${appointment._id}:`, error);
        failureCount++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Sent ${successCount} reminders successfully. Failed to send ${failureCount} reminders.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};