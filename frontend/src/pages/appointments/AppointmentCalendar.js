import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Mock appointment data (replace with API call)
const MOCK_APPOINTMENTS = [
  {
    id: 'APT001',
    title: 'Rahul Sharma - Checkup',
    patientId: '123456',
    patientName: 'Rahul Sharma',
    doctorId: 'DOC001',
    doctorName: 'Dr. Priya Patel',
    clinicId: 1,
    clinicName: 'Dental Care - Bandra',
    start: new Date(2023, 5, 20, 10, 0), // June 20, 2023, 10:00 AM
    end: new Date(2023, 5, 20, 10, 30),  // June 20, 2023, 10:30 AM
    status: 'scheduled',
    type: 'checkup',
  },
  {
    id: 'APT002',
    title: 'Priya Singh - Cleaning',
    patientId: '123457',
    patientName: 'Priya Singh',
    doctorId: 'DOC002',
    doctorName: 'Dr. Rajesh Kumar',
    clinicId: 1,
    clinicName: 'Dental Care - Bandra',
    start: new Date(2023, 5, 20, 11, 0), // June 20, 2023, 11:00 AM
    end: new Date(2023, 5, 20, 12, 0),   // June 20, 2023, 12:00 PM
    status: 'confirmed',
    type: 'cleaning',
  },
  {
    id: 'APT003',
    title: 'Amit Patel - Root Canal',
    patientId: '123458',
    patientName: 'Amit Patel',
    doctorId: 'DOC003',
    doctorName: 'Dr. Ananya Singh',
    clinicId: 2,
    clinicName: 'Dental Care - Andheri',
    start: new Date(2023, 5, 21, 14, 0), // June 21, 2023, 2:00 PM
    end: new Date(2023, 5, 21, 16, 0),   // June 21, 2023, 4:00 PM
    status: 'scheduled',
    type: 'rootcanal',
  },
  {
    id: 'APT004',
    title: 'Neha Gupta - Consultation',
    patientId: '123459',
    patientName: 'Neha Gupta',
    doctorId: 'DOC004',
    doctorName: 'Dr. Suresh Verma',
    clinicId: 3,
    clinicName: 'Dental Care - Powai',
    start: new Date(2023, 5, 22, 9, 0),  // June 22, 2023, 9:00 AM
    end: new Date(2023, 5, 22, 9, 30),   // June 22, 2023, 9:30 AM
    status: 'completed',
    type: 'consultation',
  },
  {
    id: 'APT005',
    title: 'Vikram Mehta - Braces Adjustment',
    patientId: '123460',
    patientName: 'Vikram Mehta',
    doctorId: 'DOC002',
    doctorName: 'Dr. Rajesh Kumar',
    clinicId: 4,
    clinicName: 'Dental Care - Juhu',
    start: new Date(2023, 5, 23, 13, 0), // June 23, 2023, 1:00 PM
    end: new Date(2023, 5, 23, 14, 0),   // June 23, 2023, 2:00 PM
    status: 'confirmed',
    type: 'braces',
  },
  {
    id: 'APT006',
    title: 'Rahul Sharma - Filling',
    patientId: '123456',
    patientName: 'Rahul Sharma',
    doctorId: 'DOC001',
    doctorName: 'Dr. Priya Patel',
    clinicId: 1,
    clinicName: 'Dental Care - Bandra',
    start: new Date(2023, 5, 25, 15, 0), // June 25, 2023, 3:00 PM
    end: new Date(2023, 5, 25, 16, 0),   // June 25, 2023, 4:00 PM
    status: 'scheduled',
    type: 'filling',
  },
  {
    id: 'APT007',
    title: 'Priya Singh - Checkup',
    patientId: '123457',
    patientName: 'Priya Singh',
    doctorId: 'DOC005',
    doctorName: 'Dr. Meera Reddy',
    clinicId: 2,
    clinicName: 'Dental Care - Andheri',
    start: new Date(2023, 5, 26, 10, 30), // June 26, 2023, 10:30 AM
    end: new Date(2023, 5, 26, 11, 0),    // June 26, 2023, 11:00 AM
    status: 'scheduled',
    type: 'checkup',
  },
  {
    id: 'APT008',
    title: 'Amit Patel - Crown Fitting',
    patientId: '123458',
    patientName: 'Amit Patel',
    doctorId: 'DOC003',
    doctorName: 'Dr. Ananya Singh',
    clinicId: 3,
    clinicName: 'Dental Care - Powai',
    start: new Date(2023, 5, 27, 12, 0), // June 27, 2023, 12:00 PM
    end: new Date(2023, 5, 27, 13, 30),  // June 27, 2023, 1:30 PM
    status: 'confirmed',
    type: 'crown',
  },
  {
    id: 'APT009',
    title: 'Neha Gupta - Extraction',
    patientId: '123459',
    patientName: 'Neha Gupta',
    doctorId: 'DOC004',
    doctorName: 'Dr. Suresh Verma',
    clinicId: 4,
    clinicName: 'Dental Care - Juhu',
    start: new Date(2023, 5, 28, 16, 0), // June 28, 2023, 4:00 PM
    end: new Date(2023, 5, 28, 17, 0),   // June 28, 2023, 5:00 PM
    status: 'cancelled',
    type: 'extraction',
  },
  {
    id: 'APT010',
    title: 'Vikram Mehta - Emergency',
    patientId: '123460',
    patientName: 'Vikram Mehta',
    doctorId: 'DOC001',
    doctorName: 'Dr. Priya Patel',
    clinicId: 1,
    clinicName: 'Dental Care - Bandra',
    start: new Date(2023, 5, 29, 9, 0),  // June 29, 2023, 9:00 AM
    end: new Date(2023, 5, 29, 10, 0),   // June 29, 2023, 10:00 AM
    status: 'completed',
    type: 'emergency',
  },
];

