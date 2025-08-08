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

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    branchCode: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    type: '',
    status: 'active',
    openingHours: '',
    facilities: [],
    staffCount: 1,
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
      // Fetch clinics from the API
      const response = await axios.get(`${API_URL}/clinics`, {
        params: {
          // Add any query parameters if needed
          search: searchTerm || undefined,
          sort: '-createdAt'
        }
      });
      
      setClinics(response.data.data);
      setLoading(false);
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
        branchCode: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        type: '',
        status: 'active',
        openingHours: '',
        facilities: [],
        staffCount: 1,
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

  const handleFormSubmit = async () => {
    // Basic validation
    const errors = {};
    if (!formData.name) errors.name = 'Clinic name is required';
    if (!formData.branchCode) errors.branchCode = 'Branch code is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.zipCode) errors.zipCode = 'Pincode is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.type) errors.type = 'Clinic type is required';
    if (!formData.staffCount) errors.staffCount = 'Number of chairs is required';
    
    // Pincode validation
    const pincodeRegex = /^[0-9]{6}$/;
    if (formData.zipCode && !pincodeRegex.test(formData.zipCode)) {
      errors.zipCode = 'Please enter a valid 6-digit pincode';
    }
    
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
    
    try {
      // Prepare clinic data in the format expected by the backend
      const clinicData = {
        name: formData.name,
        branchCode: formData.branchCode || `BR-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        type: formData.type,
        address: {
          street: formData.address || 'Default Street Address',
          city: formData.city || 'Default City',
          state: formData.state || 'Default State',
          pincode: formData.zipCode || '123456',
          country: 'India'
        },
        contactNumbers: [formData.phone || '1234567890'],
        email: formData.email || 'default@example.com',
        status: formData.status ? formData.status.toLowerCase() : 'active',
        operatingHours: {
          monday: {
            isOpen: true,
            openTime: '09:00',
            closeTime: '18:00'
          }
        },
        facilities: formData.facilities || [],
        numberOfChairs: formData.staffCount || 1,
        description: formData.description,
        imageUrl: formData.imageUrl
      };
      
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.email) {
        toast.error('Please fill in all required fields (Name, Phone, Email)');
        return;
      }
      
      if (isEditing) {
        // Update existing clinic
        const response = await axios.put(`${API_URL}/clinics/${formData._id}`, clinicData);
        
        // Update the local state with the updated clinic
        const updatedClinics = clinics.map(clinic => 
          clinic._id === formData._id ? response.data.data : clinic
        );
        setClinics(updatedClinics);
        toast.success(`${formData.name} updated successfully`);
      } else {
        // Create new clinic
        const response = await axios.post(`${API_URL}/clinics`, clinicData);
        
        // Add the new clinic to the local state
        setClinics([...clinics, response.data.data]);
        toast.success(`${formData.name} added successfully`);
      }
      
      handleCloseForm();
    } catch (err) {
      console.error('Error saving clinic:', err);
      toast.error(err.response?.data?.message || 'Failed to save clinic');
    }
  };

  const handleDeleteClinic = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinic?')) {
      try {
        // Call the API to delete the clinic
        await axios.delete(`${API_URL}/clinics/${id}`);
        
        // Update the local state
        const updatedClinics = clinics.filter(clinic => clinic._id !== id);
        setClinics(updatedClinics);
        toast.success('Clinic deleted successfully');
      } catch (err) {
        console.error('Error deleting clinic:', err);
        toast.error(err.response?.data?.message || 'Failed to delete clinic');
      }
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
                          {clinic.address ? 
                            (typeof clinic.address === 'string' ? clinic.address :
                             `${clinic.address.street || ''}, ${clinic.address.city || ''}, ${clinic.address.state || ''} - ${clinic.address.pincode || ''}`) :
                            `${clinic.city || ''}, ${clinic.state || ''} - ${clinic.zipCode || ''}`
                          }
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
                          {clinic.address ? 
                            (typeof clinic.address === 'string' ? clinic.address :
                             `${clinic.address.street || ''}, ${clinic.address.city || ''}`) :
                            'Address not available'
                          }
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
                <TextField
                  fullWidth
                  label="Branch Code"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleFormChange}
                  error={!!formErrors.branchCode}
                  helperText={formErrors.branchCode || "Unique code for this clinic branch (required)"}
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
                  label="Pincode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleFormChange}
                  error={!!formErrors.zipCode}
                  helperText={formErrors.zipCode || "Enter 6-digit pincode"}
                  margin="normal"
                  required
                  inputProps={{ maxLength: 6, pattern: "[0-9]{6}" }}
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
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="under maintenance">Under Maintenance</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
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
                  label="Number of Chairs"
                  name="staffCount"
                  type="number"
                  value={formData.staffCount}
                  onChange={handleFormChange}
                  margin="normal"
                  required
                  error={!!formErrors.staffCount}
                  helperText={formErrors.staffCount || "Number of dental chairs in the clinic"}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Facilities</InputLabel>
                  <Select
                    name="facilities"
                    multiple
                    value={formData.facilities || []}
                    onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                    label="Facilities"
                    renderValue={(selected) => selected.join(', ')}
                  >
                    <MenuItem value="X-Ray">X-Ray</MenuItem>
                    <MenuItem value="OPG">OPG</MenuItem>
                    <MenuItem value="CBCT">CBCT</MenuItem>
                    <MenuItem value="Implant Center">Implant Center</MenuItem>
                    <MenuItem value="Root Canal Specialist">Root Canal Specialist</MenuItem>
                    <MenuItem value="Orthodontics">Orthodontics</MenuItem>
                    <MenuItem value="Pediatric Dentistry">Pediatric Dentistry</MenuItem>
                    <MenuItem value="Laser Dentistry">Laser Dentistry</MenuItem>
                    <MenuItem value="Cosmetic Dentistry">Cosmetic Dentistry</MenuItem>
                  </Select>
                  <Typography variant="caption" color="textSecondary">
                    Select all available facilities at this clinic
                  </Typography>
                </FormControl>
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