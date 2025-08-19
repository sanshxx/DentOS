const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Treatment = require('../models/Treatment');
const User = require('../models/User');
const Clinic = require('../models/Clinic');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = asyncHandler(async (req, res) => {
  try {
    // Calculate date ranges for current and previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Determine clinic scope filters
    const clinicFilter = (req.scope && req.scope.clinicFilter) ? req.scope.clinicFilter : {};
    const patientClinicFilter = (req.scope && req.scope.patientClinicFilter) ? req.scope.patientClinicFilter : {};

    // Get current month counts (filtered by organization and clinic scope if present)
    const currentMonthPatients = await Patient.countDocuments({
      organization: req.user.organization,
      ...patientClinicFilter,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
    });
    const currentMonthAppointments = await Appointment.countDocuments({
      organization: req.user.organization,
      ...clinicFilter,
      appointmentDate: { $gte: currentMonthStart, $lte: currentMonthEnd }
    });
    const currentMonthTreatments = await Treatment.countDocuments({
      organization: req.user.organization,
      ...clinicFilter,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
    });
    let currentMonthInvoices = [];
    let currentMonthRevenue = 0;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Use invoiceDate for revenue (when revenue was generated)
      currentMonthInvoices = await Invoice.find({
        organization: req.user.organization,
        ...clinicFilter,
        invoiceDate: { $gte: currentMonthStart, $lte: currentMonthEnd }
      });
      currentMonthRevenue = currentMonthInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
    }

    // Get previous month counts (filtered by organization and clinic scope if present)
    const previousMonthPatients = await Patient.countDocuments({
      organization: req.user.organization,
      ...patientClinicFilter,
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });
    const previousMonthAppointments = await Appointment.countDocuments({
      organization: req.user.organization,
      ...clinicFilter,
      appointmentDate: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });
    const previousMonthTreatments = await Treatment.countDocuments({
      organization: req.user.organization,
      ...clinicFilter,
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });
    let previousMonthInvoices = [];
    let previousMonthRevenue = 0;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Use invoiceDate for revenue (when revenue was generated)
      previousMonthInvoices = await Invoice.find({
        organization: req.user.organization,
        ...clinicFilter,
        invoiceDate: { $gte: previousMonthStart, $lte: previousMonthEnd }
      });
      previousMonthRevenue = previousMonthInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
    }

    // Calculate trends (percentage change)
    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    const patientTrend = calculateTrend(currentMonthPatients, previousMonthPatients);
    const appointmentTrend = calculateTrend(currentMonthAppointments, previousMonthAppointments);
    const treatmentTrend = calculateTrend(currentMonthTreatments, previousMonthTreatments);
    const revenueTrend = calculateTrend(currentMonthRevenue, previousMonthRevenue);

    // Get total counts (all time) - filtered by organization and clinic scope
    const totalPatients = await Patient.countDocuments({ organization: req.user.organization, ...patientClinicFilter });
    const totalAppointments = await Appointment.countDocuments({ organization: req.user.organization, ...clinicFilter });
    const totalTreatments = await Treatment.countDocuments({ organization: req.user.organization, ...clinicFilter });
    
    // Get total revenue (all time) - filtered by organization and role
    let totalRevenue = 0;
    let invoices = [];
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      invoices = await Invoice.find({ organization: req.user.organization, ...clinicFilter });
      totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
    }
    
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentsToday = await Appointment.find({
      organization: req.user.organization,
      ...clinicFilter,
      appointmentDate: { $gte: today, $lt: tomorrow }
    }).populate('patient', 'name');
    
    const formattedAppointmentsToday = appointmentsToday.map(appointment => ({
      id: appointment._id,
      patientName: appointment.patient ? appointment.patient.name : 'Unknown Patient',
      time: new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: appointment.appointmentType || 'Consultation',
      status: appointment.status
    }));
    
    // Get recent patients (last 5) - filtered by organization and clinic
    const recentPatients = await Patient.find({ organization: req.user.organization, ...patientClinicFilter })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name phone gender createdAt');
    
    const formattedRecentPatients = recentPatients.map(patient => ({
      id: patient._id,
      name: patient.name,
      date: patient.createdAt,
      phone: patient.phone,
      gender: patient.gender
    }));
    
    // Get upcoming appointments (next 5) - filtered by organization
    const upcomingAppointments = await Appointment.find({
      organization: req.user.organization,
      ...clinicFilter,
      appointmentDate: { $gt: today }
    })
      .sort({ appointmentDate: 1 })
      .limit(5)
      .populate('patient', 'name');
    
    const formattedUpcomingAppointments = upcomingAppointments.map(appointment => ({
      id: appointment._id,
      patientName: appointment.patient ? appointment.patient.name : 'Unknown Patient',
      date: appointment.appointmentDate,
      time: new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: appointment.appointmentType || 'Consultation'
    }));
    
    // Get revenue by month (last 7 months) - only for admin and manager
    let revenueByMonth = [];
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      const sevenMonthsAgo = new Date();
      sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
      sevenMonthsAgo.setDate(1);
      sevenMonthsAgo.setHours(0, 0, 0, 0);
      
      // Use invoiceDate for revenue aggregation (when revenue was generated)
      const invoicesByMonth = await Invoice.aggregate([
        {
          $match: {
            organization: new mongoose.Types.ObjectId(req.user.organization),
            invoiceDate: { $gte: sevenMonthsAgo }, // Use invoiceDate instead of createdAt
            ...(clinicFilter.clinic ? { clinic: clinicFilter.clinic } : {})
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$invoiceDate" } }, // Group by invoiceDate
            revenue: { $sum: "$totalAmount" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      revenueByMonth = invoicesByMonth.map(item => {
        const [year, month] = item._id.split('-');
        return {
          month: months[parseInt(month) - 1],
          revenue: item.revenue
        };
      });
    }
    
    // Get appointments by type - filtered by organization
    const appointmentsByType = await Appointment.aggregate([
      {
        $match: {
          organization: new mongoose.Types.ObjectId(req.user.organization),
          ...(clinicFilter.clinic ? { clinic: clinicFilter.clinic } : {})
        }
      },
      {
        $group: {
          _id: '$appointmentType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: { $ifNull: ["$_id", "Other"] },
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Format the response
    const dashboardData = {
      totalPatients,
      totalAppointments,
      totalRevenue,
      totalTreatments,
      trends: {
        patients: patientTrend,
        appointments: appointmentTrend,
        treatments: treatmentTrend,
        revenue: revenueTrend
      },
      appointmentsToday: formattedAppointmentsToday,
      recentPatients: formattedRecentPatients,
      upcomingAppointments: formattedUpcomingAppointments,
      revenueByMonth,
      appointmentsByType
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});