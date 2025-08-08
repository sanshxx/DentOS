import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

import { API_URL } from '../../utils/apiConfig';

const steps = [
  'Organization Details',
  'Contact Information',
  'Business Information',
  'Review & Complete'
];

const organizationTypes = [
  { value: 'dental_clinic', label: 'Dental Clinic' },
  { value: 'dental_hospital', label: 'Dental Hospital' },
  { value: 'dental_chain', label: 'Dental Chain' },
  { value: 'individual_practitioner', label: 'Individual Practitioner' }
];

const OrganizationSetup = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Organization Details
    name: '',
    slug: '',
    type: 'dental_clinic',
    description: '',
    
    // Contact Information
    contactInfo: {
      email: '',
      phone: '',
      website: ''
    },
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    
    // Business Information
    businessInfo: {
      gstNumber: '',
      panNumber: '',
      registrationNumber: ''
    }
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Organization Details
        if (!formData.name.trim()) newErrors.name = 'Organization name is required';
        if (!formData.type) newErrors.type = 'Organization type is required';
        break;
      
      case 1: // Contact Information
        if (!formData.contactInfo.email.trim()) newErrors['contactInfo.email'] = 'Email is required';
        if (!formData.contactInfo.phone.trim()) newErrors['contactInfo.phone'] = 'Phone is required';
        if (formData.contactInfo.phone && !/^[0-9]{10}$/.test(formData.contactInfo.phone)) {
          newErrors['contactInfo.phone'] = 'Please enter a valid 10-digit phone number';
        }
        break;
      
      case 2: // Address
        if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
        if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
        if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
        if (!formData.address.pincode.trim()) newErrors['address.pincode'] = 'Pincode is required';
        if (formData.address.pincode && !/^[0-9]{6}$/.test(formData.address.pincode)) {
          newErrors['address.pincode'] = 'Please enter a valid 6-digit pincode';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep === 0 && formData.name && !formData.slug) {
        // Auto-generate slug from name
        setFormData(prev => ({
          ...prev,
          slug: generateSlug(formData.name)
        }));
      }
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      // Get the current user's token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        navigate('/login');
        return;
      }

      // Update user's organization
      const response = await axios.put(
        `${API_URL}/organizations/setup`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Organization setup completed successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Organization setup error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to setup organization';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tell us about your organization
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="e.g., Dr. Smith's Dental Clinic"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization Slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="e.g., dr-smith-dental"
                  helperText="This will be used in your organization URL"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Organization Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    label="Organization Type"
                  >
                    {organizationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Brief description of your organization"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization Email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                  error={!!errors['contactInfo.email']}
                  helperText={errors['contactInfo.email']}
                  placeholder="contact@yourclinic.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                  error={!!errors['contactInfo.phone']}
                  helperText={errors['contactInfo.phone']}
                  placeholder="9876543210"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website (Optional)"
                  value={formData.contactInfo.website}
                  onChange={(e) => handleInputChange('contactInfo.website', e.target.value)}
                  placeholder="https://yourclinic.com"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Address Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  error={!!errors['address.street']}
                  helperText={errors['address.street']}
                  placeholder="123 Dental Street"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  error={!!errors['address.city']}
                  helperText={errors['address.city']}
                  placeholder="Mumbai"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  error={!!errors['address.state']}
                  helperText={errors['address.state']}
                  placeholder="Maharashtra"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.address.pincode}
                  onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                  error={!!errors['address.pincode']}
                  helperText={errors['address.pincode']}
                  placeholder="400001"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="India"
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Business Information (Optional)
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GST Number"
                  value={formData.businessInfo.gstNumber}
                  onChange={(e) => handleInputChange('businessInfo.gstNumber', e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  value={formData.businessInfo.panNumber}
                  onChange={(e) => handleInputChange('businessInfo.panNumber', e.target.value)}
                  placeholder="ABCDE1234F"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  value={formData.businessInfo.registrationNumber}
                  onChange={(e) => handleInputChange('businessInfo.registrationNumber', e.target.value)}
                  placeholder="Business registration number"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Organization Details
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your organization details before completing the setup.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Organization Details
                </Typography>
                <Typography>Name: {formData.name}</Typography>
                <Typography>Slug: {formData.slug}</Typography>
                <Typography>Type: {organizationTypes.find(t => t.value === formData.type)?.label}</Typography>
                {formData.description && <Typography>Description: {formData.description}</Typography>}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Contact Information
                </Typography>
                <Typography>Email: {formData.contactInfo.email}</Typography>
                <Typography>Phone: {formData.contactInfo.phone}</Typography>
                {formData.contactInfo.website && <Typography>Website: {formData.contactInfo.website}</Typography>}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Address
                </Typography>
                <Typography>
                  {formData.address.street}, {formData.address.city}, {formData.address.state} - {formData.address.pincode}, {formData.address.country}
                </Typography>
              </Grid>
              
              {(formData.businessInfo.gstNumber || formData.businessInfo.panNumber) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Business Information
                  </Typography>
                  {formData.businessInfo.gstNumber && <Typography>GST: {formData.businessInfo.gstNumber}</Typography>}
                  {formData.businessInfo.panNumber && <Typography>PAN: {formData.businessInfo.panNumber}</Typography>}
                  {formData.businessInfo.registrationNumber && <Typography>Registration: {formData.businessInfo.registrationNumber}</Typography>}
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Card sx={{ maxWidth: 800, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              DentOS
            </Typography>
            <Typography variant="h5" gutterBottom>
              Organization Setup
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your own organization to get started with DentOS
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              You're currently in the default organization. Complete this setup to create your own organization.
            </Alert>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrganizationSetup; 