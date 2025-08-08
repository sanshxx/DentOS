import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  InputAdornment, Divider, Chip, IconButton, Alert, CircularProgress,
  List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AddTreatment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    price: '',
    duration: '',
    requiredEquipment: [],
    notes: '',
    isActive: true
  });
  
  // Equipment input state
  const [newEquipment, setNewEquipment] = useState('');
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Categories for dental treatments
  const categories = [
    'Diagnostic',
    'Preventive',
    'Restorative',
    'Endodontic',
    'Periodontic',
    'Prosthodontic',
    'Oral Surgery',
    'Orthodontic',
    'Cosmetic',
    'Pediatric'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleAddEquipment = () => {
    if (newEquipment.trim() !== '') {
      if (!formData.requiredEquipment.includes(newEquipment.trim())) {
        setFormData({
          ...formData,
          requiredEquipment: [...formData.requiredEquipment, newEquipment.trim()]
        });
      }
      setNewEquipment('');
    }
  };
  
  const handleRemoveEquipment = (index) => {
    const updatedEquipment = [...formData.requiredEquipment];
    updatedEquipment.splice(index, 1);
    setFormData({
      ...formData,
      requiredEquipment: updatedEquipment
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Treatment name is required';
    if (!formData.code.trim()) newErrors.code = 'Treatment code is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(formData.duration) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }
    
    // Validate category is in the allowed list
    if (formData.category && !categories.includes(formData.category)) {
      newErrors.category = `Invalid category. Please select from: ${categories.join(', ')}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data for API - convert strings to numbers where needed
      const apiData = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration)
      };
      
      // Make API call to add treatment
      await axios.post(`${API_URL}/treatments`, apiData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Treatment added successfully!');
      setLoading(false);
      navigate('/treatments');
    } catch (err) {
      console.error('Error adding treatment:', err);
      
      // Get specific error message from response
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to add treatment. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/treatments')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            Add New Treatment
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Treatment Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Treatment Code *"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  error={!!errors.code}
                  helperText={errors.code}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category *"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="isActive"
                    value={formData.isActive}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description *"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Enter a detailed description of the treatment procedure..."
                  error={!!errors.description}
                  helperText={errors.description || "Please provide a detailed description of the treatment"}
                  required
                />
              </Grid>
              
              {/* Pricing and Duration */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Pricing and Duration
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price (₹) *"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.price}
                  helperText={errors.price}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes) *"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon />
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.duration}
                  helperText={errors.duration}
                  required
                />
              </Grid>
              
              {/* Required Equipment */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Required Equipment
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Equipment"
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEquipment();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddEquipment}
                    startIcon={<AddIcon />}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
                
                {formData.requiredEquipment.length > 0 ? (
                  <List>
                    {formData.requiredEquipment.map((item, index) => (
                      <ListItem key={index} divider={index < formData.requiredEquipment.length - 1}>
                        <ListItemText primary={item} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleRemoveEquipment(index)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No equipment added yet. Add equipment required for this treatment.
                  </Typography>
                )}
              </Grid>
              
              {/* Additional Notes */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Additional Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Add any additional notes or instructions for this treatment"
                />
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/treatments')}
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Treatment'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddTreatment;