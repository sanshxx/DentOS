import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';

// Import axios for API calls
import axios from 'axios';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Appointment types for filtering
const APPOINTMENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'checkup', label: 'Checkup' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'emergency', label: 'Emergency' },
];

// Appointment statuses
const APPOINTMENT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

// Note: The following code was removed as it was causing a reference error
// and the statuses are already included in the APPOINTMENT_STATUSES array
// APPOINTMENT_STATUSES.push(
//   { value: 'cancelled', label: 'Cancelled' },
//   { value: 'no-show', label: 'No Show' }
// );


const AppointmentList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters for filtering
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        if (filterType !== 'all') queryParams.append('type', filterType);
        if (filterStatus !== 'all') queryParams.append('status', filterStatus);
        queryParams.append('page', page + 1); // API uses 1-indexed pages
        queryParams.append('limit', rowsPerPage);

        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Fetch appointments from API
        const response = await axios.get(`${API_URL}/appointments?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Format the response data
        const formattedAppointments = response.data.data.map(appointment => ({
          id: appointment._id,
          patientId: appointment.patient?._id || '',
          patientName: appointment.patient?.name || 'Unknown Patient',
          patientPhone: appointment.patient?.phone || '',
          doctorId: appointment.dentist?._id || '',
          doctorName: appointment.dentist ? `${appointment.dentist.firstName} ${appointment.dentist.lastName}` : 'Unknown Doctor',
          clinicId: appointment.clinic?._id || '',
          clinicName: appointment.clinic?.name || 'Unknown Clinic',
          date: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
          startTime: appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
          endTime: appointment.endTime ? new Date(appointment.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
          status: appointment.status || 'scheduled',
          type: appointment.appointmentType || 'checkup',
          notes: appointment.notes || '',
          createdAt: appointment.createdAt || new Date().toISOString()
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

    fetchAppointments();
  }, [page, rowsPerPage, searchTerm, filterType, filterStatus]);

  // Handle delete dialog open
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  // Handle delete appointment
  const handleDeleteAppointment = async () => {
    try {
      setDeletingAppointment(true);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Delete appointment via API
      await axios.delete(`${API_URL}/appointments/${selectedAppointment.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state
      setAppointments(appointments.filter(appointment => appointment.id !== selectedAppointment.id));
      toast.success('Appointment deleted successfully');
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast.error(err.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setDeletingAppointment(false);
      handleDeleteDialogClose();
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter type change
  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  // Handle filter status change
  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  // Filter appointments based on search term and filters
  const filteredAppointments = appointments.filter(appointment => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = (
      appointment.patientName.toLowerCase().includes(searchString) ||
      appointment.doctorName.toLowerCase().includes(searchString) ||
      appointment.patientPhone.includes(searchString) ||
      appointment.id.toLowerCase().includes(searchString)
    );

    const matchesType = filterType === 'all' || appointment.type === filterType;
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <EventIcon fontSize="small" />;
      case 'confirmed':
        return <CheckCircleIcon fontSize="small" />;
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      case 'no-show':
        return <AccessTimeIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Appointments
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/appointments/add"
              sx={{ mr: 2 }}
            >
              New Appointment
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EventIcon />}
              component={RouterLink}
              to="/appointments/calendar"
            >
              Calendar View
            </Button>
          </Box>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              placeholder="Search appointments..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', sm: '40%' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="appointment-type-label">Type</InputLabel>
                <Select
                  labelId="appointment-type-label"
                  id="appointment-type"
                  value={filterType}
                  label="Type"
                  onChange={handleFilterTypeChange}
                >
                  {APPOINTMENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="appointment-status-label">Status</InputLabel>
                <Select
                  labelId="appointment-status-label"
                  id="appointment-status"
                  value={filterStatus}
                  label="Status"
                  onChange={handleFilterStatusChange}
                >
                  {APPOINTMENT_STATUSES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Clinic</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>{appointment.id}</TableCell>
                      <TableCell>
                        <Box sx={{ fontWeight: 'medium' }}>
                          {appointment.patientName}
                        </Box>
                        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          +91 {appointment.patientPhone}
                        </Box>
                      </TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>{formatDate(appointment.date)}</TableCell>
                      <TableCell>
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(appointment.status)}
                          label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          size="small"
                          color={getStatusChipColor(appointment.status)}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>{appointment.clinicName}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredAppointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No appointments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredAppointments.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      </Box>



      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the appointment for {selectedAppointment?.patientName} on {selectedAppointment ? formatDate(selectedAppointment.date) : ''} at {selectedAppointment ? formatTime(selectedAppointment.startTime) : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={deletingAppointment}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAppointment}
            color="error"
            disabled={deletingAppointment}
            startIcon={deletingAppointment && <CircularProgress size={20} />}
          >
            {deletingAppointment ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentList;