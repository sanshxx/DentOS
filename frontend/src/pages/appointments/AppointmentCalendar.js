import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);





const AppointmentCalendar = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
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
    fetchClinics();
    fetchDoctors();
  }, []);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Real API call
      const response = await axios.get(`${API_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = response.data.data;
      
      // Format appointments for calendar
      const formattedAppointments = data.map(appointment => ({
        id: appointment._id,
        title: `${appointment.patient?.name || 'Unknown'} - ${appointment.appointmentType || 'Consultation'}`,
        patientId: appointment.patient?._id,
        patientName: appointment.patient?.name || 'Unknown',
        doctorId: appointment.dentist?._id,
        doctorName: `${appointment.dentist?.firstName || ''} ${appointment.dentist?.lastName || ''}`.trim() || 'Unknown',
        clinicId: appointment.clinic?._id,
        clinicName: appointment.clinic?.name || 'Unknown',
        start: new Date(appointment.appointmentDate),
        end: new Date(new Date(appointment.appointmentDate).getTime() + (appointment.duration || 30) * 60000),
        status: appointment.status,
        type: appointment.appointmentType
      }));
      
      setAppointments(formattedAppointments);
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
  
  // Fetch clinics
  const fetchClinics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/clinics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setClinics(response.data.data);
    } catch (err) {
      console.error('Error fetching clinics:', err);
      toast.error('Failed to load clinics');
    }
  };
  
  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Filter to only show dentists
      const dentists = response.data.data.filter(staff => staff.role === 'dentist');
      setDoctors(dentists);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      toast.error('Failed to load doctors');
    }
  };

  // Apply filters
  const applyFilters = () => {
    handleFilterDialogClose();
    // Trigger a new API call with filters
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

      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      
      if (filters.clinicId) {
        queryParams.append('clinic', filters.clinicId);
      }
      
      if (filters.doctorId) {
        queryParams.append('dentist', filters.doctorId);
      }
      
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Make API call with filter parameters
      const url = `${API_URL}/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = response.data.data;
      
      // Format appointments for calendar
      const formattedAppointments = data.map(appointment => ({
        id: appointment._id,
        title: `${appointment.patient?.name || 'Unknown'} - ${appointment.appointmentType || 'Consultation'}`,
        patientId: appointment.patient?._id,
        patientName: appointment.patient?.name || 'Unknown',
        doctorId: appointment.dentist?._id,
        doctorName: `${appointment.dentist?.firstName || ''} ${appointment.dentist?.lastName || ''}`.trim() || 'Unknown',
        clinicId: appointment.clinic?._id,
        clinicName: appointment.clinic?.name || 'Unknown',
        start: new Date(appointment.appointmentDate),
        end: new Date(new Date(appointment.appointmentDate).getTime() + (appointment.duration || 30) * 60000),
        status: appointment.status,
        type: appointment.appointmentType
      }));
      
      setAppointments(formattedAppointments);
      
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
                  {clinics.map((clinic) => (
                    <MenuItem key={clinic._id} value={clinic._id}>
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
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor._id} value={doctor._id}>
                      {`${doctor.firstName} ${doctor.lastName}`}
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