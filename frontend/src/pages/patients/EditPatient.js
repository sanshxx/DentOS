import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

// Mock data for clinics (replace with API call)
const CLINICS = [
  { id: 1, name: 'Dental Care - Bandra' },
  { id: 2, name: 'Dental Care - Andheri' },
  { id: 3, name: 'Dental Care - Powai' },
  { id: 4, name: 'Dental Care - Juhu' },
];

// Blood groups
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Mock patient data (replace with API call)
const MOCK_PATIENT = {
  id: '123456',
  firstName: 'Rahul',
  lastName: 'Sharma',
  email: 'rahul.sharma@example.com',
  phone: '9876543210',
  gender: 'male',
  dateOfBirth: '1985-06-15',
  age: 38,
  address: '123 Main Street, Bandra West',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400050',
  bloodGroup: 'O+',
  allergies: 'Penicillin',
  medicalHistory: 'Hypertension, Diabetes Type 2',
  emergencyContactName: 'Priya Sharma',
  emergencyContactPhone: '9876543211',
  clinicId: 1,
  registrationDate: '2022-03-10',
  occupation: 'Software Engineer',
  referredBy: 'Dr. Patel',
};

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        // const response = await axios.get(`/api/patients/${id}`);
        // setPatient(response.data);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setPatient(MOCK_PATIENT);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Failed to load patient data. Please try again.');
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: patient?.firstName || '',
      lastName: patient?.lastName || '',
      email: patient?.email || '',
      phone: patient?.phone || '',
      gender: patient?.gender || '',
      dateOfBirth: patient?.dateOfBirth ? new Date(patient.dateOfBirth) : null,
      address: patient?.address || '',
      city: patient?.city || '',
      state: patient?.state || '',
      pincode: patient?.pincode || '',
      bloodGroup: patient?.bloodGroup || '',
      allergies: patient?.allergies || '',
      medicalHistory: patient?.medicalHistory || '',
      emergencyContactName: patient?.emergencyContactName || '',
      emergencyContactPhone: patient?.emergencyContactPhone || '',
      clinicId: patient?.clinicId || '',
      occupation: patient?.occupation || '',
      referredBy: patient?.referredBy || '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address'),
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
      bloodGroup: Yup.string(),
      emergencyContactName: Yup.string(),
      emergencyContactPhone: Yup.string().matches(/^[6-9]\d{9}$/, 'Phone number must be a valid Indian number'),
      clinicId: Yup.number().required('Clinic is required'),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Calculate age from date of birth
        const age = values.dateOfBirth ? differenceInYears(new Date(), new Date(values.dateOfBirth)) : null;
        
        // Format date of birth to ISO string
        const formattedDOB = values.dateOfBirth ? format(new Date(values.dateOfBirth), 'yyyy-MM-dd') : null;
        
        // Prepare patient data
        const patientData = {
          ...values,
          dateOfBirth: formattedDOB,
          age,
        };
        
        // API call to update patient
        // Replace with actual API endpoint
        // const response = await axios.put(`/api/patients/${id}`, patientData);
        
        // For demo purposes, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('Patient updated successfully!');
        navigate(`/patients/${id}`);
      } catch (err) {
        console.error('Error updating patient:', err);
        setError(err.response?.data?.message || 'Failed to update patient. Please try again.');
        toast.error('Failed to update patient');
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
          Edit Patient: {patient.firstName} {patient.lastName}
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
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
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
                label="Address"
                value={formik.values.address}
                onChange={formik.handleChange}
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
                  disabled={submitting}
                >
                  {CLINICS.map((clinic) => (
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