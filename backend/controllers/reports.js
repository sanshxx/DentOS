const asyncHandler = require('../middleware/async');

// Mock data for reports
const mockRevenueData = [
  { month: 'Jan', revenue: 125000 },
  { month: 'Feb', revenue: 145000 },
  { month: 'Mar', revenue: 165000 },
  { month: 'Apr', revenue: 185000 },
  { month: 'May', revenue: 205000 },
  { month: 'Jun', revenue: 225000 },
  { month: 'Jul', revenue: 245000 },
  { month: 'Aug', revenue: 265000 },
  { month: 'Sep', revenue: 285000 },
  { month: 'Oct', revenue: 305000 },
  { month: 'Nov', revenue: 325000 },
  { month: 'Dec', revenue: 345000 }
];

const mockPatientData = [
  { month: 'Jan', newPatients: 45, returning: 120 },
  { month: 'Feb', newPatients: 50, returning: 130 },
  { month: 'Mar', newPatients: 55, returning: 140 },
  { month: 'Apr', newPatients: 60, returning: 150 },
  { month: 'May', newPatients: 65, returning: 160 },
  { month: 'Jun', newPatients: 70, returning: 170 },
  { month: 'Jul', newPatients: 75, returning: 180 },
  { month: 'Aug', newPatients: 80, returning: 190 },
  { month: 'Sep', newPatients: 85, returning: 200 },
  { month: 'Oct', newPatients: 90, returning: 210 },
  { month: 'Nov', newPatients: 95, returning: 220 },
  { month: 'Dec', newPatients: 100, returning: 230 }
];

const mockAppointmentData = [
  { month: 'Jan', scheduled: 180, completed: 165, cancelled: 15 },
  { month: 'Feb', scheduled: 190, completed: 175, cancelled: 15 },
  { month: 'Mar', scheduled: 200, completed: 185, cancelled: 15 },
  { month: 'Apr', scheduled: 210, completed: 195, cancelled: 15 },
  { month: 'May', scheduled: 220, completed: 205, cancelled: 15 },
  { month: 'Jun', scheduled: 230, completed: 215, cancelled: 15 },
  { month: 'Jul', scheduled: 240, completed: 225, cancelled: 15 },
  { month: 'Aug', scheduled: 250, completed: 235, cancelled: 15 },
  { month: 'Sep', scheduled: 260, completed: 245, cancelled: 15 },
  { month: 'Oct', scheduled: 270, completed: 255, cancelled: 15 },
  { month: 'Nov', scheduled: 280, completed: 265, cancelled: 15 },
  { month: 'Dec', scheduled: 290, completed: 275, cancelled: 15 }
];

const mockTreatmentData = [
  { name: 'Cleaning', count: 450, value: 450 },
  { name: 'Filling', count: 320, value: 320 },
  { name: 'Root Canal', count: 180, value: 180 },
  { name: 'Crown', count: 150, value: 150 },
  { name: 'Extraction', count: 120, value: 120 },
  { name: 'Whitening', count: 100, value: 100 },
  { name: 'Braces', count: 80, value: 80 },
  { name: 'Dentures', count: 50, value: 50 }
];

const mockClinicData = [
  { name: 'Main Clinic', patients: 450, revenue: 450000 },
  { name: 'North Branch', patients: 320, revenue: 320000 },
  { name: 'South Branch', patients: 280, revenue: 280000 },
  { name: 'East Branch', patients: 250, revenue: 250000 },
  { name: 'West Branch', patients: 200, revenue: 200000 }
];

const mockDentistData = [
  { name: 'Dr. Smith', patients: 350, revenue: 350000 },
  { name: 'Dr. Johnson', patients: 300, revenue: 300000 },
  { name: 'Dr. Williams', patients: 280, revenue: 280000 },
  { name: 'Dr. Brown', patients: 250, revenue: 250000 },
  { name: 'Dr. Jones', patients: 220, revenue: 220000 },
  { name: 'Dr. Garcia', patients: 200, revenue: 200000 },
  { name: 'Dr. Miller', patients: 180, revenue: 180000 },
  { name: 'Dr. Davis', patients: 150, revenue: 150000 }
];

// @desc    Get all reports data
// @route   GET /api/reports
// @access  Private
exports.getReports = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Reports data retrieved successfully',
    data: {
      revenue: mockRevenueData,
      patients: mockPatientData,
      appointments: mockAppointmentData,
      treatments: mockTreatmentData,
      clinics: mockClinicData,
      dentists: mockDentistData
    }
  });
});

// @desc    Get financial reports
// @route   GET /api/reports/financial
// @access  Private
exports.getFinancialReports = asyncHandler(async (req, res, next) => {
  // Get query parameters for filtering
  const { startDate, endDate, clinicId } = req.query;
  
  // In a real app, we would filter based on these parameters
  // For now, we'll just return the mock data
  
  res.status(200).json({
    success: true,
    message: 'Financial reports retrieved successfully',
    data: {
      revenue: mockRevenueData,
      clinics: mockClinicData,
      dentists: mockDentistData
    }
  });
});

// @desc    Get patient reports
// @route   GET /api/reports/patients
// @access  Private
exports.getPatientReports = asyncHandler(async (req, res, next) => {
  // Get query parameters for filtering
  const { startDate, endDate, clinicId } = req.query;
  
  // In a real app, we would filter based on these parameters
  // For now, we'll just return the mock data
  
  res.status(200).json({
    success: true,
    message: 'Patient reports retrieved successfully',
    data: {
      patients: mockPatientData
    }
  });
});

// @desc    Get appointment reports
// @route   GET /api/reports/appointments
// @access  Private
exports.getAppointmentReports = asyncHandler(async (req, res, next) => {
  // Get query parameters for filtering
  const { startDate, endDate, clinicId } = req.query;
  
  // In a real app, we would filter based on these parameters
  // For now, we'll just return the mock data
  
  res.status(200).json({
    success: true,
    message: 'Appointment reports retrieved successfully',
    data: {
      appointments: mockAppointmentData
    }
  });
});

// @desc    Get treatment reports
// @route   GET /api/reports/treatments
// @access  Private
exports.getTreatmentReports = asyncHandler(async (req, res, next) => {
  // Get query parameters for filtering
  const { startDate, endDate, clinicId } = req.query;
  
  // In a real app, we would filter based on these parameters
  // For now, we'll just return the mock data
  
  res.status(200).json({
    success: true,
    message: 'Treatment reports retrieved successfully',
    data: {
      treatments: mockTreatmentData
    }
  });
});