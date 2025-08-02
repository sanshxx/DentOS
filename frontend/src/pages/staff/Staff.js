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

const Staff = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    status: 'Active',
    password: '',
    clinic: {
      _id: '',
      name: ''
    },
    profileImage: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would fetch from the API
      // For now, we'll simulate an API call
      setTimeout(() => {
        // Mock API call
        const mockResponse = {
          success: true,
          count: 6,
          data: [
            {
              _id: '60d21b4667d0d8992e610c90',
              firstName: 'Rajesh',
              lastName: 'Sharma',
              email: 'rajesh.sharma@dentalcrm.com',
              phone: '9876543210',
              role: 'Dentist',
              specialization: 'Orthodontist',
              qualification: 'MDS - Orthodontics',
              experience: '12 years',
              address: '123 Main Street, Mumbai',
              joinDate: '2020-01-15',
              status: 'Active',
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              profileImage: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            {
              _id: '60d21b4667d0d8992e610c91',
              firstName: 'Priya',
              lastName: 'Patel',
              email: 'priya.patel@dentalcrm.com',
              phone: '9876543211',
              role: 'Dentist',
              specialization: 'Endodontist',
              qualification: 'MDS - Conservative Dentistry & Endodontics',
              experience: '8 years',
              address: '456 Park Avenue, Delhi',
              joinDate: '2021-03-10',
              status: 'Active',
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              profileImage: 'https://randomuser.me/api/portraits/women/2.jpg'
            },
            {
              _id: '60d21b4667d0d8992e610c92',
              firstName: 'Amit',
              lastName: 'Kumar',
              email: 'amit.kumar@dentalcrm.com',
              phone: '9876543212',
              role: 'Receptionist',
              specialization: '',
              qualification: 'Bachelor of Commerce',
              experience: '5 years',
              address: '789 Lake View, Bangalore',
              joinDate: '2022-01-05',
              status: 'Active',
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
            },
            {
              _id: '60d21b4667d0d8992e610c93',
              firstName: 'Neha',
              lastName: 'Gupta',
              email: 'neha.gupta@dentalcrm.com',
              phone: '9876543213',
              role: 'Dental Assistant',
              specialization: '',
              qualification: 'Diploma in Dental Hygiene',
              experience: '3 years',
              address: '101 Green Park, Chennai',
              joinDate: '2022-06-20',
              status: 'Active',
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              profileImage: 'https://randomuser.me/api/portraits/women/4.jpg'
            },
            {
              _id: '60d21b4667d0d8992e610c94',
              firstName: 'Vikram',
              lastName: 'Singh',
              email: 'vikram.singh@dentalcrm.com',
              phone: '9876543214',
              role: 'Manager',
              specialization: '',
              qualification: 'MBA - Healthcare Management',
              experience: '10 years',
              address: '202 Blue Hills, Hyderabad',
              joinDate: '2020-05-15',
              status: 'Active',
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              profileImage: 'https://randomuser.me/api/portraits/men/5.jpg'
            },
            {
              _id: '60d21b4667d0d8992e610c95',
              firstName: 'Ananya',
              lastName: 'Desai',
              email: 'ananya.desai@dentalcrm.com',
              phone: '9876543215',
              role: 'Dentist',
              specialization: 'Periodontist',
              qualification: 'MDS - Periodontics',
              experience: '7 years',
              address: '303 Silver Towers, Pune',
              joinDate: '2021-08-10',
              status: 'On Leave',
              clinic: {
                _id: '60d21b4667d0d8992e610c10',
                name: 'Main Clinic'
              },
              profileImage: 'https://randomuser.me/api/portraits/women/6.jpg'
            }
          ]
        };
        
        setStaff(mockResponse.data);
        setLoading(false);
      }, 1000); // Simulate loading delay
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff data. Please try again.');
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
        role: '',
        specialization: '',
        qualification: '',
        experience: '',
        address: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        password: '',
        clinic: {
          _id: '60d21b4667d0d8992e610c10', // Default clinic
          name: 'Main Clinic'
        },
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

  const handleFormSubmit = () => {
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
    
    // In a real app, we would call the API to create/update the staff
    if (isEditing) {
      // Update existing staff
      const updatedStaff = staff.map(member => {
        if (member._id === formData._id) {
          return {
            ...formData,
            password: undefined // Don't include password in the state
          };
        }
        return member;
      });
      
      setStaff(updatedStaff);
      toast.success(`${formData.firstName} ${formData.lastName}'s information updated successfully`);
    } else {
      // Create new staff
      const newStaff = {
        ...formData,
        _id: `new-${Date.now()}`,
        password: undefined // Don't include password in the state
      };
      
      setStaff([...staff, newStaff]);
      toast.success(`${formData.firstName} ${formData.lastName} added to staff`);
    }
    
    handleCloseForm();
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      // In a real app, we would call the API to delete the staff
      const updatedStaff = staff.filter(member => member._id !== id);
      setStaff(updatedStaff);
      toast.success('Staff member deleted successfully');
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
    
    switch (status) {
      case 'Active':
        color = 'success';
        break;
      case 'On Leave':
        color = 'warning';
        break;
      case 'Inactive':
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
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Dentist">Dentist</MenuItem>
                    <MenuItem value="Receptionist">Receptionist</MenuItem>
                    <MenuItem value="Dental Assistant">Dental Assistant</MenuItem>
                    <MenuItem value="Hygienist">Hygienist</MenuItem>
                    <MenuItem value="Lab Technician">Lab Technician</MenuItem>
                  </Select>
                  {formErrors.role && (
                    <Typography variant="caption" color="error">
                      {formErrors.role}
                    </Typography>
                  )}
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
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="On Leave">On Leave</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
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