// Mock clinics data
const MOCK_CLINICS = [
  { id: 1, name: 'Dental Care - Bandra' },
  { id: 2, name: 'Dental Care - Andheri' },
  { id: 3, name: 'Dental Care - Powai' },
  { id: 4, name: 'Dental Care - Juhu' },
];

// Mock doctors data
const MOCK_DOCTORS = [
  { id: 'DOC001', name: 'Dr. Priya Patel' },
  { id: 'DOC002', name: 'Dr. Rajesh Kumar' },
  { id: 'DOC003', name: 'Dr. Ananya Singh' },
  { id: 'DOC004', name: 'Dr. Suresh Verma' },
  { id: 'DOC005', name: 'Dr. Meera Reddy' },
];

const AppointmentCalendar = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    clinicId: '',
    doctorId: '',
    status: '',
  });
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');

  // Appointment statuses for filtering
  const APPOINTMENT_STATUSES = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' },
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, this would be an API call
      // const response = await axios.get('/api/appointments');
      // setAppointments(response.data);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock data
      setAppointments(MOCK_APPOINTMENTS);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  // Handle event dialog close
  const handleEventDialogClose = () => {
    setEventDialogOpen(false);
    setSelectedEvent(null);
  };

  // Handle view appointment details
  const handleViewAppointment = () => {
    if (selectedEvent) {
      navigate(`/appointments/${selectedEvent.id}`);
    }
    handleEventDialogClose();
  };

  // Handle edit appointment
  const handleEditAppointment = () => {
    if (selectedEvent) {
      navigate(`/appointments/edit/${selectedEvent.id}`);
    }
    handleEventDialogClose();
  };

  // Handle filter dialog open
  const handleFilterDialogOpen = () => {
    setFilterDialogOpen(true);
  };

  // Handle filter dialog close
  const handleFilterDialogClose = () => {
    setFilterDialogOpen(false);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    handleFilterDialogClose();
    // In a real app, this would trigger a new API call with filters
    // For now, we'll just filter the mock data
    fetchFilteredAppointments();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      clinicId: '',
      doctorId: '',
      status: '',
    });
  };

  // Fetch filtered appointments
  const fetchFilteredAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, this would be an API call with filter parameters
      // const response = await axios.get('/api/appointments', { params: filters });
      // setAppointments(response.data);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock data
      let filteredAppointments = [...MOCK_APPOINTMENTS];
      
      if (filters.clinicId) {
        filteredAppointments = filteredAppointments.filter(
          appointment => appointment.clinicId === parseInt(filters.clinicId, 10)
        );
      }
      
      if (filters.doctorId) {
        filteredAppointments = filteredAppointments.filter(
          appointment => appointment.doctorId === filters.doctorId
        );
      }
      
      if (filters.status) {
        filteredAppointments = filteredAppointments.filter(
          appointment => appointment.status === filters.status
        );
      }
      
      setAppointments(filteredAppointments);
      
      // Show toast if filters are applied
      if (filters.clinicId || filters.doctorId || filters.status) {
        toast.info('Filters applied successfully');
      }
    } catch (err) {
      console.error('Error fetching filtered appointments:', err);
      setError('Failed to apply filters. Please try again.');
      toast.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation to previous period
  const handleNavigatePrev = () => {
    const newDate = new Date(date);
    if (view === 'month') {
      newDate.setMonth(date.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(date.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(date.getDate() - 1);
    }
    setDate(newDate);
  };

  // Handle navigation to next period
  const handleNavigateNext = () => {
    const newDate = new Date(date);
    if (view === 'month') {
      newDate.setMonth(date.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(date.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(date.getDate() + 1);
    }
    setDate(newDate);
  };

  // Handle navigation to today
  const handleNavigateToday = () => {
    setDate(new Date());
  };

  // Handle view change
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Get event style based on status
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad'; // default
    let borderColor = '#2c6599';
    
    switch (event.status) {
      case 'scheduled':
        backgroundColor = '#3f51b5'; // indigo
        borderColor = '#303f9f';
        break;
      case 'confirmed':
        backgroundColor = '#2196f3'; // blue
        borderColor = '#1976d2';
        break;
      case 'completed':
        backgroundColor = '#4caf50'; // green
        borderColor = '#388e3c';
        break;
      case 'cancelled':
        backgroundColor = '#f44336'; // red
        borderColor = '#d32f2f';
        break;
      case 'no-show':
        backgroundColor = '#ff9800'; // orange
        borderColor = '#f57c00';
        break;
      default:
        break;
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '1px solid ' + borderColor,
        display: 'block',
      },
    };
  };

  // Format date for display
  const formatDate = (date) => {
    return moment(date).format('MMMM YYYY');
  };

  // Custom toolbar component
  const CustomToolbar = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleNavigatePrev}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNavigateToday}>
            <TodayIcon />
          </IconButton>
          <IconButton onClick={handleNavigateNext}>
            <ChevronRightIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {formatDate(date)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant={view === 'month' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleViewChange('month')}
            sx={{ mr: 1 }}
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleViewChange('week')}
            sx={{ mr: 1 }}
          >
            Week
          </Button>
          <Button
            variant={view === 'day' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleViewChange('day')}
            sx={{ mr: 1 }}
          >
            Day
          </Button>
          <Button
            variant={view === 'agenda' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleViewChange('agenda')}
          >
            Agenda
          </Button>
        </Box>
      </Box>
    );
  };

  if (loading && appointments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Appointment Calendar
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleFilterDialogOpen}
              sx={{ mr: 2 }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<ViewListIcon />}
              onClick={() => navigate('/appointments')}
              sx={{ mr: 2 }}
            >
              List View
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAppointments}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/appointments/add')}
            >
              Add Appointment
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <CustomToolbar />
          <Box sx={{ height: 700 }}>
            <Calendar
              localizer={localizer}
              events={appointments}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleEventClick}
              eventPropGetter={eventStyleGetter}
              date={date}
              onNavigate={setDate}
              view={view}
              onView={setView}
              popup
              tooltipAccessor={(event) => `${event.patientName} - ${event.doctorName} - ${event.clinicName}`}
              components={{
                toolbar: () => null, // We're using our custom toolbar
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Event Details Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={handleEventDialogClose}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              Appointment Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6">{selectedEvent.patientName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {moment(selectedEvent.start).format('dddd, MMMM D, YYYY')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Doctor:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.doctorName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Clinic:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.clinicName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Type:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Status:
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEventDialogClose}>
                Close
              </Button>
              <Button onClick={handleEditAppointment} color="primary">
                Edit
              </Button>
              <Button onClick={handleViewAppointment} color="primary" variant="contained">
                View Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={handleFilterDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Appointments</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="clinic-filter-label">Clinic</InputLabel>
                <Select
                  labelId="clinic-filter-label"
                  id="clinicId"
                  name="clinicId"
                  value={filters.clinicId}
                  onChange={handleFilterChange}
                  label="Clinic"
                >
                  <MenuItem value="">All Clinics</MenuItem>
                  {MOCK_CLINICS.map((clinic) => (
                    <MenuItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="doctor-filter-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-filter-label"
                  id="doctorId"
                  name="doctorId"
                  value={filters.doctorId}
                  onChange={handleFilterChange}
                  label="Doctor"
                >
                  <MenuItem value="">All Doctors</MenuItem>
                  {MOCK_DOCTORS.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {APPOINTMENT_STATUSES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters} color="inherit">
            Reset
          </Button>
          <Button onClick={handleFilterDialogClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={applyFilters} color="primary" variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentCalendar;