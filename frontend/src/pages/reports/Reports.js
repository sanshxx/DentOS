import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Grid, Card, CardContent, CardHeader,
  Tabs, Tab, Button, FormControl, InputLabel, Select, MenuItem, TextField,
  Divider, List, ListItem, ListItemText, CircularProgress, Alert,
  IconButton, Tooltip as MuiTooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import AuthContext from '../../context/AuthContext';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';

// Mock data for reports
const mockRevenueData = [
  { month: 'Jan', revenue: 350000 },
  { month: 'Feb', revenue: 420000 },
  { month: 'Mar', revenue: 380000 },
  { month: 'Apr', revenue: 450000 },
  { month: 'May', revenue: 520000 },
  { month: 'Jun', revenue: 480000 },
  { month: 'Jul', revenue: 550000 },
  { month: 'Aug', revenue: 590000 },
  { month: 'Sep', revenue: 620000 },
  { month: 'Oct', revenue: 580000 },
  { month: 'Nov', revenue: 630000 },
  { month: 'Dec', revenue: 680000 }
];

const mockTreatmentData = [
  { name: 'Root Canal', count: 145, revenue: 1450000 },
  { name: 'Cleaning', count: 230, revenue: 575000 },
  { name: 'Filling', count: 310, revenue: 930000 },
  { name: 'Extraction', count: 180, revenue: 540000 },
  { name: 'Crown', count: 120, revenue: 1080000 },
  { name: 'Braces', count: 85, revenue: 1275000 }
];

const mockPatientData = [
  { month: 'Jan', newPatients: 28, returning: 65 },
  { month: 'Feb', newPatients: 32, returning: 59 },
  { month: 'Mar', newPatients: 25, returning: 72 },
  { month: 'Apr', newPatients: 30, returning: 68 },
  { month: 'May', newPatients: 35, returning: 75 },
  { month: 'Jun', newPatients: 40, returning: 70 },
  { month: 'Jul', newPatients: 38, returning: 80 },
  { month: 'Aug', newPatients: 42, returning: 78 },
  { month: 'Sep', newPatients: 45, returning: 82 },
  { month: 'Oct', newPatients: 48, returning: 85 },
  { month: 'Nov', newPatients: 50, returning: 90 },
  { month: 'Dec', newPatients: 55, returning: 95 }
];

const mockAppointmentData = [
  { month: 'Jan', scheduled: 120, completed: 105, cancelled: 15 },
  { month: 'Feb', scheduled: 135, completed: 118, cancelled: 17 },
  { month: 'Mar', scheduled: 128, completed: 110, cancelled: 18 },
  { month: 'Apr', scheduled: 142, completed: 125, cancelled: 17 },
  { month: 'May', scheduled: 150, completed: 135, cancelled: 15 },
  { month: 'Jun', scheduled: 145, completed: 130, cancelled: 15 },
  { month: 'Jul', scheduled: 160, completed: 145, cancelled: 15 },
  { month: 'Aug', scheduled: 165, completed: 150, cancelled: 15 },
  { month: 'Sep', scheduled: 170, completed: 155, cancelled: 15 },
  { month: 'Oct', scheduled: 175, completed: 160, cancelled: 15 },
  { month: 'Nov', scheduled: 180, completed: 165, cancelled: 15 },
  { month: 'Dec', scheduled: 190, completed: 175, cancelled: 15 }
];

const mockClinicData = [
  { name: 'Main Clinic', patients: 520, revenue: 2500000, appointments: 780 },
  { name: 'Branch 1', patients: 380, revenue: 1800000, appointments: 620 },
  { name: 'Branch 2', patients: 420, revenue: 2100000, appointments: 680 },
  { name: 'Branch 3', patients: 350, revenue: 1700000, appointments: 580 }
];

const mockDentistData = [
  { name: 'Dr. Sharma', patients: 180, revenue: 900000, appointments: 240 },
  { name: 'Dr. Patel', patients: 210, revenue: 1050000, appointments: 280 },
  { name: 'Dr. Singh', patients: 160, revenue: 800000, appointments: 220 },
  { name: 'Dr. Gupta', patients: 190, revenue: 950000, appointments: 260 },
  { name: 'Dr. Verma', patients: 170, revenue: 850000, appointments: 230 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(startOfMonth(new Date()), 6),
    endDate: endOfMonth(new Date())
  });
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [filteredData, setFilteredData] = useState({
    revenue: [],
    treatments: [],
    patients: [],
    appointments: [],
    clinics: [],
    dentists: []
  });
  
  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleStartDateChange = (date) => {
    setDateRange(prev => ({
      ...prev,
      startDate: date
    }));
    setReportGenerated(false);
  };

  const handleEndDateChange = (date) => {
    setDateRange(prev => ({
      ...prev,
      endDate: date
    }));
    setReportGenerated(false);
  };

  const handleClinicChange = (event) => {
    setSelectedClinic(event.target.value);
    setReportGenerated(false);
  };
  
  const handleGenerateReport = () => {
    setLoading(true);
    setError(null);
    
    // Prepare query parameters
    const params = new URLSearchParams();
    if (dateRange.startDate) {
      params.append('startDate', dateRange.startDate.toISOString());
    }
    if (dateRange.endDate) {
      params.append('endDate', dateRange.endDate.toISOString());
    }
    if (selectedClinic !== 'all') {
      params.append('clinicId', selectedClinic);
    }
    
    // Make API call to fetch report data
    fetch(`/api/reports?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // In a real app, we would include authentication token
        // 'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        return response.json();
      })
      .then(data => {
        // In a real app, we would use the data from the API
        // For now, we'll still use our mock data with filtering
        
        // Filter data based on date range and clinic
        const filteredRevenue = filterDataByDateRange(mockRevenueData);
        const filteredPatients = filterDataByDateRange(mockPatientData);
        const filteredAppointments = filterDataByDateRange(mockAppointmentData);
        
        // Filter clinic data if a specific clinic is selected
        const filteredClinics = selectedClinic === 'all' 
          ? mockClinicData 
          : mockClinicData.filter(clinic => clinic.name === selectedClinic);
        
        // Filter dentist data based on clinic if selected
        const filteredDentists = selectedClinic === 'all'
          ? mockDentistData
          : mockDentistData.slice(0, 3); // Simplified mock filtering
        
        setFilteredData({
          revenue: filteredRevenue,
          treatments: mockTreatmentData, // Treatments don't have date info in our mock data
          patients: filteredPatients,
          appointments: filteredAppointments,
          clinics: filteredClinics,
          dentists: filteredDentists
        });
        
        setReportGenerated(true);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error generating report:', err);
        setError('Error generating report: ' + err.message);
        setLoading(false);
      });
  };
  
  const handleExportReport = () => {
    if (!reportGenerated) {
      alert('Please generate a report first');
      return;
    }
    
    // Determine which data to export based on current tab
    let dataToExport;
    let filename;
    
    switch (tabValue) {
      case 0: // Financial
        dataToExport = filteredData.revenue;
        filename = 'financial_report.csv';
        break;
      case 1: // Patients
        dataToExport = filteredData.patients;
        filename = 'patient_report.csv';
        break;
      case 2: // Appointments
        dataToExport = filteredData.appointments;
        filename = 'appointment_report.csv';
        break;
      case 3: // Treatments
        dataToExport = filteredData.treatments;
        filename = 'treatment_report.csv';
        break;
      case 4: // Clinics
        dataToExport = filteredData.clinics;
        filename = 'clinic_report.csv';
        break;
      case 5: // Staff
        dataToExport = filteredData.dentists;
        filename = 'staff_report.csv';
        break;
      default:
        dataToExport = filteredData.revenue;
        filename = 'report.csv';
    }
    
    // Convert data to CSV
    const headers = Object.keys(dataToExport[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...dataToExport.map(row => headers.map(header => row[header]).join(',')) // Data rows
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePrintReport = () => {
    window.print();
  };
  
  const handleRefresh = () => {
    handleGenerateReport();
  };

  const filterDataByDateRange = (data) => {
    // This is a simplified filter for mock data
    // In a real application, you would filter based on actual dates
    if (selectedClinic !== 'all') {
      // If a clinic is selected, return fewer items to simulate filtering
      return data.slice(0, Math.ceil(data.length * 0.7));
    }
    return data;
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalRevenue = mockRevenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalAppointments = mockAppointmentData.reduce((sum, item) => sum + item.scheduled, 0);
    const totalPatients = mockPatientData.reduce((sum, item) => sum + item.newPatients + item.returning, 0);
    const totalTreatments = mockTreatmentData.reduce((sum, item) => sum + item.count, 0);
    
    return {
      totalRevenue,
      totalAppointments,
      totalPatients,
      totalTreatments
    };
  };

  const summary = calculateSummary();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Reports & Analytics
          </Typography>
          
          {reportGenerated && (
            <Box>
              <MuiTooltip title="Export Report">
                <IconButton color="primary" onClick={handleExportReport}>
                  <FileDownloadIcon />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Print Report">
                <IconButton color="primary" onClick={handlePrintReport}>
                  <PrintIcon />
                </IconButton>
              </MuiTooltip>
              <MuiTooltip title="Refresh Data">
                <IconButton color="primary" onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </MuiTooltip>
            </Box>
          )}
        </Box>
        
        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Clinic</InputLabel>
                <Select
                  value={selectedClinic}
                  label="Clinic"
                  onChange={handleClinicChange}
                >
                  <MenuItem value="all">All Clinics</MenuItem>
                  <MenuItem value="main">Main Clinic</MenuItem>
                  <MenuItem value="branch1">Branch 1</MenuItem>
                  <MenuItem value="branch2">Branch 2</MenuItem>
                  <MenuItem value="branch3">Branch 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={handleStartDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={handleEndDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(summary.totalRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Total Appointments
                </Typography>
                <Typography variant="h4">
                  {summary.totalAppointments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Total Patients
                </Typography>
                <Typography variant="h4">
                  {summary.totalPatients}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Total Treatments
                </Typography>
                <Typography variant="h4">
                  {summary.totalTreatments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs for different report types */}
        <Paper sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Financial" />
            <Tab label="Patients" />
            <Tab label="Appointments" />
            <Tab label="Treatments" />
            <Tab label="Clinics" />
            <Tab label="Staff" />
          </Tabs>
          
          <Box sx={{ mt: 3 }}>
            {/* Financial Reports */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Monthly Revenue</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportGenerated ? filteredData.revenue : mockRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `₹${value/1000}K`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Revenue by Treatment</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportGenerated ? filteredData.treatments : mockTreatmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {mockTreatmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Revenue by Clinic</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportGenerated ? filteredData.clinics : mockClinicData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${value/1000}K`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {/* Patient Reports */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Patient Trends</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportGenerated ? filteredData.patients : filterDataByDateRange(mockPatientData)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="newPatients" name="New Patients" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="returning" name="Returning Patients" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Patients by Clinic</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockClinicData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="patients" name="Patients" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Patients by Dentist</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportGenerated ? filteredData.dentists : mockDentistData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="patients" name="Patients" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {/* Appointment Reports */}
            {tabValue === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Appointment Trends</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportGenerated ? filteredData.appointments : filterDataByDateRange(mockAppointmentData)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="scheduled" name="Scheduled" stroke="#8884d8" />
                        <Line type="monotone" dataKey="completed" name="Completed" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ff8042" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Appointments by Clinic</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockClinicData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="appointments" name="Appointments" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Appointments by Dentist</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockDentistData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="appointments" name="Appointments" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {/* Treatment Reports */}
            {tabValue === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Treatments by Count</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportGenerated ? filteredData.treatments : mockTreatmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {mockTreatmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Treatments by Revenue</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockTreatmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${value/1000}K`} />
                        <Tooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(value) : value} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Treatment Details</Typography>
                  <Paper sx={{ p: 2 }}>
                    <List>
                      {mockTreatmentData.map((treatment, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={treatment.name}
                              secondary={`Count: ${treatment.count} | Revenue: ${formatCurrency(treatment.revenue)}`}
                            />
                          </ListItem>
                          {index < mockTreatmentData.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {/* Clinic Reports */}
            {tabValue === 4 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Clinic Performance</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockClinicData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `₹${value/1000}K`} />
                        <Tooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(value) : value} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="patients" name="Patients" fill="#8884d8" />
                        <Bar yAxisId="left" dataKey="appointments" name="Appointments" fill="#82ca9d" />
                        <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Clinic Details</Typography>
                  <Paper sx={{ p: 2 }}>
                    <List>
                      {mockClinicData.map((clinic, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={clinic.name}
                              secondary={`Patients: ${clinic.patients} | Appointments: ${clinic.appointments} | Revenue: ${formatCurrency(clinic.revenue)}`}
                            />
                          </ListItem>
                          {index < mockClinicData.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {/* Staff Reports */}
            {tabValue === 5 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Dentist Performance</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockDentistData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `₹${value/1000}K`} />
                        <Tooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(value) : value} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="patients" name="Patients" fill="#8884d8" />
                        <Bar yAxisId="left" dataKey="appointments" name="Appointments" fill="#82ca9d" />
                        <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Dentist Details</Typography>
                  <Paper sx={{ p: 2 }}>
                    <List>
                      {mockDentistData.map((dentist, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={dentist.name}
                              secondary={`Patients: ${dentist.patients} | Appointments: ${dentist.appointments} | Revenue: ${formatCurrency(dentist.revenue)}`}
                            />
                          </ListItem>
                          {index < mockDentistData.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Reports;