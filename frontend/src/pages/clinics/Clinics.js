import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, Grid, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Alert, Tooltip, Card, CardContent,
  CardMedia, Divider, Rating
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as AccessTimeIcon,
  FilterList as FilterListIcon,
  Business as BusinessIcon,
  Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const Clinics = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  
  // Form state for adding/editing clinics
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    type: '',
    status: 'Active',
    openingHours: '',
    facilities: [],
    staffCount: 0,
    establishedDate: '',
    description: '',
    imageUrl: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would fetch from the API
      // For now, we'll simulate an API call
      setTimeout(() => {
        // Mock API call
        const mockResponse = {
          success: true,
          count: 5,
          data: [
            {
              _id: '60d21b4667d0d8992e610c10',
              name: 'Main Clinic',
              address: '123 Dental Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              zipCode: '400001',
              phone: '022-12345678',
              email: 'main@dentalcrm.com',
              type: 'Main Branch',
              status: 'Active',
              openingHours: 'Mon-Sat: 9:00 AM - 7:00 PM',
              facilities: ['X-Ray', 'Root Canal', 'Orthodontics', 'Cosmetic Dentistry'],
              staffCount: 15,
              establishedDate: '2018-01-15',
              description: 'Our flagship dental clinic with state-of-the-art facilities and experienced staff.',
              imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVudGFsJTIwY2xpbmljfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
              rating: 4.8
            },
            {
              _id: '60d21b4667d0d8992e610c11',
              name: 'South Delhi Branch',
              address: '456 Dental Avenue',
              city: 'Delhi',
              state: 'Delhi',
              zipCode: '110001',
              phone: '011-87654321',
              email: 'delhi@dentalcrm.com',
              type: 'Branch',
              status: 'Active',
              openingHours: 'Mon-Sat: 10:00 AM - 8:00 PM',
              facilities: ['X-Ray', 'Root Canal', 'Pediatric Dentistry'],
              staffCount: 10,
              establishedDate: '2019-05-20',
              description: 'Conveniently located in South Delhi with a focus on family dental care.',
              imageUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZGVudGFsJTIwY2xpbmljfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
              rating: 4.5
            },
            {
              _id: '60d21b4667d0d8992e610c12',
              name: 'Bangalore Center',
              address: '789 Dental Park',
              city: 'Bangalore',
              state: 'Karnataka',
              zipCode: '560001',
              phone: '080-23456789',
              email: 'bangalore@dentalcrm.com',
              type: 'Branch',
              status: 'Active',
              openingHours: 'Mon-Sun: 8:00 AM - 9:00 PM',
              facilities: ['X-Ray', 'Root Canal', 'Implants', 'Cosmetic Dentistry', 'Laser Treatment'],
              staffCount: 12,
              establishedDate: '2020-02-10',
              description: 'A modern dental clinic in the heart of Bangalore with extended working hours.',
              imageUrl: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8ZGVudGFsJTIwY2xpbmljfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
              rating: 4.7
            },
            {
              _id: '60d21b4667d0d8992e610c13',
              name: 'Pune Express Clinic',
              address: '101 Quick Dental Road',
              city: 'Pune',
              state: 'Maharashtra',
              zipCode: '411001',
              phone: '020-34567890',
              email: 'pune@dentalcrm.com',
              type: 'Express',
              status: 'Active',
              openingHours: 'Mon-Sat: 8:00 AM - 6:00 PM',
              facilities: ['X-Ray', 'Emergency Care', 'Basic Treatments'],
              staffCount: 6,
              establishedDate: '2021-03-15',
              description: 'Specializing in quick dental procedures and emergency dental care.',
              imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGRlbnRhbCUyMGNsaW5pY3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
              rating: 4.2
            },
            {
              _id: '60d21b4667d0d8992e610c14',
              name: 'Chennai Dental Hub',
              address: '202 Dental Complex',
              city: 'Chennai',
              state: 'Tamil Nadu',
              zipCode: '600001',
              phone: '044-45678901',
              email: 'chennai@dentalcrm.com',
              type: 'Branch',
              status: 'Under Renovation',
              openingHours: 'Temporarily Closed',
              facilities: ['X-Ray', 'Root Canal', 'Orthodontics', 'Pediatric Dentistry'],
              staffCount: 8,
              establishedDate: '2019-11-05',
              description: 'Currently undergoing renovation to enhance patient experience and services.',
              imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGRlbnRhbCUyMGNsaW5pY3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
              rating: 4.4
            }
          ]
        };
        
        setClinics(mockResponse.data);
        setLoading(false);
      }, 1000); // Simulate loading delay
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError('Failed to load clinic data. Please try again.');
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

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleOpenForm = (clinic = null) => {
    if (clinic) {
      setFormData({
        ...clinic
      });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        type: '',
        status: 'Active',
        openingHours: '',
        facilities: [],
        staffCount: 0,
        establishedDate: new Date().toISOString().split('T')[0],
        description: '',
        imageUrl: ''
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
    const { name, value } = e.target;
    
    if (name === 'facilities') {
      // Handle facilities as an array
      setFormData({
        ...formData,
        facilities: value.split(',').map(facility => facility.trim())
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
    if (!formData.name) errors.name = 'Clinic name is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.type) errors.type = 'Clinic type is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^[0-9-\s]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // In a real app, we would call the API to create/update the clinic
    if (isEditing) {
      // Update existing clinic
      const updatedClinics = clinics.map(clinic => {
        if (clinic._id === formData._id) {
          return formData;
        }
        return clinic;
      });
      
      setClinics(updatedClinics);
      toast.success(`${formData.name} updated successfully`);
    } else {
      // Create new clinic
      const newClinic = {
        ...formData,
        _id: `new-${Date.now()}`,
        rating: 0 // New clinics start with 0 rating
      };
      
      setClinics([...clinics, newClinic]);
      toast.success(`${formData.name} added successfully`);
    }
    
    handleCloseForm();
  };

  const handleDeleteClinic = (id) => {
    if (window.confirm('Are you sure you want to delete this clinic?')) {
      // In a real app, we would call the API to delete the clinic
      const updatedClinics = clinics.filter(clinic => clinic._id !== id);
      setClinics(updatedClinics);
      toast.success('Clinic deleted successfully');
    }
  };

  // Filter clinics based on search term and filters
  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch = 
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || clinic.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || clinic.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const paginatedClinics = filteredClinics.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get unique types and statuses for filters
  const types = ['all', ...new Set(clinics.map(clinic => clinic.type))];
  const statuses = ['all', ...new Set(clinics.map(clinic => clinic.status))];

  // Render status chip with appropriate color
  const renderStatusChip = (status) => {
    let color = 'default';
    
    switch (status) {
      case 'Active':
        color = 'success';
        break;
      case 'Under Renovation':
        color = 'warning';
        break;
      case 'Closed':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
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
              Clinic Management
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleViewModeChange('grid')}
                color={viewMode === 'grid' ? 'primary' : 'inherit'}
              >
                Grid View
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleViewModeChange('table')}
                color={viewMode === 'table' ? 'primary' : 'inherit'}
              >
                Table View
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
              >
                Add Clinic
              </Button>
            </Box>
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
                label="Search Clinics"
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
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  label="Type"
                >
                  {types.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchClinics}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {viewMode === 'grid' ? (
          // Grid View
          <Grid container spacing={3}>
            {paginatedClinics.length > 0 ? (
              paginatedClinics.map((clinic) => (
                <Grid item xs={12} sm={6} md={4} key={clinic._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={clinic.imageUrl || 'https://via.placeholder.com/300x160?text=Dental+Clinic'}
                      alt={clinic.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {clinic.name}
                        </Typography>
                        {renderStatusChip(clinic.status)}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating 
                          value={clinic.rating || 0} 
                          precision={0.1} 
                          readOnly 
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({clinic.rating || 0})
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <LocationIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {clinic.address}, {clinic.city}, {clinic.state} - {clinic.zipCode}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{clinic.phone}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{clinic.email}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{clinic.openingHours}</Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Type:</strong> {clinic.type}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Staff:</strong> {clinic.staffCount} members
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Facilities:</strong> {clinic.facilities.join(', ')}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {clinic.description}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenForm(clinic)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClinic(clinic._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">No clinics found</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        ) : (
          // Table View
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Clinic</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClinics.length > 0 ? (
                  paginatedClinics.map((clinic) => (
                    <TableRow key={clinic._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="subtitle2">
                              {clinic.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating 
                                value={clinic.rating || 0} 
                                precision={0.1} 
                                readOnly 
                                size="small"
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({clinic.rating || 0})
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {clinic.city}, {clinic.state}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {clinic.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{clinic.phone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{clinic.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{clinic.type}</TableCell>
                      <TableCell>{renderStatusChip(clinic.status)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenForm(clinic)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteClinic(clinic._id)}
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
                      No clinics found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <TablePagination
            rowsPerPageOptions={[3, 6, 9, 12]}
            component="div"
            count={filteredClinics.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>

      {/* Add/Edit Clinic Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Clinic' : 'Add New Clinic'}</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Clinic Name"
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
                <FormControl fullWidth margin="normal" required error={!!formErrors.type}>
                  <InputLabel>Clinic Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    label="Clinic Type"
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="Main Branch">Main Branch</MenuItem>
                    <MenuItem value="Branch">Branch</MenuItem>
                    <MenuItem value="Express">Express</MenuItem>
                    <MenuItem value="Specialized">Specialized</MenuItem>
                  </Select>
                  {formErrors.type && (
                    <Typography variant="caption" color="error">
                      {formErrors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  error={!!formErrors.city}
                  helperText={formErrors.city}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  error={!!formErrors.state}
                  helperText={formErrors.state}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleFormChange}
                  error={!!formErrors.zipCode}
                  helperText={formErrors.zipCode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Opening Hours"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleFormChange}
                  margin="normal"
                  placeholder="e.g. Mon-Sat: 9:00 AM - 7:00 PM"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Under Renovation">Under Renovation</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Established Date"
                  name="establishedDate"
                  type="date"
                  value={formData.establishedDate || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Staff Count"
                  name="staffCount"
                  type="number"
                  value={formData.staffCount}
                  onChange={handleFormChange}
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Facilities"
                  name="facilities"
                  value={formData.facilities ? formData.facilities.join(', ') : ''}
                  onChange={handleFormChange}
                  margin="normal"
                  helperText="Enter facilities separated by commas (e.g. X-Ray, Root Canal, Orthodontics)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  multiline
                  rows={3}
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
                  helperText="Enter a URL for the clinic image"
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

export default Clinics;