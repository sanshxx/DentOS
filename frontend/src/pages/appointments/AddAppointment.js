import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

// Appointment types and durations are static data, not from API

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



        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Make API calls to get necessary data
        const patientsResponse = await axios.get(`${API_URL}/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const doctorsResponse = await axios.get(`${API_URL}/staff`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const clinicsResponse = await axios.get(`${API_URL}/clinics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Set data from API responses
        setPatients(patientsResponse.data.data);
        setDoctors(doctorsResponse.data.data.filter(staff => staff.role === 'dentist'));
        setClinics(clinicsResponse.data.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load necessary data. Please try again.');
        toast.error(err.response?.data?.message || 'Failed to load data');
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
      reasonForVisit: '',
      notes: '',
    },
    validationSchema: Yup.object({
      patientId: Yup.string().required('Patient is required'),
      doctorId: Yup.string().required('Doctor is required'),
      clinicId: Yup.string().required('Clinic is required'),
      date: Yup.date().required('Date is required').nullable(),
      startTime: Yup.date().required('Start time is required').nullable(),
      duration: Yup.number().required('Duration is required'),
      type: Yup.string().required('Appointment type is required'),
      reasonForVisit: Yup.string().required('Reason for visit is required'),
      notes: Yup.string(),
    }),
         onSubmit: async (values) => {
       // Additional validation before submission
       const errors = {};
       if (!values.patientId) errors.patientId = 'Please select a patient';
       if (!values.doctorId) errors.doctorId = 'Please select a doctor';
       if (!values.clinicId) errors.clinicId = 'Please select a clinic';
       if (!values.type) errors.type = 'Please select an appointment type';
       if (!values.date) errors.date = 'Please select an appointment date';
       if (!values.startTime) errors.startTime = 'Please select a start time';
       if (!values.reasonForVisit) errors.reasonForVisit = 'Please provide a reason for visit';
       
       if (Object.keys(errors).length > 0) {
         // Set all errors at once
         Object.keys(errors).forEach(key => {
           formik.setFieldError(key, errors[key]);
           formik.setFieldTouched(key, true);
         });
         toast.error('Please fill in all required fields');
         return;
       }
       
       try {
         setLoading(true);
         setError(null);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Calculate end time
        const endTime = calculateEndTime(values.startTime, values.duration);
        
        // Format date and times
        const formattedDate = format(values.date, 'yyyy-MM-dd');
        const formattedStartTime = format(values.startTime, 'HH:mm');
        const formattedEndTime = format(endTime, 'HH:mm');
        
        // Combine date and time into a single datetime
        const appointmentDateTime = new Date(`${formattedDate}T${formattedStartTime}`);
        
        // Prepare appointment data
        const appointmentData = {
          patient: values.patientId,
          clinic: values.clinicId,
          dentist: values.doctorId,
          appointmentDate: appointmentDateTime,
          endTime: endTime,
          duration: values.duration,
          appointmentType: values.type,
          reasonForVisit: values.reasonForVisit,
          notes: values.notes || '',
          status: 'scheduled'
        };
        
        // Make API call to create appointment
        const response = await axios.post(`${API_URL}/appointments`, appointmentData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success('Appointment scheduled successfully!');
        navigate('/appointments');
      } catch (err) {
        console.error('Error creating appointment:', err);
        setError(err.response?.data?.message || 'Failed to schedule appointment. Please try again.');
        toast.error(err.response?.data?.message || 'Failed to schedule appointment');
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
         <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
           Fields marked with * are required
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
                 value={patients.find(p => p._id === formik.values.patientId) || null}
                 onChange={(event, newValue) => {
                   formik.setFieldValue('patientId', newValue ? newValue._id : '');
                 }}
                renderInput={(params) => (
                                     <TextField
                     {...params}
                     label="Select Patient *"
                     error={formik.touched.patientId && Boolean(formik.errors.patientId)}
                     helperText={formik.touched.patientId && formik.errors.patientId}
                     disabled={loading}
                     required
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
                                 <InputLabel id="clinic-label">Clinic *</InputLabel>
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
                    <MenuItem key={clinic._id} value={clinic._id}>
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
                                 <InputLabel id="doctor-label">Doctor *</InputLabel>
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
                    <MenuItem key={doctor._id} value={doctor._id}>
                      {doctor.firstName} {doctor.lastName} ({doctor.specialization || 'General'})
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
                                 <InputLabel id="type-label">Appointment Type *</InputLabel>
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
                                     label="Appointment Date *"
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
                                     label="Start Time *"
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
                                 <InputLabel id="duration-label">Duration *</InputLabel>
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
                id="reasonForVisit"
                name="reasonForVisit"
                label="Reason for Visit"
                multiline
                rows={2}
                value={formik.values.reasonForVisit}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.reasonForVisit && Boolean(formik.errors.reasonForVisit)}
                helperText={formik.touched.reasonForVisit && formik.errors.reasonForVisit}
                disabled={loading}
                required
              />
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