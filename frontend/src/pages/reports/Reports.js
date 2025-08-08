import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
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

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for report data
  const [revenueData, setRevenueData] = useState([]);
  const [treatmentData, setTreatmentData] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [clinicData, setClinicData] = useState([]);
  const [dentistData, setDentistData] = useState([]);
  
  // State for clinics
  const [clinics, setClinics] = useState([]);
  const [clinicsLoading, setClinicsLoading] = useState(false);
  
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
    fetchReportData();
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
        dataToExport = [];
        filename = 'report.csv';
    }
    
    // Convert data to CSV
    const csvContent = convertToCSV(dataToExport);
    
    // Create a download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const convertToCSV = (objArray) => {
    if (objArray.length === 0) return '';
    
    const header = Object.keys(objArray[0]).join(',') + '\n';
    const rows = objArray.map(obj => {
      return Object.values(obj).map(value => {
        // Handle values with commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
    }).join('\n');
    
    return header + rows;
  };
  
  const handlePrintReport = () => {
    if (!reportGenerated) {
      alert('Please generate a report first');
      return;
    }
    window.print();
  };
  
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Format date range for API request
      const startDate = format(dateRange.startDate, 'yyyy-MM-dd');
      const endDate = format(dateRange.endDate, 'yyyy-MM-dd');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch reports data from API
      const response = await axios.get(`${API_URL}/reports`, {
        params: { startDate, endDate, clinicId: selectedClinic !== 'all' ? selectedClinic : undefined },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = response.data.data;
      
      // Update state with fetched data
      if (data.revenue) setRevenueData(data.revenue);
      if (data.treatments) setTreatmentData(data.treatments);
      if (data.patients) setPatientData(data.patients);
      if (data.appointments) setAppointmentData(data.appointments);
      if (data.clinics) setClinicData(data.clinics);
      if (data.dentists) setDentistData(data.dentists);
      
      // Update filtered data
      setFilteredData({
        revenue: data.revenue || [],
        treatments: data.treatments || [],
        patients: data.patients || [],
        appointments: data.appointments || [],
        clinics: data.clinics || [],
        dentists: data.dentists || []
      });
      
      setReportGenerated(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.response?.data?.message || 'Failed to load report data');
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchReportData();
  };
  
  // Fetch clinics for dropdown
  const fetchClinics = async () => {
    setClinicsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/clinics`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setClinics(response.data.data || []);
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError('Failed to load clinics');
    } finally {
      setClinicsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchClinics();
  }, []);
  
  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  // Filtering is now handled by the backend API

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalRevenue = filteredData.revenue.reduce((sum, item) => sum + item.revenue, 0);
    const totalAppointments = filteredData.appointments.reduce((sum, item) => sum + item.scheduled, 0);
    const totalPatients = filteredData.patients.reduce((sum, item) => sum + (item.newPatients + item.returning), 0);
    const totalTreatments = filteredData.treatments.reduce((sum, item) => sum + item.count, 0);
    
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
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Clinic</InputLabel>
              <Select
                value={selectedClinic}
                label="Clinic"
                onChange={handleClinicChange}
                disabled={clinicsLoading}
              >
                <MenuItem value="all">All Clinics</MenuItem>
                {clinics.map((clinic) => (
                  <MenuItem key={clinic._id} value={clinic._id}>
                    {clinic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={handleStartDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={handleEndDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {reportGenerated && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
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
                      <Typography color="textSecondary" gutterBottom>
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
                      <Typography color="textSecondary" gutterBottom>
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
                      <Typography color="textSecondary" gutterBottom>
                        Total Treatments
                      </Typography>
                      <Typography variant="h4">
                        {summary.totalTreatments}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          <Box>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Financial" />
              <Tab label="Patients" />
              <Tab label="Appointments" />
              <Tab label="Treatments" />
              <Tab label="Clinics" />
              <Tab label="Staff" />
            </Tabs>
            
            {/* Financial Reports */}
            {tabValue === 0 && (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Revenue Trend</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportGenerated ? filteredData.revenue : []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `₹${value/1000}K`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Revenue by Clinic</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportGenerated ? filteredData.clinics : []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {(reportGenerated ? filteredData.clinics : []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Revenue by Treatment</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportGenerated ? filteredData.treatments : []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {(reportGenerated ? filteredData.treatments : []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {/* Patient Reports */}
            {tabValue === 1 && (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Patient Trend</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportGenerated ? filteredData.patients : []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="newPatients" name="New Patients" stroke="#8884d8" />
                        <Line type="monotone" dataKey="returning" name="Returning Patients" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Patients by Clinic</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportGenerated ? filteredData.clinics : []}>
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
                  <Typography variant="h6" gutterBottom>New vs Returning Patients</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'New Patients', value: reportGenerated ? filteredData.patients.reduce((sum, item) => sum + item.newPatients, 0) : 0 },
                            { name: 'Returning Patients', value: reportGenerated ? filteredData.patients.reduce((sum, item) => sum + item.returning, 0) : 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#8884d8" />
                          <Cell fill="#82ca9d" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {/* Appointment Reports */}
            {tabValue === 2 && (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Appointment Trend</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportGenerated ? filteredData.appointments : []}>
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
                  <Typography variant="h6" gutterBottom>Revenue by Clinic</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportGenerated ? filteredData.clinics : []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Appointment Status</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Scheduled', value: reportGenerated ? filteredData.appointments.reduce((sum, item) => sum + item.scheduled, 0) : 0 },
                            { name: 'Completed', value: reportGenerated ? filteredData.appointments.reduce((sum, item) => sum + item.completed, 0) : 0 },
                            { name: 'Cancelled', value: reportGenerated ? filteredData.appointments.reduce((sum, item) => sum + item.cancelled, 0) : 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#8884d8" />
                          <Cell fill="#82ca9d" />
                          <Cell fill="#ff8042" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {/* Treatment Reports */}
            {tabValue === 3 && (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Treatment Distribution</Typography>
                  <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportGenerated ? filteredData.treatments : []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Treatment Details</Typography>
                  <Paper sx={{ p: 2 }}>
                    <List>
                      {(reportGenerated ? filteredData.treatments : []).map((treatment, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={treatment.name}
                              secondary={`Count: ${treatment.count} appointments`}
                            />
                          </ListItem>
                          {index < (reportGenerated ? filteredData.treatments.length : 0) - 1 && <Divider />}
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
                      <BarChart data={reportGenerated ? filteredData.clinics : []}>
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
                      {(reportGenerated ? filteredData.clinics : []).map((clinic, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={clinic.name}
                              secondary={`Patients: ${clinic.patients} | Appointments: ${clinic.appointments} | Revenue: ${formatCurrency(clinic.revenue)}`}
                            />
                          </ListItem>
                          {index < (reportGenerated ? filteredData.clinics.length : 0) - 1 && <Divider />}
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
                      <BarChart data={reportGenerated ? filteredData.dentists : []}>
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
                      {(reportGenerated ? filteredData.dentists : []).map((dentist, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={dentist.name}
                              secondary={`Patients: ${dentist.patients} | Appointments: ${dentist.appointments} | Revenue: ${formatCurrency(dentist.revenue)}`}
                            />
                          </ListItem>
                          {index < (reportGenerated ? filteredData.dentists.length : 0) - 1 && <Divider />}
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