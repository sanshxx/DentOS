import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

// Mock data for patients, doctors, and clinics
const MOCK_PATIENTS = [
  { id: '123456', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul.sharma@example.com' },
  { id: '123457', name: 'Priya Singh', phone: '9876543211', email: 'priya.singh@example.com' },
  { id: '123458', name: 'Amit Patel', phone: '9876543212', email: 'amit.patel@example.com' },
  { id: '123459', name: 'Neha Gupta', phone: '9876543213', email: 'neha.gupta@example.com' },
  { id: '123460', name: 'Vikram Mehta', phone: '9876543214', email: 'vikram.mehta@example.com' },
];

const MOCK_DOCTORS = [
  { id: 'DOC001', name: 'Dr. Priya Patel', specialization: 'General Dentist' },
  { id: 'DOC002', name: 'Dr. Rajesh Kumar', specialization: 'Orthodontist' },
  { id: 'DOC003', name: 'Dr. Ananya Singh', specialization: 'Periodontist' },
  { id: 'DOC004', name: 'Dr. Suresh Verma', specialization: 'Oral Surgeon' },
  { id: 'DOC005', name: 'Dr. Meera Reddy', specialization: 'Pediatric Dentist' },
];

const MOCK_CLINICS = [
  { id: 1, name: 'Dental Care - Bandra', address: '123 Hill Road, Bandra West, Mumbai 400050' },
  { id: 2, name: 'Dental Care - Andheri', address: '456 Andheri East, Mumbai 400069' },
  { id: 3, name: 'Dental Care - Powai', address: '789 Hiranandani Gardens, Powai, Mumbai 400076' },
  { id: 4, name: 'Dental Care - Juhu', address: '101 Juhu Beach Road, Mumbai 400049' },
];

// Mock appointment data (replace with API call)
const MOCK_APPOINTMENT = {
  id: 'APT001',
  patientId: '123456',
  patientName: 'Rahul Sharma',
  patientPhone: '9876543210',
  patientEmail: 'rahul.sharma@example.com',
  doctorId: 'DOC001',
  doctorName: 'Dr. Priya Patel',
  doctorSpecialization: 'General Dentist',
  clinicId: 1,
  clinicName: 'Dental Care - Bandra',
  clinicAddress: '123 Hill Road, Bandra West, Mumbai 400050',
  date: '2023-06-20',
  startTime: '10:00',
  endTime: '10:30',
  duration: 30,
  status: 'scheduled',
  type: 'checkup',
  notes: 'Regular dental checkup',
  createdAt: '2023-05-15T10:30:00Z',
  updatedAt: '2023-05-15T10:30:00Z',
};

// Appointment types
const APPOINTMENT_TYPES = [
  { value: 'checkup', label: 'Regular Checkup' },
  { value: 'cleaning', label: 'Teeth Cleaning' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'filling', label: 'Cavity Filling' },
  { value: 'rootcanal', label: 'Root Canal' },
  { value: 'extraction', label: 'Tooth Extraction' },
  { value: 'crown', label: 'Crown Fitting' },
  { value: 'braces', label: 'Braces Adjustment' },
  { value: 'dentures', label: 'Dentures Fitting' },
  { value: 'emergency', label: 'Emergency' },
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
  clinicId: Yup.number().required('Clinic is required'),
  date: Yup.date().required('Date is required'),
  startTime: Yup.string().required('Start time is required'),
  duration: Yup.number().required('Duration is required'),
  type: Yup.string().required('Appointment type is required'),
  status: Yup.string().required('Status is required'),
  notes: Yup.string(),
});

const EditAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        // const response = await axios.get(`/api/appointments/${id}`);
        // setAppointment(response.data);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setAppointment(MOCK_APPOINTMENT);
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

  // Calculate end time based on start time and duration
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

      // Calculate end time
      const endTime = calculateEndTime(values.startTime, values.duration);

      // Get patient, doctor, and clinic details
      const patient = MOCK_PATIENTS.find(p => p.id === values.patientId);
      const doctor = MOCK_DOCTORS.find(d => d.id === values.doctorId);
      const clinic = MOCK_CLINICS.find(c => c.id === values.clinicId);

      // Prepare data for API call
      const appointmentData = {
        ...values,
        endTime,
        patientName: patient?.name || '',
        patientPhone: patient?.phone || '',
        patientEmail: patient?.email || '',
        doctorName: doctor?.name || '',
        doctorSpecialization: doctor?.specialization || '',
        clinicName: clinic?.name || '',
        clinicAddress: clinic?.address || '',
        updatedAt: new Date().toISOString(),
      };

      // In a real app, this would be an API call
      // await axios.put(`/api/appointments/${id}`, appointmentData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Appointment updated successfully');
      navigate(`/appointments/${id}`);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
      toast.error('Failed to update appointment');
      formikSetSubmitting(false);
      setSubmitting(false);
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

  // Parse date string to Date object for the date picker
  const initialDate = appointment.date ? new Date(appointment.date) : null;

  // Parse time string to Date object for the time picker
  const parseTimeStringToDate = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    return date;
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
                      options={MOCK_PATIENTS}
                      getOptionLabel={(option) => 
                        typeof option === 'string' ? option : `${option.name} (${option.phone})`
                      }
                      value={MOCK_PATIENTS.find(p => p.id === values.patientId) || null}
                      onChange={(event, newValue) => {
                        setFieldValue('patientId', newValue ? newValue.id : '');
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
                            <Typography variant="body1">{option.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              +91 {option.phone} | {option.email}
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
                      options={MOCK_DOCTORS}
                      getOptionLabel={(option) => 
                        typeof option === 'string' ? option : `${option.name} (${option.specialization})`
                      }
                      value={MOCK_DOCTORS.find(d => d.id === values.doctorId) || null}
                      onChange={(event, newValue) => {
                        setFieldValue('doctorId', newValue ? newValue.id : '');
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
                            <Typography variant="body1">{option.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.specialization}
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
                        {MOCK_CLINICS.map((clinic) => (
                          <MenuItem key={clinic.id} value={clinic.id}>
                            {clinic.name} - {clinic.address}
                          </MenuItem>
                        ))}
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
                          const formattedTime = format(newValue, 'HH:mm');
                          setFieldValue('startTime', formattedTime);
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