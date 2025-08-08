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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { format, addMinutes, parse } from 'date-fns';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// These are static data, not from API

// Appointment types
const APPOINTMENT_TYPES = [
  { value: 'New Consultation', label: 'New Consultation' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'Filling', label: 'Filling' },
  { value: 'Root Canal', label: 'Root Canal' },
  { value: 'Extraction', label: 'Extraction' },
  { value: 'Crown/Bridge Work', label: 'Crown/Bridge Work' },
  { value: 'Implant', label: 'Implant' },
  { value: 'Orthodontic Adjustment', label: 'Orthodontic Adjustment' },
  { value: 'Denture Fitting', label: 'Denture Fitting' },
  { value: 'Surgical Procedure', label: 'Surgical Procedure' },
  { value: 'Other', label: 'Other' },
];

// Appointment durations
const APPOINTMENT_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1 hour 30 minutes' },
  { value: 120, label: '2 hours' },
];

// Appointment statuses
const APPOINTMENT_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

// Validation schema
const validationSchema = Yup.object({
  patientId: Yup.string().required('Patient is required'),
  doctorId: Yup.string().required('Doctor is required'),
  clinicId: Yup.string().required('Clinic is required'),
  date: Yup.date().required('Date is required'),
  startTime: Yup.string().required('Start time is required'),
  duration: Yup.number().required('Duration is required'),
  type: Yup.string().required('Appointment type is required'),
  status: Yup.string().required('Status is required'),
  reasonForVisit: Yup.string().required('Reason for visit is required'),
  notes: Yup.string(),
});

const EditAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log('EditAppointment: ID from params:', id);
  
  const [appointment, setAppointment] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch data if we have an ID
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('Appointment ID is required');
        }

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Make API calls to get all required data
        const [appointmentResponse, patientsResponse, doctorsResponse, clinicsResponse] = await Promise.all([
          axios.get(`${API_URL}/appointments/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/patients`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/staff`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/clinics`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        const appointmentData = appointmentResponse.data.data;
        const doctorsData = doctorsResponse.data.data.filter(staff => staff.role === 'dentist');
        
        // Format appointment data for the form
        const appointmentDate = appointmentData.appointmentDate ? new Date(appointmentData.appointmentDate) : null;
        const startTimeString = appointmentDate ? format(appointmentDate, 'HH:mm') : '';
        
        const formattedAppointment = {
          id: appointmentData._id,
          patientId: appointmentData.patient?._id || '',
          doctorId: appointmentData.dentist?._id || '',
          clinicId: appointmentData.clinic?._id || '',
          date: appointmentDate,
          startTime: startTimeString,
          duration: appointmentData.duration || 30,
          type: appointmentData.appointmentType || '',
          status: appointmentData.status || 'scheduled',
          notes: appointmentData.notes || '',
          reasonForVisit: appointmentData.reasonForVisit || ''
        };
        
        setAppointment(formattedAppointment);
        setPatients(patientsResponse.data.data || []);
        setDoctors(doctorsData);
        setClinics(clinicsResponse.data.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load appointment data. Please try again.');
        toast.error(err.response?.data?.message || 'Failed to load appointment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  
  // Add fallback for missing ID
  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Invalid appointment ID</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/appointments')}
          sx={{ mt: 2 }}
        >
          Back to Appointments
        </Button>
      </Container>
    );
  }

  // Calculate end time based on start time and duration (for display only)
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return '';
    
    try {
      // Parse the start time string to a Date object
      const today = new Date();
      const [hours, minutes] = startTime.split(':');
      const startDate = new Date(today.setHours(parseInt(hours, 10), parseInt(minutes, 10)));
      
      // Add the duration to get the end time
      const endDate = addMinutes(startDate, duration);
      
      // Format the end time back to a string
      return format(endDate, 'HH:mm');
    } catch (error) {
      console.error('Error calculating end time:', error);
      return '';
    }
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting: formikSetSubmitting }) => {
    try {
      setSubmitting(true);
      setError(null);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Format date and times
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      const formattedStartTime = values.startTime; // startTime is already in HH:mm format
      
      // Combine date and time into a single datetime
      const appointmentDateTime = new Date(`${formattedDate}T${formattedStartTime}`);

      // Prepare data for API call
      const appointmentData = {
        patient: values.patientId,
        clinic: values.clinicId,
        dentist: values.doctorId,
        appointmentDate: appointmentDateTime,
        duration: values.duration,
        appointmentType: values.type,
        reasonForVisit: values.reasonForVisit,
        notes: values.notes || '',
        status: values.status
      };

      console.log('🔍 Frontend sending appointment data:', appointmentData);

      // Make API call to update appointment
      const response = await axios.put(`${API_URL}/appointments/${id}`, appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Backend response:', response.data);

      toast.success('Appointment updated successfully');
      navigate(`/appointments/${id}`);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to update appointment');
      formikSetSubmitting(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading appointment data...
        </Typography>
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

  if (!appointment || !appointment.id) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Appointment not found or data not loaded</Alert>
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

  // Parse date string to Date object for the date picker
  const initialDate = appointment.date ? new Date(appointment.date) : null;

  // Parse time string to Date object for the time picker
  const parseTimeStringToDate = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return null;
    try {
      const [hours, minutes] = timeString.split(':');
      if (!hours || !minutes) return null;
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return date;
    } catch (error) {
      console.error('Error parsing time string:', error);
      return null;
    }
  };

  const initialStartTime = parseTimeStringToDate(appointment.startTime);

  // Initial form values
  const initialValues = {
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    clinicId: appointment.clinicId,
    date: initialDate,
    startTime: appointment.startTime,
    duration: appointment.duration,
    type: appointment.type,
    status: appointment.status,
    reasonForVisit: appointment.reasonForVisit || '',
    notes: appointment.notes || '',
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => navigate(`/appointments/${id}`)}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Edit Appointment
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
              isSubmitting,
            }) => (
              <Form>
                <Grid container spacing={3}>
                  {/* Patient Selection */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      id="patientId"
                      options={patients}
                      getOptionLabel={(option) => {
                        if (typeof option === 'string') return option;
                        if (!option) return '';
                        return `${option.name || ''} (${option.phone || ''})`.trim();
                      }}
                      value={patients.find(p => p._id === values.patientId) || null}
                      onChange={(event, newValue) => {
                        setFieldValue('patientId', newValue ? newValue._id : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Patient"
                          variant="outlined"
                          error={touched.patientId && Boolean(errors.patientId)}
                          helperText={touched.patientId && errors.patientId}
                          fullWidth
                          required
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div>
                            <Typography variant="body1">{option.name || 'Unknown Patient'}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.phone || 'No phone'} | {option.email || 'No email'}
                            </Typography>
                          </div>
                        </li>
                      )}
                      disabled={isSubmitting || submitting}
                    />
                  </Grid>

                  {/* Doctor Selection */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      id="doctorId"
                      options={doctors}
                      getOptionLabel={(option) => {
                        if (typeof option === 'string') return option;
                        if (!option) return '';
                        return `${option.firstName || ''} ${option.lastName || ''} (${option.specialization || 'Doctor'})`.trim();
                      }}
                      value={doctors.find(d => d._id === values.doctorId) || null}
                      onChange={(event, newValue) => {
                        setFieldValue('doctorId', newValue ? newValue._id : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Doctor"
                          variant="outlined"
                          error={touched.doctorId && Boolean(errors.doctorId)}
                          helperText={touched.doctorId && errors.doctorId}
                          fullWidth
                          required
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div>
                            <Typography variant="body1">{option.firstName || ''} {option.lastName || ''}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.specialization || 'Doctor'}
                            </Typography>
                          </div>
                        </li>
                      )}
                      disabled={isSubmitting || submitting}
                    />
                  </Grid>

                  {/* Clinic Selection */}
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      error={touched.clinicId && Boolean(errors.clinicId)}
                      disabled={isSubmitting || submitting}
                    >
                      <InputLabel id="clinic-label">Clinic</InputLabel>
                      <Select
                        labelId="clinic-label"
                        id="clinicId"
                        name="clinicId"
                        value={values.clinicId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Clinic"
                      >
                        {clinics.map((clinic) => {
                          let addressText = 'Address not available';
                          if (clinic.address) {
                            if (typeof clinic.address === 'string') {
                              addressText = clinic.address;
                            } else if (typeof clinic.address === 'object') {
                              const addressParts = [
                                clinic.address.street,
                                clinic.address.city,
                                clinic.address.state,
                                clinic.address.pincode
                              ].filter(part => part && part.trim());
                              addressText = addressParts.join(', ');
                            }
                          }
                          return (
                            <MenuItem key={clinic._id} value={clinic._id}>
                              {clinic.name} - {addressText}
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {touched.clinicId && errors.clinicId && (
                        <FormHelperText>{errors.clinicId}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Date */}
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date"
                        value={values.date}
                        onChange={(newValue) => {
                          setFieldValue('date', newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            error={touched.date && Boolean(errors.date)}
                            helperText={touched.date && errors.date}
                          />
                        )}
                        disabled={isSubmitting || submitting}
                      />
                    </LocalizationProvider>
                  </Grid>

                  {/* Start Time */}
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="Start Time"
                        value={initialStartTime}
                        onChange={(newValue) => {
                          if (newValue) {
                            const formattedTime = format(newValue, 'HH:mm');
                            setFieldValue('startTime', formattedTime);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            error={touched.startTime && Boolean(errors.startTime)}
                            helperText={touched.startTime && errors.startTime}
                          />
                        )}
                        disabled={isSubmitting || submitting}
                      />
                    </LocalizationProvider>
                  </Grid>

                  {/* Duration */}
                  <Grid item xs={12} md={4}>
                    <FormControl
                      fullWidth
                      error={touched.duration && Boolean(errors.duration)}
                      disabled={isSubmitting || submitting}
                    >
                      <InputLabel id="duration-label">Duration</InputLabel>
                      <Select
                        labelId="duration-label"
                        id="duration"
                        name="duration"
                        value={values.duration}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Duration"
                      >
                        {APPOINTMENT_DURATIONS.map((duration) => (
                          <MenuItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.duration && errors.duration && (
                        <FormHelperText>{errors.duration}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Appointment Type */}
                  <Grid item xs={12} md={4}>
                    <FormControl
                      fullWidth
                      error={touched.type && Boolean(errors.type)}
                      disabled={isSubmitting || submitting}
                    >
                      <InputLabel id="type-label">Appointment Type</InputLabel>
                      <Select
                        labelId="type-label"
                        id="type"
                        name="type"
                        value={values.type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Appointment Type"
                      >
                        {APPOINTMENT_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.type && errors.type && (
                        <FormHelperText>{errors.type}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12} md={4}>
                    <FormControl
                      fullWidth
                      error={touched.status && Boolean(errors.status)}
                      disabled={isSubmitting || submitting}
                    >
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        id="status"
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Status"
                      >
                        {APPOINTMENT_STATUSES.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.status && errors.status && (
                        <FormHelperText>{errors.status}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Reason for Visit */}
                  <Grid item xs={12}>
                    <TextField
                      id="reasonForVisit"
                      name="reasonForVisit"
                      label="Reason for Visit"
                      multiline
                      rows={2}
                      value={values.reasonForVisit}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.reasonForVisit && Boolean(errors.reasonForVisit)}
                      helperText={touched.reasonForVisit && errors.reasonForVisit}
                      fullWidth
                      required
                      disabled={isSubmitting || submitting}
                    />
                  </Grid>

                  {/* Notes */}
                  <Grid item xs={12}>
                    <TextField
                      id="notes"
                      name="notes"
                      label="Notes"
                      multiline
                      rows={4}
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.notes && Boolean(errors.notes)}
                      helperText={touched.notes && errors.notes}
                      fullWidth
                      disabled={isSubmitting || submitting}
                    />
                  </Grid>

                  {/* End Time Display (calculated) */}
                  <Grid item xs={12}>
                    <TextField
                      label="End Time (Calculated)"
                      value={calculateEndTime(values.startTime, values.duration) || 'N/A'}
                      fullWidth
                      disabled
                    />
                  </Grid>

                  {/* Error Message */}
                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error">{error}</Alert>
                    </Grid>
                  )}

                  {/* Buttons */}
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => navigate(`/appointments/${id}`)}
                      disabled={isSubmitting || submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || submitting}
                      startIcon={isSubmitting || submitting ? <CircularProgress size={20} /> : null}
                    >
                      {isSubmitting || submitting ? 'Updating...' : 'Update Appointment'}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditAppointment;
