import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Notes as NotesIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Static appointment status options

// Appointment statuses
const APPOINTMENT_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Make API call
        const response = await axios.get(`${API_URL}/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const appointmentData = response.data.data;
        // Format the appointment data to match the expected structure
        const formattedAppointment = {
          id: appointmentData._id,
          patientId: appointmentData.patient?._id || '',
          patientName: appointmentData.patient?.name || 'Unknown Patient',
          patientPhone: appointmentData.patient?.phone || '',
          patientEmail: appointmentData.patient?.email || 'No email available',
          doctorId: appointmentData.dentist?._id || '',
          doctorName: appointmentData.dentist ? `${appointmentData.dentist.firstName} ${appointmentData.dentist.lastName}` : 'Unknown Doctor',
          doctorSpecialization: appointmentData.dentist?.specialization || 'General Dentistry',
          clinicId: appointmentData.clinic?._id || '',
          clinicName: appointmentData.clinic?.name || 'Unknown Clinic',
          clinicAddress: (() => {
            if (!appointmentData.clinic?.address) return '';
            if (typeof appointmentData.clinic.address === 'string') {
              return appointmentData.clinic.address;
            }
            if (typeof appointmentData.clinic.address === 'object') {
              const addressParts = [
                appointmentData.clinic.address.street,
                appointmentData.clinic.address.city,
                appointmentData.clinic.address.state,
                appointmentData.clinic.address.pincode
              ].filter(part => part && part.trim());
              return addressParts.join(', ');
            }
            return '';
          })(),
          date: appointmentData.appointmentDate ? new Date(appointmentData.appointmentDate).toISOString().split('T')[0] : '',
          startTime: appointmentData.appointmentDate ? new Date(appointmentData.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
          endTime: appointmentData.endTime ? new Date(appointmentData.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
          duration: appointmentData.duration || 30,
          status: appointmentData.status || 'scheduled',
          type: appointmentData.appointmentType || 'checkup',
          notes: appointmentData.notes || '',
          reasonForVisit: appointmentData.reasonForVisit || '',
          createdAt: appointmentData.createdAt || new Date().toISOString(),
          updatedAt: appointmentData.updatedAt || new Date().toISOString()
        };
        setAppointment(formattedAppointment);
        setNewStatus(formattedAppointment.status);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details. Please try again.');
        toast.error('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

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
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API call
      await axios.delete(`${API_URL}/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Appointment deleted successfully');
      navigate('/appointments');
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast.error(err.response?.data?.message || 'Failed to delete appointment');
      setDeletingAppointment(false);
      handleDeleteDialogClose();
    }
  };

  // Handle edit status
  const handleEditStatus = () => {
    setEditingStatus(true);
  };

  // Handle status change
  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  // Handle save status
  const handleSaveStatus = async () => {
    try {
      setUpdatingStatus(true);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API call
      await axios.patch(`/api/appointments/${id}`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state
      setAppointment({ ...appointment, status: newStatus });
      setEditingStatus(false);
      toast.success('Appointment status updated successfully');
    } catch (err) {
      console.error('Error updating appointment status:', err);
      toast.error(err.response?.data?.message || 'Failed to update appointment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle cancel edit status
  const handleCancelEditStatus = () => {
    setNewStatus(appointment.status);
    setEditingStatus(false);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
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

  // Format appointment type
  const formatAppointmentType = (type) => {
    if (!type) return 'N/A';
    return type.charAt(0).toUpperCase() + type.slice(1);
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
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/appointments')}
          >
            Back to Appointments
          </Button>
        </Box>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Appointment not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/appointments')}
          >
            Back to Appointments
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/appointments')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              Appointment Details
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/appointments/${id}/edit`)}
              sx={{ mr: 2 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteDialogOpen}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h2">
                  {appointment.patientName}
                </Typography>
                <Typography variant="subtitle1">
                  Appointment ID: {appointment.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                {editingStatus ? (
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 1 }}>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        id="status"
                        value={newStatus}
                        onChange={handleStatusChange}
                        label="Status"
                        disabled={updatingStatus}
                      >
                        {APPOINTMENT_STATUSES.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton
                      color="inherit"
                      onClick={handleSaveStatus}
                      disabled={updatingStatus}
                      sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
                    >
                      {updatingStatus ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                    </IconButton>
                    <IconButton
                      color="inherit"
                      onClick={handleCancelEditStatus}
                      disabled={updatingStatus}
                      sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      color={getStatusChipColor(appointment.status)}
                      sx={{ color: 'white', fontWeight: 'medium', bgcolor: 'rgba(255, 255, 255, 0.2)' }}
                    />
                    <IconButton
                      color="inherit"
                      onClick={handleEditStatus}
                      size="small"
                      sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Date and Time */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon sx={{ mr: 1 }} /> Date & Time
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Date:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(appointment.date)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Time:
                        </Typography>
                        <Typography variant="body1">
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Duration:
                        </Typography>
                        <Typography variant="body1">
                          {appointment.duration} minutes
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Type:
                        </Typography>
                        <Typography variant="body1">
                          {formatAppointmentType(appointment.type)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Patient Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1 }} /> Patient Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Name:
                        </Typography>
                        <Typography variant="body1">
                          {appointment.patientName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Phone:
                        </Typography>
                        <Typography variant="body1">
                          +91 {appointment.patientPhone}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Email:
                        </Typography>
                        <Typography variant="body1">
                          {appointment.patientEmail}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/patients/${appointment.patientId}`)}
                        >
                          View Patient Profile
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Doctor and Clinic */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon sx={{ mr: 1 }} /> Clinic & Doctor
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Clinic:
                        </Typography>
                        <Typography variant="body1">
                          {appointment.clinicName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Address:
                        </Typography>
                        <Typography variant="body1">
                          {appointment.clinicAddress}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Doctor:
                        </Typography>
                        <Typography variant="body1">
                          {appointment.doctorName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Specialization:
                        </Typography>
                        <Typography variant="body1">
                          {appointment.doctorSpecialization}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notes */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <NotesIcon sx={{ mr: 1 }} /> Notes & Additional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Notes:
                        </Typography>
                        <Typography variant="body1">
                          {appointment.notes || 'No notes available'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Created:
                        </Typography>
                        <Typography variant="body1">
                          {new Date(appointment.createdAt).toLocaleString('en-IN')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Last Updated:
                        </Typography>
                        <Typography variant="body1">
                          {new Date(appointment.updatedAt).toLocaleString('en-IN')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
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
            Are you sure you want to delete the appointment for {appointment.patientName} on {formatDate(appointment.date)} at {formatTime(appointment.startTime)}? This action cannot be undone.
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

export default AppointmentDetails;