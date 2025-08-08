import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, Grid, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Alert, Tooltip, Card, CardContent,
  CardMedia, Divider, Rating, Switch, FormControlLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MedicalServices as MedicalServicesIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

const Treatments = () => {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  
  // Form state for adding/editing treatments
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    price: '',
    duration: '',
    isActive: true,
    requiredEquipment: [],
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTreatments();
  }, [page, rowsPerPage, searchTerm, categoryFilter, priceRangeFilter]);

  const fetchTreatments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      if (priceRangeFilter && priceRangeFilter !== 'all') {
        const [min, max] = priceRangeFilter.split('-');
        if (min) queryParams.append('minPrice', min);
        if (max) queryParams.append('maxPrice', max);
      }
      queryParams.append('page', page + 1);
      queryParams.append('limit', rowsPerPage);
      
      // Make API call
      const response = await axios.get(`${API_URL}/treatments?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTreatments(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching treatments:', err);
      setError(err.response?.data?.message || 'Failed to load treatments');
      setLoading(false);
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch treatments');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handlePriceRangeFilterChange = (event) => {
    setPriceRangeFilter(event.target.value);
    setPage(0);
  };

  const handleOpenForm = (treatment = null) => {
    if (treatment) {
      setFormData({
        ...treatment
      });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        code: '',
        category: '',
        description: '',
        price: '',
        duration: '',
        isActive: true,
        requiredEquipment: [],
        notes: ''
      });
      setIsEditing(false);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'isActive') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'requiredEquipment') {
      // Handle equipment as an array
      setFormData({
        ...formData,
        requiredEquipment: value.split(',').map(item => item.trim())
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFormSubmit = async () => {
    // Basic validation
    const errors = {};
    if (!formData.name) errors.name = 'Treatment name is required';
    if (!formData.code) errors.code = 'Treatment code is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.duration) errors.duration = 'Duration is required';
    
    // Price validation
    if (formData.price && isNaN(formData.price)) {
      errors.price = 'Price must be a number';
    }
    
    // Duration validation
    if (formData.duration && isNaN(formData.duration)) {
      errors.duration = 'Duration must be a number';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data for API
      const treatmentData = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration)
      };
      
      let response;
      
      if (isEditing) {
        // Update existing treatment
        response = await axios.put(`${API_URL}/treatments/${formData._id}`, treatmentData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Update local state
        const updatedTreatments = treatments.map(treatment => {
          if (treatment._id === formData._id) {
            return response.data.data;
          }
          return treatment;
        });
        
        setTreatments(updatedTreatments);
        toast.success(`${formData.name} updated successfully`);
      } else {
        // Create new treatment
        response = await axios.post(`${API_URL}/treatments`, treatmentData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Update local state with the new treatment from API
        setTreatments([...treatments, response.data.data]);
        toast.success(`${formData.name} added successfully`);
      }
      
      handleCloseForm();
    } catch (err) {
      console.error('Error saving treatment:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save treatment');
    }
  };

  const handleDeleteTreatment = async (id) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Call API to delete the treatment
        await axios.delete(`${API_URL}/treatments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Update local state
        const updatedTreatments = treatments.filter(treatment => treatment._id !== id);
        setTreatments(updatedTreatments);
        toast.success('Treatment deleted successfully');
      } catch (err) {
        console.error('Error deleting treatment:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to delete treatment');
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/treatments/${id}`);
  };

  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Filter treatments based on search term and filters
  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = 
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || treatment.category === categoryFilter;
    
    let matchesPriceRange = true;
    if (priceRangeFilter !== 'all') {
      switch (priceRangeFilter) {
        case 'under-2000':
          matchesPriceRange = treatment.price < 2000;
          break;
        case '2000-5000':
          matchesPriceRange = treatment.price >= 2000 && treatment.price <= 5000;
          break;
        case '5000-10000':
          matchesPriceRange = treatment.price > 5000 && treatment.price <= 10000;
          break;
        case 'above-10000':
          matchesPriceRange = treatment.price > 10000;
          break;
        default:
          matchesPriceRange = true;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  // Pagination
  const paginatedTreatments = filteredTreatments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get unique categories for filters
  const categories = ['all', ...new Set(treatments.map(treatment => treatment.category))];

  // Render status chip with appropriate color
  const renderStatusChip = (isActive) => {
    return (
      <Chip 
        label={isActive ? 'Active' : 'Inactive'} 
        color={isActive ? 'success' : 'default'} 
        size="small" 
      />
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Treatment Management
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Add Treatment
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search Treatments"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={priceRangeFilter}
                  onChange={handlePriceRangeFilterChange}
                  label="Price Range"
                >
                  <MenuItem value="all">All Prices</MenuItem>
                  <MenuItem value="under-2000">Under ₹2,000</MenuItem>
                  <MenuItem value="2000-5000">₹2,000 - ₹5,000</MenuItem>
                  <MenuItem value="5000-10000">₹5,000 - ₹10,000</MenuItem>
                  <MenuItem value="above-10000">Above ₹10,000</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchTreatments}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Treatment</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTreatments.length > 0 ? (
                paginatedTreatments.map((treatment) => (
                  <TableRow key={treatment._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MedicalServicesIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2">
                            {treatment.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {treatment.code}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={treatment.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {treatment.duration} mins
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatPrice(treatment.price)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{renderStatusChip(treatment.isActive)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleViewDetails(treatment._id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenForm(treatment)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteTreatment(treatment._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No treatments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTreatments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>

      {/* Add/Edit Treatment Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Treatment' : 'Add New Treatment'}</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Treatment Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Treatment Code"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  error={!!formErrors.code}
                  helperText={formErrors.code}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required error={!!formErrors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    label="Category"
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    <MenuItem value="Diagnostic">Diagnostic</MenuItem>
                    <MenuItem value="Preventive">Preventive</MenuItem>
                    <MenuItem value="Restorative">Restorative</MenuItem>
                    <MenuItem value="Endodontic">Endodontic</MenuItem>
                    <MenuItem value="Periodontic">Periodontic</MenuItem>
                    <MenuItem value="Prosthodontic">Prosthodontic</MenuItem>
                    <MenuItem value="Oral Surgery">Oral Surgery</MenuItem>
                    <MenuItem value="Orthodontic">Orthodontic</MenuItem>
                    <MenuItem value="Cosmetic">Cosmetic</MenuItem>
                    <MenuItem value="Pediatric">Pediatric</MenuItem>
                  </Select>
                  {formErrors.category && (
                    <Typography variant="caption" color="error">
                      {formErrors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Active"
                  sx={{ mt: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleFormChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  margin="normal"
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleFormChange}
                  error={!!formErrors.duration}
                  helperText={formErrors.duration}
                  margin="normal"
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Required Equipment"
                  name="requiredEquipment"
                  value={formData.requiredEquipment ? formData.requiredEquipment.join(', ') : ''}
                  onChange={handleFormChange}
                  margin="normal"
                  helperText="Enter equipment items separated by commas"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  placeholder="https://example.com/image.jpg"
                  helperText="Enter a URL for the treatment image"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleFormSubmit} color="primary">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Treatments;