import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, Grid, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Alert, Tooltip, Avatar, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

const Staff = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state for adding/editing staff
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    specialization: '',
    qualification: '',
    experience: '',
    address: '',
    joinDate: '',
    status: 'active',
    password: '',
    primaryClinic: '',
    clinics: [],
    profileImage: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchClinics();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (roleFilter !== 'all') queryParams.append('role', roleFilter);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      queryParams.append('page', page + 1); // API uses 1-indexed pages
      queryParams.append('limit', rowsPerPage);
      
      // Fetch staff from API
      const response = await axios.get(`${API_URL}/staff?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStaff(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff data. Please try again.');
      toast.error('Failed to load staff data');
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_URL}/clinics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) setClinics(res.data.data || []);
    } catch (e) {
      console.error('Error fetching clinics:', e);
    }
  };
  
  // Staff roles for filtering
  const STAFF_ROLES = [
    { value: 'all', label: 'All Roles' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'nurse', label: 'Dental Assistant' },
    { value: 'manager', label: 'Office Manager' },
    { value: 'hygienist', label: 'Hygienist' },
    { value: 'technician', label: 'Lab Technician' }
  ];
  
  // Staff statuses for filtering
  const STAFF_STATUSES = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on_leave', label: 'On Leave' }
  ];
  
  // Staff specializations for dentists
  const DENTIST_SPECIALIZATIONS = [
    { value: '', label: 'General Dentist' },
    { value: 'Orthodontist', label: 'Orthodontist' },
    { value: 'Periodontist', label: 'Periodontist' },
    { value: 'Endodontist', label: 'Endodontist' },
    { value: 'Oral Surgeon', label: 'Oral Surgeon' },
    { value: 'Prosthodontist', label: 'Prosthodontist' },
    { value: 'Pediatric Dentist', label: 'Pediatric Dentist' }
  ];
  
  // Error handling function
  const handleError = (err) => {
    console.error('Error fetching staff:', err);
    setError('Failed to load staff data. Please try again.');
    setLoading(false);
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

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleOpenForm = (staffMember = null) => {
    if (staffMember) {
      setFormData({
        ...staffMember,
        password: '********' // Placeholder for security
      });
      setIsEditing(true);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'dentist',
        specialization: '',
        qualification: '',
        experience: '',
        address: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        password: '',
        primaryClinic: '',
        clinics: [],
        profileImage: ''
      });
      setIsEditing(false);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setFormErrors({});
    setShowPassword(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
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
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.role) errors.role = 'Role is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Password validation for new staff
    if (!isEditing && !formData.password) {
      errors.password = 'Password is required for new staff';
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
      const staffData = { ...formData };
      
      // Convert experience to number if provided
      if (staffData.experience && staffData.experience !== '') {
        staffData.experience = parseInt(staffData.experience, 10);
      } else {
        delete staffData.experience;
      }
      
      // Remove empty fields to avoid validation issues
      Object.keys(staffData).forEach(key => {
        if (staffData[key] === '' || staffData[key] === null || staffData[key] === undefined) {
          delete staffData[key];
        }
      });
      
      // Ensure clinic arrays are correct
      if (Array.isArray(staffData.clinics) && staffData.clinics.length === 0) {
        delete staffData.clinics;
      }
      
      if (isEditing) {
        // Update existing staff
        await axios.put(`${API_URL}/staff/${formData._id}`, staffData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        toast.success(`${formData.firstName} ${formData.lastName}'s information updated successfully`);
      } else {
        // Create new staff
        await axios.post(`${API_URL}/staff`, staffData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        toast.success(`${formData.firstName} ${formData.lastName} added to staff`);
      }
      
      // Refresh staff list
      fetchStaff();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving staff:', err);
      toast.error(err.response?.data?.message || 'Failed to save staff information');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Call API to delete staff
        await axios.delete(`${API_URL}/staff/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success('Staff member deleted successfully');
        
        // Refresh staff list
        fetchStaff();
      } catch (err) {
        console.error('Error deleting staff:', err);
        toast.error(err.response?.data?.message || 'Failed to delete staff member');
      }
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Filter staff based on search term and filters
  const filteredStaff = staff.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const paginatedStaff = filteredStaff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get unique roles and statuses for filters
  const roles = ['all', ...new Set(staff.map(member => member.role))];
  const statuses = ['all', ...new Set(staff.map(member => member.status))];

  // Render status chip with appropriate color
  const renderStatusChip = (status) => {
    let color = 'default';
    let displayLabel = status;
    
    switch (status) {
      case 'active':
        color = 'success';
        displayLabel = 'Active';
        break;
      case 'on_leave':
        color = 'warning';
        displayLabel = 'On Leave';
        break;
      case 'inactive':
        color = 'error';
        displayLabel = 'Inactive';
        break;
      default:
        color = 'default';
        displayLabel = status;
    }
    
    return (
      <Chip 
        label={displayLabel} 
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
              Staff Management
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Add Staff
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
                label="Search Staff"
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
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  label="Role"
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role === 'all' ? 'All Roles' : role}
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
                onClick={fetchStaff}
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
                <TableCell>Staff</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Qualification</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStaff.length > 0 ? (
                paginatedStaff.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={member.profileImage} 
                          alt={`${member.firstName} ${member.lastName}`}
                          sx={{ mr: 2 }}
                        >
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {member.firstName} {member.lastName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {member.specialization && `${member.specialization}`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{member.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{member.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.qualification}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {member.experience && `Experience: ${member.experience}`}
                      </Typography>
                    </TableCell>
                    <TableCell>{renderStatusChip(member.status)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenForm(member)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteStaff(member._id)}
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
                    No staff members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredStaff.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {/* Add/Edit Staff Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
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
                <FormControl fullWidth margin="normal" required error={!!formErrors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    label="Role"
                  >
                    <MenuItem value="">Select Role</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="dentist">Dentist</MenuItem>
                    <MenuItem value="receptionist">Receptionist</MenuItem>
                    <MenuItem value="nurse">Dental Assistant</MenuItem>
                    <MenuItem value="hygienist">Hygienist</MenuItem>
                    <MenuItem value="technician">Lab Technician</MenuItem>
                  </Select>
                  {formErrors.role && (
                    <Typography variant="caption" color="error">
                      {formErrors.role}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Primary Clinic</InputLabel>
                <Select
                  name="primaryClinic"
                  value={formData.primaryClinic || ''}
                  onChange={handleFormChange}
                  label="Primary Clinic"
                >
                  <MenuItem value="">None</MenuItem>
                  {clinics.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Additional Clinics</InputLabel>
                <Select
                  multiple
                  name="clinics"
                  value={formData.clinics || []}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinics: e.target.value }))}
                  label="Additional Clinics"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected || []).map((id) => {
                        const c = clinics.find(cl => cl._id === id);
                        return <Chip key={id} label={c ? c.name : id} />
                      })}
                    </Box>
                  )}
                >
                  {clinics.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  helperText="Required for Dentists"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Qualification"
                  name="qualification"
                  value={formData.qualification || ''}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Experience"
                  name="experience"
                  value={formData.experience || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  placeholder="e.g. 5 years"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Join Date"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
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
                    <MenuItem value="on_leave">On Leave</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Profile Image URL"
                  name="profileImage"
                  value={formData.profileImage || ''}
                  onChange={handleFormChange}
                  margin="normal"
                  placeholder="https://example.com/image.jpg"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={handleFormChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password || (isEditing ? 'Leave blank to keep current password' : '')}
                  margin="normal"
                  required={!isEditing}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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

export default Staff;