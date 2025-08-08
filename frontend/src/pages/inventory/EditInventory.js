import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  InputAdornment, Divider, CircularProgress, Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EditInventory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    category: '',
    description: '',
    unit: '',
    currentStock: '',
    minStockLevel: '',
    price: '',
    supplier: '',
    location: '',
    expiryDate: '',
    isActive: true
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Categories for inventory items
  const categories = [
    'Restorative Materials',
    'Endodontic Supplies',
    'Orthodontic Supplies',
    'Periodontal Supplies',
    'Prosthodontic Materials',
    'Instruments',
    'Disposables',
    'Infection Control',
    'Office Supplies',
    'Equipment',
    'Medications',
    'Other'
  ];
  
  // Units for inventory items
  const units = [
    'Piece',
    'Box',
    'Pack',
    'Kit',
    'Set',
    'Bottle',
    'Tube',
    'Syringe',
    'Cartridge',
    'Gram',
    'Milliliter',
    'Liter',
    'Pair',
    'Roll',
    'Sheet',
    'Other'
  ];
  
  // Fetch inventory item data
  useEffect(() => {
    const fetchInventoryItem = async () => {
      setFetchLoading(true);
      setError(null);
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch inventory item from API
        const response = await axios.get(`${API_URL}/inventory/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Map API response to form data
        const item = response.data.data;
        setFormData({
          itemName: item.itemName,
          itemCode: item.itemCode,
          category: item.category,
          description: item.description,
          unit: item.unit,
          currentStock: item.currentStock,
          minStockLevel: item.minimumStock || item.minStockLevel,
          price: item.unitPrice || item.price,
          supplier: item.supplier?.name || item.supplier,
          location: item.location,
          expiryDate: item.expiryDate,
          isActive: item.isActive !== undefined ? item.isActive : true
        });
        setFetchLoading(false);
      } catch (err) {
        console.error('Error fetching inventory item:', err);
        setError(err.response?.data?.message || 'Failed to load inventory item. Please try again.');
        setFetchLoading(false);
      }
    };
    
    fetchInventoryItem();
  }, [id]);
  
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
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!formData.itemCode.trim()) newErrors.itemCode = 'Item code is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (!formData.currentStock) {
      newErrors.currentStock = 'Current stock is required';
    } else if (isNaN(formData.currentStock) || Number(formData.currentStock) < 0) {
      newErrors.currentStock = 'Current stock must be a non-negative number';
    }
    
    if (!formData.minStockLevel) {
      newErrors.minStockLevel = 'Minimum stock level is required';
    } else if (isNaN(formData.minStockLevel) || Number(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = 'Minimum stock level must be a non-negative number';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a non-negative number';
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
      
      // Prepare data for API
      const inventoryData = {
        itemName: formData.itemName,
        itemCode: formData.itemCode,
        category: formData.category,
        description: formData.description,
        unit: formData.unit,
        currentStock: Number(formData.currentStock),
        minimumStock: Number(formData.minStockLevel),
        unitPrice: Number(formData.price),
        supplier: formData.supplier,
        location: formData.location,
        expiryDate: formData.expiryDate,
        isActive: formData.isActive
      };
      
      // Call API to update inventory item
      await axios.put(`${API_URL}/inventory/${id}`, inventoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Inventory item updated successfully!');
      setLoading(false);
      navigate('/inventory');
    } catch (err) {
      console.error('Error updating inventory item:', err);
      setError(err.response?.data?.message || 'Failed to update inventory item. Please try again.');
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading inventory item...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/inventory')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            Edit Inventory Item
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
                  label="Item Name"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  error={!!errors.itemName}
                  helperText={errors.itemName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Code"
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleChange}
                  error={!!errors.itemCode}
                  helperText={errors.itemCode}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
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
                <FormControl fullWidth error={!!errors.unit} required>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    label="Unit"
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.unit && <FormHelperText>{errors.unit}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                />
              </Grid>
              
              {/* Stock Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Stock Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Current Stock"
                  name="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={handleChange}
                  InputProps={{
                    inputProps: { min: 0 },
                    endAdornment: formData.unit ? (
                      <InputAdornment position="end">{formData.unit}(s)</InputAdornment>
                    ) : null,
                  }}
                  error={!!errors.currentStock}
                  helperText={errors.currentStock}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Minimum Stock Level"
                  name="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  InputProps={{
                    inputProps: { min: 0 },
                    endAdornment: formData.unit ? (
                      <InputAdornment position="end">{formData.unit}(s)</InputAdornment>
                    ) : null,
                  }}
                  error={!!errors.minStockLevel}
                  helperText={errors.minStockLevel}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Price per Unit (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    inputProps: { min: 0, step: 0.01 },
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
              
              {/* Additional Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Additional Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Storage Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="E.g., Cabinet A, Shelf 2"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
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
              
              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/inventory')}
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
                  {loading ? 'Saving...' : 'Update Inventory Item'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditInventory;