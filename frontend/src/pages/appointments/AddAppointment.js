import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, addMinutes, isAfter, parseISO, set } from 'date-fns';
import { toast } from 'react-toastify';

// Mock data for patients (replace with API call)
const MOCK_PATIENTS = [
  { id: '123456', name: 'Rahul Sharma', phone: '9876543210' },
  { id: '123457', name: 'Priya Patel', phone: '9876543211' },
  { id: '123458', name: 'Amit Singh', phone: '9876543212' },
  { id: '123459', name: 'Neha Gupta', phone: '9876543213' },
  { id: '123460', name: 'Vikram Malhotra', phone: '9876543214' },
];

// Mock data for doctors (replace with API call)
const MOCK_DOCTORS = [
  { id: 'DOC001', name: 'Dr. Priya Patel', specialization: 'General Dentist' },
  { id: 'DOC002', name: 'Dr. Amit Singh', specialization: 'Orthodontist' },
  { id: 'DOC003', name: 'Dr. Neha Gupta', specialization: 'Periodontist' },
  { id: 'DOC004', name: 'Dr. Rajesh Kumar', specialization: 'Oral Surgeon' },
];

// Mock data for clinics (replace with API call)
const MOCK_CLINICS = [
  { id: 1, name: 'Dental Care - Bandra' },
  { id: 2, name: 'Dental Care - Andheri' },
  { id: 3, name: 'Dental Care - Powai' },
  { id: 4, name: 'Dental Care - Juhu' },
];

// Appointment types
const APPOINTMENT_TYPES = [
  { value: 'checkup', label: 'Regular Checkup' },
  { value: 'cleaning', label: 'Teeth Cleaning' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'emergency', label: 'Emergency' },
];

// Appointment durations (in minutes)
const APPOINTMENT_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const AddAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        // In a real app, these would be API calls
        // const patientsResponse = await axios.get('/api/patients');
        // const doctorsResponse = await axios.get('/api/doctors');
        // const clinicsResponse = await axios.get('/api/clinics');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setPatients(MOCK_PATIENTS);
        setDoctors(MOCK_DOCTORS);
        setClinics(MOCK_CLINICS);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load necessary data. Please try again.');
        toast.error('Failed to load data');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return null;
    return addMinutes(new Date(startTime), durationMinutes);
  };

  const formik = useFormik({
    initialValues: {
      patientId: '',
      doctorId: '',
      clinicId: '',
      date: null,
      startTime: null,
      duration: 30,
      endTime: null,
      type: '',
      status: 'scheduled',
      notes: '',
    },
    validationSchema: Yup.object({
      patientId: Yup.string().required('Patient is required'),
      doctorId: Yup.string().required('Doctor is required'),
      clinicId: Yup.number().required('Clinic is required'),
      date: Yup.date().required('Date is required').nullable(),
      startTime: Yup.date().required('Start time is required').nullable(),
      duration: Yup.number().required('Duration is required'),
      type: Yup.string().required('Appointment type is required'),
      notes: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate end time
        const endTime = calculateEndTime(values.startTime, values.duration);
        
        // Format date and times
        const formattedDate = format(values.date, 'yyyy-MM-dd');
        const formattedStartTime = format(values.startTime, 'HH:mm');
        const formattedEndTime = format(endTime, 'HH:mm');
        
        // Get patient, doctor, and clinic details
        const patient = patients.find(p => p.id === values.patientId);
        const doctor = doctors.find(d => d.id === values.doctorId);
        const clinic = clinics.find(c => c.id === values.clinicId);
        
        // Prepare appointment data
        const appointmentData = {
          patientId: values.patientId,
          patientName: patient.name,
          patientPhone: patient.phone,
          doctorId: values.doctorId,
          doctorName: doctor.name,
          clinicId: values.clinicId,
          clinicName: clinic.name,
          date: formattedDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          duration: values.duration,
          type: values.type,
          status: values.status,
          notes: values.notes,
          createdAt: new Date().toISOString(),
        };
        
        // API call to create appointment
        // Replace with actual API endpoint
        // const response = await axios.post('/api/appointments', appointmentData);
        
        // For demo purposes, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('Appointment scheduled successfully!');
        navigate('/appointments');
      } catch (err) {
        console.error('Error creating appointment:', err);
        setError(err.response?.data?.message || 'Failed to schedule appointment. Please try again.');
        toast.error('Failed to schedule appointment');
      } finally {
        setLoading(false);
      }
    },
  });

  // Update end time whenever start time or duration changes
  useEffect(() => {
    if (formik.values.startTime && formik.values.duration) {
      const endTime = calculateEndTime(formik.values.startTime, formik.values.duration);
      formik.setFieldValue('endTime', endTime);
    }
  }, [formik.values.startTime, formik.values.duration]);

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Schedule New Appointment
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Patient Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                id="patientId"
                options={patients}
                getOptionLabel={(option) => `${option.name} (${option.phone})`}
                value={patients.find(p => p.id === formik.values.patientId) || null}
                onChange={(event, newValue) => {
                  formik.setFieldValue('patientId', newValue ? newValue.id : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Patient"
                    error={formik.touched.patientId && Boolean(formik.errors.patientId)}
                    helperText={formik.touched.patientId && formik.errors.patientId}
                    disabled={loading}
                  />
                )}
                disabled={loading}
              />
            </Grid>

            {/* Appointment Details */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Appointment Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={formik.touched.clinicId && Boolean(formik.errors.clinicId)}>
                <InputLabel id="clinic-label">Clinic</InputLabel>
                <Select
                  labelId="clinic-label"
                  id="clinicId"
                  name="clinicId"
                  value={formik.values.clinicId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Clinic"
                  disabled={loading}
                >
                  {clinics.map((clinic) => (
                    <MenuItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.clinicId && formik.errors.clinicId && (
                  <FormHelperText>{formik.errors.clinicId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={formik.touched.doctorId && Boolean(formik.errors.doctorId)}>
                <InputLabel id="doctor-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-label"
                  id="doctorId"
                  name="doctorId"
                  value={formik.values.doctorId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Doctor"
                  disabled={loading}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.specialization})
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.doctorId && formik.errors.doctorId && (
                  <FormHelperText>{formik.errors.doctorId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={formik.touched.type && Boolean(formik.errors.type)}>
                <InputLabel id="type-label">Appointment Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Appointment Type"
                  disabled={loading}
                >
                  {APPOINTMENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText>{formik.errors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Appointment Date"
                  value={formik.values.date}
                  onChange={(date) => {
                    formik.setFieldValue('date', date);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="date"
                      name="date"
                      error={formik.touched.date && Boolean(formik.errors.date)}
                      helperText={formik.touched.date && formik.errors.date}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  disablePast
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={formik.values.startTime}
                  onChange={(time) => {
                    formik.setFieldValue('startTime', time);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="startTime"
                      name="startTime"
                      error={formik.touched.startTime && Boolean(formik.errors.startTime)}
                      helperText={formik.touched.startTime && formik.errors.startTime}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                  minutesStep={15}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={formik.touched.duration && Boolean(formik.errors.duration)}>
                <InputLabel id="duration-label">Duration</InputLabel>
                <Select
                  labelId="duration-label"
                  id="duration"
                  name="duration"
                  value={formik.values.duration}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Duration"
                  disabled={loading}
                >
                  {APPOINTMENT_DURATIONS.map((duration) => (
                    <MenuItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.duration && formik.errors.duration && (
                  <FormHelperText>{formik.errors.duration}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="End Time (Calculated)"
                  value={formik.values.endTime}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="endTime"
                      name="endTime"
                      disabled
                    />
                  )}
                  disabled
                  readOnly
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                disabled={loading}
                placeholder="Add any special instructions or notes about this appointment"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/appointments')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddAppointment;