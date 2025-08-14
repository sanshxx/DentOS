const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Treatment = require('../models/Treatment');
const Clinic = require('../models/Clinic');
const User = require('../models/User');

// @desc    Get all reports data
// @route   GET /api/reports
// @access  Private
exports.getReports = asyncHandler(async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { startDate, endDate, clinicId: clinicIdQuery } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    } else {
      // Default to last 12 months if no start date
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1);
      twelveMonthsAgo.setHours(0, 0, 0, 0);
      dateFilter.createdAt = { $gte: twelveMonthsAgo };
    }
    
    if (endDate) {
      if (dateFilter.createdAt) {
        dateFilter.createdAt.$lte = new Date(endDate);
      } else {
        dateFilter.createdAt = { $lte: new Date(endDate) };
      }
    }
    
    // Build clinic filter
    // Prefer enforced scope; fall back to query param for compatibility
    const scopedClinicId = (req.scope && req.scope.clinicFilter && req.scope.clinicFilter.clinic) || clinicIdQuery || null;
    const clinicFilter = scopedClinicId ? { clinic: new mongoose.Types.ObjectId(scopedClinicId) } : {};
    const patientClinicFilter = scopedClinicId ? { registeredClinic: new mongoose.Types.ObjectId(scopedClinicId) } : {};
    
    // Combine filters with organization
    const filter = { organization: req.user.organization, ...dateFilter, ...clinicFilter };
    const patientFilter = { organization: req.user.organization, ...dateFilter, ...patientClinicFilter };
    

    
    const revenueData = await Invoice.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Format revenue data
    const formattedRevenueData = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthData = revenueData.find(item => item._id === yearMonth);
      
      formattedRevenueData.unshift({
        month: months[date.getMonth()],
        revenue: monthData ? monthData.revenue : 0
      });
    }
    
    // Get patient data by month (new vs returning)
    const patientData = await Patient.aggregate([
      {
        $match: patientFilter
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          newPatients: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get appointment data by month and status
    const appointmentData = await Appointment.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: { 
            yearMonth: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.yearMonth": 1 }
      }
    ]);
    
    // Format patient and appointment data
    const formattedPatientData = [];
    const formattedAppointmentData = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthPatientData = patientData.find(item => item._id === yearMonth);
      
      // Get appointment counts by status for this month
      const scheduled = appointmentData.find(item => 
        item._id.yearMonth === yearMonth && item._id.status === 'scheduled'
      );
      
      const completed = appointmentData.find(item => 
        item._id.yearMonth === yearMonth && item._id.status === 'completed'
      );
      
      const cancelled = appointmentData.find(item => 
        item._id.yearMonth === yearMonth && (item._id.status === 'cancelled' || item._id.status === 'no-show')
      );
      
      formattedPatientData.unshift({
        month: months[date.getMonth()],
        newPatients: monthPatientData ? monthPatientData.newPatients : 0,
        returning: 0 // This would require more complex queries with patient visit history
      });
      
      formattedAppointmentData.unshift({
        month: months[date.getMonth()],
        scheduled: scheduled ? scheduled.count : 0,
        completed: completed ? completed.count : 0,
        cancelled: cancelled ? cancelled.count : 0
      });
    }
    
    // Get treatment data by appointment type
    const treatmentData = await Appointment.aggregate([
      {
        $match: {
          ...filter,
          appointmentType: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$appointmentType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 8
      }
    ]);
    
    const formattedTreatmentData = treatmentData.map(item => ({
      name: item._id,
      count: item.count,
      value: item.count // Using count as value for visualization
    }));
    
    // Get clinic data
    const clinicData = await Clinic.aggregate([
      // If a specific clinic is selected, filter by that clinic
      ...(scopedClinicId ? [{ $match: { _id: new mongoose.Types.ObjectId(scopedClinicId) } }] : []),
      {
        $lookup: {
          from: 'patients',
          localField: '_id',
          foreignField: 'registeredClinic',
          as: 'patients'
        }
      },
      {
        $lookup: {
          from: 'invoices',
          localField: '_id',
          foreignField: 'clinic',
          as: 'invoices'
        }
      },
      {
        $project: {
          name: 1,
          patientCount: { $size: '$patients' },
          revenue: { $sum: '$invoices.totalAmount' }
        }
      },
      {
        $sort: { patientCount: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    const formattedClinicData = clinicData.map(clinic => ({
      name: clinic.name,
      patients: clinic.patientCount,
      revenue: clinic.revenue
    }));
    
    // Get dentist data
    const dentistData = await User.aggregate([
      {
        $match: { role: 'dentist' }
      },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'dentist',
          as: 'appointments'
        }
      },
      // Filter appointments by clinic if clinic is selected
      ...(scopedClinicId ? [{
        $addFields: {
          appointments: {
            $filter: {
              input: '$appointments',
              as: 'appointment',
              cond: { $eq: ['$$appointment.clinic', new mongoose.Types.ObjectId(scopedClinicId) ] }
            }
          }
        }
      }] : []),
      {
        $lookup: {
          from: 'invoices',
          localField: 'appointments.invoice',
          foreignField: '_id',
          as: 'invoices'
        }
      },
      {
        $project: {
          name: 1,
          patientCount: { $size: { $setUnion: '$appointments.patient' } },
          revenue: { $sum: '$invoices.totalAmount' }
        }
      },
      {
        $sort: { patientCount: -1 }
      },
      {
        $limit: 8
      }
    ]);
    
    const formattedDentistData = dentistData.map(dentist => ({
      name: dentist.name,
      patients: dentist.patientCount,
      revenue: dentist.revenue
    }));
    
    res.status(200).json({
      success: true,
      message: 'Reports data retrieved successfully',
      data: {
        revenue: formattedRevenueData,
        patients: formattedPatientData,
        appointments: formattedAppointmentData,
        treatments: formattedTreatmentData,
        clinics: formattedClinicData,
        dentists: formattedDentistData
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get financial reports
// @route   GET /api/reports/financial
// @access  Private
exports.getFinancialReports = asyncHandler(async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { startDate, endDate, clinicId } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.invoiceDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (dateFilter.invoiceDate) {
        dateFilter.invoiceDate.$lte = new Date(endDate);
      } else {
        dateFilter.invoiceDate = { $lte: new Date(endDate) };
      }
    }
    
    // Build clinic filter
    const clinicFilter = clinicId ? { clinic: clinicId } : {};
    
    // Combine filters
    const filter = { ...dateFilter, ...clinicFilter };
    
    // Get revenue data by month
    const revenueData = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$invoiceDate" },
            month: { $month: "$invoiceDate" }
          },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format revenue data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedRevenueData = revenueData.map(item => ({
      month: months[item._id.month - 1],
      revenue: item.revenue
    }));
    
    // Get revenue by clinic
    const clinicRevenueData = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$clinic",
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'clinics',
          localField: '_id',
          foreignField: '_id',
          as: 'clinicInfo'
        }
      },
      { $unwind: "$clinicInfo" },
      {
        $project: {
          name: "$clinicInfo.name",
          revenue: 1,
          count: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    // Get revenue by dentist
    const dentistRevenueData = await Appointment.aggregate([
      { $match: { ...filter, dentist: { $exists: true } } },
      {
        $group: {
          _id: "$dentist",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'dentistInfo'
        }
      },
      { $unwind: "$dentistInfo" },
      {
        $project: {
          name: { $concat: ["$dentistInfo.firstName", " ", "$dentistInfo.lastName"] },
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Financial reports retrieved successfully',
      data: {
        revenue: formattedRevenueData,
        clinics: clinicRevenueData,
        dentists: dentistRevenueData
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get patient reports
// @route   GET /api/reports/patients
// @access  Private
exports.getPatientReports = asyncHandler(async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { startDate, endDate, clinicId } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (dateFilter.createdAt) {
        dateFilter.createdAt.$lte = new Date(endDate);
      } else {
        dateFilter.createdAt = { $lte: new Date(endDate) };
      }
    }
    
    // Build clinic filter for appointments
    const clinicFilter = clinicId ? { clinic: clinicId } : {};
    
    // Get new patients by month
    const newPatientsByMonth = await Patient.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Get returning patients by month (patients with appointments)
    const returningPatientsByMonth = await Appointment.aggregate([
      { $match: { ...dateFilter, ...clinicFilter } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            patient: "$patient"
          }
        }
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format patient data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedPatientData = [];
    
    // Create a map for quick lookup
    const newPatientsMap = new Map();
    const returningPatientsMap = new Map();
    
    newPatientsByMonth.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      newPatientsMap.set(key, item.count);
    });
    
    returningPatientsByMonth.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      returningPatientsMap.set(key, item.count);
    });
    
    // Get current year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Create data for the last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const key = `${year}-${month}`;
      
      formattedPatientData.unshift({
        month: months[month - 1],
        newPatients: newPatientsMap.get(key) || 0,
        returning: returningPatientsMap.get(key) || 0
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Patient reports retrieved successfully',
      data: {
        patients: formattedPatientData
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get appointment reports
// @route   GET /api/reports/appointments
// @access  Private
exports.getAppointmentReports = asyncHandler(async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { startDate, endDate, clinicId } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.date = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (dateFilter.date) {
        dateFilter.date.$lte = new Date(endDate);
      } else {
        dateFilter.date = { $lte: new Date(endDate) };
      }
    }
    
    // Build clinic filter
    const clinicFilter = clinicId ? { clinic: clinicId } : {};
    
    // Combine filters
    const filter = { ...dateFilter, ...clinicFilter };
    
    // Get appointment data by month and status
    const appointmentsByMonth = await Appointment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format appointment data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedAppointmentData = [];
    
    // Create a map for quick lookup
    const appointmentsMap = new Map();
    
    appointmentsByMonth.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!appointmentsMap.has(key)) {
        appointmentsMap.set(key, {
          scheduled: 0,
          completed: 0,
          cancelled: 0
        });
      }
      
      const statusMap = {
        'scheduled': 'scheduled',
        'confirmed': 'scheduled',
        'completed': 'completed',
        'cancelled': 'cancelled',
        'no-show': 'cancelled'
      };
      
      const mappedStatus = statusMap[item._id.status] || 'scheduled';
      appointmentsMap.get(key)[mappedStatus] += item.count;
    });
    
    // Get current year and month
    const currentDate = new Date();
    
    // Create data for the last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const key = `${year}-${month}`;
      
      const appointmentData = appointmentsMap.get(key) || { scheduled: 0, completed: 0, cancelled: 0 };
      
      formattedAppointmentData.unshift({
        month: months[month - 1],
        scheduled: appointmentData.scheduled + appointmentData.completed + appointmentData.cancelled,
        completed: appointmentData.completed,
        cancelled: appointmentData.cancelled
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Appointment reports retrieved successfully',
      data: {
        appointments: formattedAppointmentData
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get treatment reports
// @route   GET /api/reports/treatments
// @access  Private
exports.getTreatmentReports = asyncHandler(async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { startDate, endDate, clinicId } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.date = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (dateFilter.date) {
        dateFilter.date.$lte = new Date(endDate);
      } else {
        dateFilter.date = { $lte: new Date(endDate) };
      }
    }
    
    // Build clinic filter
    const clinicFilter = clinicId ? { clinic: clinicId } : {};
    
    // Combine filters
    const filter = { ...dateFilter, ...clinicFilter };
    
    // Get treatment data by type
    const treatmentData = await Treatment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          value: { $sum: "$cost" }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1,
          value: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Treatment reports retrieved successfully',
      data: {
        treatments: treatmentData
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});