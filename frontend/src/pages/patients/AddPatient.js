import React, { useState, useEffect, useCallback } from 'react';
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
  InputAdornment,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, differenceInYears } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

// Blood groups
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AddPatient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const navigate = useNavigate();
  
  // Fetch clinics when component mounts
  useEffect(() => {
    fetchClinics();
  }, []);
  
  // Function to fetch clinics from API
  const fetchClinics = async () => {
    setClinicsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/clinics`);
      setClinics(response.data.data || []);
    } catch (err) {
      console.error('Error fetching clinics:', err);
      toast.error('Failed to load clinics');
    } finally {
      setClinicsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: null,
      address: '',
      city: '',
      state: '',
      pincode: '',
      bloodGroup: '',
      allergies: '',
      medicalHistory: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      clinicId: '',
      occupation: '',
      referredBy: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Phone number must be a valid Indian number')
        .required('Phone number is required'),
      gender: Yup.string().required('Gender is required'),
      dateOfBirth: Yup.date().nullable().required('Date of birth is required'),
      address: Yup.string().required('Address is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      pincode: Yup.string()
        .matches(/^\d{6}$/, 'Pincode must be 6 digits')
        .required('Pincode is required'),
      bloodGroup: Yup.string().required('Blood group is required'),
      emergencyContactName: Yup.string().required('Emergency contact name is required'),
      emergencyContactPhone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Phone number must be a valid Indian number')
        .required('Emergency contact phone is required'),
      clinicId: Yup.string().required('Clinic is required'),
    }),
    onSubmit: async (values) => {
      console.log('🔍 Form submission started');
      console.log('Form values:', values);
      console.log('Form errors:', formik.errors);
      console.log('Form touched:', formik.touched);
      
      try {
        setLoading(true);
        setError(null);
        
        // Calculate age from date of birth
        const age = values.dateOfBirth ? differenceInYears(new Date(), new Date(values.dateOfBirth)) : null;
        
        // Format date of birth to ISO string
        const formattedDOB = values.dateOfBirth ? format(new Date(values.dateOfBirth), 'yyyy-MM-dd') : null;
        
        // Prepare patient data
        const patientData = {
          ...values,
          name: `${values.firstName} ${values.lastName}`.trim(), // Combine first and last name
          dateOfBirth: formattedDOB,
          age,
          registrationDate: format(new Date(), 'yyyy-MM-dd'),
          registeredClinic: values.clinicId, // Map clinicId to registeredClinic
          address: {
            street: values.address,
            city: values.city,
            state: values.state,
            pincode: values.pincode,
            country: 'India'
          },
          medicalHistory: {
            allergies: values.allergies ? [values.allergies] : [],
            other: values.medicalHistory || ''
          }
        };
        
        // Remove clinicId, firstName/lastName, and individual address fields from the data
        delete patientData.clinicId;
        delete patientData.firstName;
        delete patientData.lastName;
        delete patientData.address; // Remove the string address field
        delete patientData.city;
        delete patientData.state;
        delete patientData.pincode;
        delete patientData.allergies; // Remove individual medical history fields
        delete patientData.medicalHistory; // Remove the string medical history field
        
        console.log('Patient data to send:', patientData);
        
        // API call to create patient
        const response = await axios.post(`${API_URL}/patients`, patientData);
        
        console.log('API response:', response.data);
        toast.success('Patient added successfully!');
        navigate('/patients');
      } catch (err) {
        console.error('Error adding patient:', err);
        console.error('Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to add patient. Please try again.');
        toast.error('Failed to add patient');
      } finally {
        setLoading(false);
      }
    },
  });

  // Calculate age whenever date of birth changes
  const calculateAge = (dob) => {
    if (!dob) return '';
    return differenceInYears(new Date(), new Date(dob));
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Patient
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
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name *"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                disabled={loading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name *"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
                <InputLabel id="gender-label">Gender *</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Gender"
                  disabled={loading}
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
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
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
                <InputLabel id="bloodGroup-label">Blood Group *</InputLabel>
                <Select
                  labelId="bloodGroup-label"
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formik.values.bloodGroup}
                  onChange={formik.handleChange}
                  label="Blood Group"
                  disabled={loading}
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
                disabled={loading}
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
                label="Email Address *"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number *"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                disabled={loading}
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
                label="Address *"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                disabled={loading}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="city"
                name="city"
                label="City *"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="state"
                name="state"
                label="State *"
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.state && Boolean(formik.errors.state)}
                helperText={formik.touched.state && formik.errors.state}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="pincode"
                name="pincode"
                label="Pincode *"
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                helperText={formik.touched.pincode && formik.errors.pincode}
                disabled={loading}
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
                label="Emergency Contact Name *"
                value={formik.values.emergencyContactName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
                helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                label="Emergency Contact Phone *"
                value={formik.values.emergencyContactPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactPhone && Boolean(formik.errors.emergencyContactPhone)}
                helperText={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading || clinicsLoading}
                >
                  {clinicsLoading ? (
                    <MenuItem disabled>Loading clinics...</MenuItem>
                  ) : clinics.length > 0 ? (
                    clinics.map((clinic) => (
                      <MenuItem key={clinic._id} value={clinic._id}>
                        {clinic.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No clinics available</MenuItem>
                  )}
                </Select>
                {formik.touched.clinicId && formik.errors.clinicId && (
                  <FormHelperText>{formik.errors.clinicId}</FormHelperText>
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
                disabled={loading}
                placeholder="How did the patient hear about us?"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    console.log('🔍 Debug: Form validation check');
                    console.log('Form is valid:', formik.isValid);
                    console.log('Form errors:', formik.errors);
                    console.log('Form values:', formik.values);
                    formik.validateForm().then(errors => {
                      console.log('Validation errors:', errors);
                    });
                  }}
                  disabled={loading}
                >
                  Debug Form
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/patients')}
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
                  {loading ? 'Saving...' : 'Add Patient'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddPatient;