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
  }, []);

  const fetchTreatments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would fetch from the API
      // For now, we'll simulate an API call
      setTimeout(() => {
        // Mock API call
        const mockResponse = {
          success: true,
          count: 8,
          data: [
            {
              _id: '60d21b4667d0d8992e610c20',
              name: 'Dental Checkup',
              code: 'CHK-001',
              category: 'Preventive',
              description: 'Regular dental checkup including examination and cleaning',
              price: 1500,
              duration: 30,
              isActive: true,
              requiredEquipment: ['Basic Dental Kit', 'Dental Mirror', 'Probe'],
              notes: 'Recommended every 6 months for adults and children',
              imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVudGFsJTIwY2hlY2t1cHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
            },
            {
              _id: '60d21b4667d0d8992e610c21',
              name: 'Root Canal Treatment',
              code: 'RCT-001',
              category: 'Endodontic',
              description: 'Procedure to remove infected pulp and seal the tooth',
              price: 8000,
              duration: 90,
              isActive: true,
              requiredEquipment: ['Endodontic Files', 'Apex Locator', 'Gutta Percha'],
              notes: 'May require multiple sessions depending on the case',
              imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZGVudGFsJTIwdHJlYXRtZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60'
            },
            {
              _id: '60d21b4667d0d8992e610c22',
              name: 'Teeth Whitening',
              code: 'WHT-001',
              category: 'Cosmetic',
              description: 'Professional teeth whitening procedure',
              price: 5000,
              duration: 60,
              isActive: true,
              requiredEquipment: ['Whitening Gel', 'UV Light', 'Mouth Guard'],
              notes: 'Results may vary depending on initial teeth condition',
              imageUrl: 'https://images.unsplash.com/photo-1581585095852-97958afb5b6c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8dGVldGglMjB3aGl0ZW5pbmd8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60'
            },
            {
              _id: '60d21b4667d0d8992e610c23',
              name: 'Dental Implant',
              code: 'IMP-001',
              category: 'Surgical',
              description: 'Surgical placement of a dental implant to replace missing tooth',
              price: 25000,
              duration: 120,
              isActive: true,
              requiredEquipment: ['Implant Kit', 'Surgical Drill', 'Abutment'],
              notes: 'Requires healing period of 3-6 months before final crown placement',
              imageUrl: 'https://images.unsplash.com/photo-1579083578954-4105c0f3d0b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGRlbnRhbCUyMGltcGxhbnR8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60'
            },
            {
              _id: '60d21b4667d0d8992e610c24',
              name: 'Orthodontic Braces',
              code: 'ORT-001',
              category: 'Orthodontic',
              description: 'Traditional metal braces for teeth alignment',
              price: 35000,
              duration: 45,
              isActive: true,
              requiredEquipment: ['Brackets', 'Archwires', 'Elastic Bands'],
              notes: 'Treatment duration typically 18-24 months with monthly adjustments',
              imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGJyYWNlc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
            },
            {
              _id: '60d21b4667d0d8992e610c25',
              name: 'Wisdom Tooth Extraction',
              code: 'EXT-001',
              category: 'Surgical',
              description: 'Surgical removal of impacted wisdom teeth',
              price: 7500,
              duration: 60,
              isActive: true,
              requiredEquipment: ['Extraction Forceps', 'Surgical Drill', 'Suture Kit'],
              notes: 'Recovery period of 7-10 days with proper post-operative care',
              imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fHRvb3RoJTIwZXh0cmFjdGlvbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
            },
            {
              _id: '60d21b4667d0d8992e610c26',
              name: 'Dental Crown',
              code: 'CRW-001',
              category: 'Restorative',
              description: 'Custom-made crown to restore damaged tooth',
              price: 12000,
              duration: 75,
              isActive: true,
              requiredEquipment: ['Crown Kit', 'Impression Material', 'Temporary Crown'],
              notes: 'Requires two appointments - preparation and fitting',
              imageUrl: 'https://images.unsplash.com/photo-1579083578954-4105c0f3d0b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGRlbnRhbCUyMGNyb3dufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60'
            },
            {
              _id: '60d21b4667d0d8992e610c27',
              name: 'Pediatric Fluoride Treatment',
              code: 'PED-001',
              category: 'Preventive',
              description: 'Fluoride application for children to prevent cavities',
              price: 1000,
              duration: 15,
              isActive: false,
              requiredEquipment: ['Fluoride Gel', 'Applicator Tray'],
              notes: 'Recommended every 6 months for children aged 2-18',
              imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGNoaWxkJTIwZGVudGlzdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
            }
          ]
        };
        
        setTreatments(mockResponse.data);
        setLoading(false);
      }, 1000); // Simulate loading delay
    } catch (err) {
      console.error('Error fetching treatments:', err);
      setError('Failed to load treatment data. Please try again.');
      setLoading(false);
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

  const handleFormSubmit = () => {
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
    
    // In a real app, we would call the API to create/update the treatment
    if (isEditing) {
      // Update existing treatment
      const updatedTreatments = treatments.map(treatment => {
        if (treatment._id === formData._id) {
          return {
            ...formData,
            price: Number(formData.price),
            duration: Number(formData.duration)
          };
        }
        return treatment;
      });
      
      setTreatments(updatedTreatments);
      toast.success(`${formData.name} updated successfully`);
    } else {
      // Create new treatment
      const newTreatment = {
        ...formData,
        _id: `new-${Date.now()}`,
        price: Number(formData.price),
        duration: Number(formData.duration)
      };
      
      setTreatments([...treatments, newTreatment]);
      toast.success(`${formData.name} added successfully`);
    }
    
    handleCloseForm();
  };

  const handleDeleteTreatment = (id) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      // In a real app, we would call the API to delete the treatment
      const updatedTreatments = treatments.filter(treatment => treatment._id !== id);
      setTreatments(updatedTreatments);
      toast.success('Treatment deleted successfully');
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
                    <MenuItem value="Preventive">Preventive</MenuItem>
                    <MenuItem value="Restorative">Restorative</MenuItem>
                    <MenuItem value="Endodontic">Endodontic</MenuItem>
                    <MenuItem value="Periodontic">Periodontic</MenuItem>
                    <MenuItem value="Orthodontic">Orthodontic</MenuItem>
                    <MenuItem value="Surgical">Surgical</MenuItem>
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