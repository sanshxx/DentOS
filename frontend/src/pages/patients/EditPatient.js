import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  InputAdornment,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, differenceInYears, parse } from 'date-fns';
import { toast } from 'react-toastify';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Clinics will be fetched from the API

// Blood groups
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Patient data will be fetched from the API

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Make API calls to get patient data and clinics
        const [patientResponse, clinicsResponse] = await Promise.all([
          axios.get(`${API_URL}/patients/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/clinics`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setPatient(patientResponse.data.data);
        setClinics(clinicsResponse.data.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        toast.error(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: patient?.name || '',
      email: patient?.email || '',
      phone: patient?.phone || '',
      gender: patient?.gender || '',
      dateOfBirth: patient?.dateOfBirth ? new Date(patient.dateOfBirth) : null,
      address: patient?.address || {},
      city: patient?.address?.city || '',
      state: patient?.address?.state || '',
      pincode: patient?.address?.pincode || '',
      bloodGroup: patient?.bloodGroup || '',
      allergies: Array.isArray(patient?.medicalHistory?.allergies) 
        ? patient.medicalHistory.allergies.join(', ') 
        : patient?.medicalHistory?.allergies || '',
      medicalHistory: patient?.medicalHistory?.other || '',
      emergencyContactName: patient?.emergencyContactName || '',
      emergencyContactPhone: patient?.emergencyContactPhone || '',
      registeredClinic: patient?.registeredClinic?._id || patient?.registeredClinic || '',
      occupation: patient?.occupation || '',
      referredBy: patient?.referredBy || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address'),
      phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Phone number must be a valid Indian number')
        .required('Phone number is required'),
      gender: Yup.string().required('Gender is required'),
      dateOfBirth: Yup.date().nullable().required('Date of birth is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      pincode: Yup.string()
        .matches(/^\d{6}$/, 'Pincode must be 6 digits')
        .required('Pincode is required'),
      bloodGroup: Yup.string(),
      emergencyContactName: Yup.string(),
      emergencyContactPhone: Yup.string().matches(/^[6-9]\d{9}$/, 'Phone number must be a valid Indian number'),
      registeredClinic: Yup.string().required('Clinic is required'),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Calculate age from date of birth
        const age = values.dateOfBirth ? differenceInYears(new Date(), new Date(values.dateOfBirth)) : null;
        
        // Format date of birth to ISO string
        const formattedDOB = values.dateOfBirth ? format(new Date(values.dateOfBirth), 'yyyy-MM-dd') : null;
        
        // Prepare address object
        const address = {
          street: values.address?.street || '',
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          country: 'India'
        };
        
        // Prepare patient data
        const patientData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          gender: values.gender,
          dateOfBirth: formattedDOB,
          age,
          address,
          bloodGroup: values.bloodGroup,
          occupation: values.occupation,
          referredBy: values.referredBy,
          registeredClinic: values.registeredClinic,
          emergencyContactName: values.emergencyContactName,
          emergencyContactPhone: values.emergencyContactPhone,
          medicalHistory: {
            allergies: values.allergies ? values.allergies.split(',').map(a => a.trim()) : [],
            other: values.medicalHistory
          }
        };
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // API call to update patient
        const response = await axios.put(`${API_URL}/patients/${id}`, patientData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success('Patient updated successfully!');
        navigate(`/patients/${id}`);
      } catch (err) {
        console.error('Error updating patient:', err);
        setError(err.response?.data?.message || 'Failed to update patient. Please try again.');
        toast.error(err.response?.data?.message || 'Failed to update patient');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Calculate age whenever date of birth changes
  const calculateAge = (dob) => {
    if (!dob) return '';
    return differenceInYears(new Date(), new Date(dob));
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
            onClick={() => navigate(`/patients/${id}`)}
          >
            Back to Patient
          </Button>
        </Box>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Patient not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/patients')}
          >
            Back to Patients
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Patient: {patient.name}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Gender"
                  disabled={submitting}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {formik.touched.gender && formik.errors.gender && (
                  <FormHelperText>{formik.errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formik.values.dateOfBirth}
                  onChange={(date) => {
                    formik.setFieldValue('dateOfBirth', date);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="dateOfBirth"
                      name="dateOfBirth"
                      error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                      helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                      disabled={submitting}
                    />
                  )}
                  disabled={submitting}
                  disableFuture
                  maxDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="age"
                label="Age"
                value={calculateAge(formik.values.dateOfBirth)}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">years</InputAdornment>,
                }}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="bloodGroup-label">Blood Group</InputLabel>
                <Select
                  labelId="bloodGroup-label"
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formik.values.bloodGroup}
                  onChange={formik.handleChange}
                  label="Blood Group"
                  disabled={submitting}
                >
                  <MenuItem value="">Not Known</MenuItem>
                  {BLOOD_GROUPS.map((group) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="occupation"
                name="occupation"
                label="Occupation"
                value={formik.values.occupation}
                onChange={formik.handleChange}
                disabled={submitting}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                disabled={submitting}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Street Address"
                value={formik.values.address?.street || ''}
                onChange={(e) => {
                  formik.setFieldValue('address', {
                    ...formik.values.address,
                    street: e.target.value
                  });
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                disabled={submitting}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="city"
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="state"
                name="state"
                label="State"
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.state && Boolean(formik.errors.state)}
                helperText={formik.touched.state && formik.errors.state}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="pincode"
                name="pincode"
                label="Pincode"
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                helperText={formik.touched.pincode && formik.errors.pincode}
                disabled={submitting}
              />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="emergencyContactName"
                name="emergencyContactName"
                label="Emergency Contact Name"
                value={formik.values.emergencyContactName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
                helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                label="Emergency Contact Phone"
                value={formik.values.emergencyContactPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactPhone && Boolean(formik.errors.emergencyContactPhone)}
                helperText={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
                disabled={submitting}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                }}
              />
            </Grid>

            {/* Medical Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Medical Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="allergies"
                name="allergies"
                label="Allergies"
                value={formik.values.allergies}
                onChange={formik.handleChange}
                disabled={submitting}
                multiline
                rows={3}
                placeholder="List any allergies or write 'None'"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="medicalHistory"
                name="medicalHistory"
                label="Medical History"
                value={formik.values.medicalHistory}
                onChange={formik.handleChange}
                disabled={submitting}
                multiline
                rows={3}
                placeholder="Any relevant medical history"
              />
            </Grid>

            {/* Clinic Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Clinic Information
              </Typography>
            </Grid>

                         <Grid item xs={12} sm={6}>
               <FormControl fullWidth error={formik.touched.registeredClinic && Boolean(formik.errors.registeredClinic)}>
                 <InputLabel id="clinic-label">Clinic</InputLabel>
                 <Select
                   labelId="clinic-label"
                   id="registeredClinic"
                   name="registeredClinic"
                   value={formik.values.registeredClinic}
                   onChange={formik.handleChange}
                   onBlur={formik.handleBlur}
                   label="Clinic"
                   disabled={submitting}
                 >
                   {clinics.map((clinic) => (
                     <MenuItem key={clinic._id} value={clinic._id}>
                       {clinic.name}
                     </MenuItem>
                   ))}
                 </Select>
                 {formik.touched.registeredClinic && formik.errors.registeredClinic && (
                   <FormHelperText>{formik.errors.registeredClinic}</FormHelperText>
                 )}
               </FormControl>
             </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="referredBy"
                name="referredBy"
                label="Referred By"
                value={formik.values.referredBy}
                onChange={formik.handleChange}
                disabled={submitting}
                placeholder="How did the patient hear about us?"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(`/patients/${id}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                  startIcon={submitting && <CircularProgress size={20} />}
                >
                  {submitting ? 'Saving...' : 'Update Patient'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditPatient;