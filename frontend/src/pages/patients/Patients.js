import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Pagination,
  Grid,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CalendarMonth as CalendarIcon,
  MedicalServices as MedicalServicesIcon,
  Receipt as ReceiptIcon,
  Male as MaleIcon,
  Female as FemaleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Patients = () => {
  const theme = useTheme();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);
  const [filters, setFilters] = useState({
    gender: '',
    ageGroup: '',
    clinic: ''
  });
  const [clinics, setClinics] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    fetchClinics();
  }, [page, rowsPerPage, filters]);

  const fetchClinics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/clinics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClinics(response.data.data || []);
    } catch (err) {
      console.error('Error fetching clinics:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching patients...');
      
      // Build query parameters for filtering and pagination
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', rowsPerPage);
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (filters.gender) {
        queryParams.append('gender', filters.gender);
      }
      
      if (filters.ageGroup) {
        queryParams.append('ageGroup', filters.ageGroup);
      }
      
      if (filters.clinic) {
        queryParams.append('clinic', filters.clinic);
      }
      
      // Fetch patients from API
      const token = localStorage.getItem('token');
      console.log('API URL:', `${API_URL}/patients?${queryParams.toString()}`);
      console.log('Token exists:', !!token);
      
      const response = await axios.get(`${API_URL}/patients?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Format the response data
      const formattedPatients = response.data.data.map(patient => ({
        id: patient._id,
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        gender: patient.gender,
        age: patient.age,
        address: patient.address,
        registeredClinic: patient.registeredClinic,
        registrationDate: new Date(patient.createdAt).toISOString().split('T')[0],
        // Preserve original data for edit form
        originalData: patient
      }));
      
      setPatients(formattedPatients);
      setTotalPatients(response.data.total);
      setTotalPages(Math.ceil(response.data.total / rowsPerPage));
      setError(null);
      
      // Apply search filter if needed (backend handles other filters)
      let finalPatients = formattedPatients;
      
      if (searchTerm) {
        finalPatients = formattedPatients.filter(patient => 
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setPatients(finalPatients);
      setError(null);
      console.log('✅ Patients loaded successfully:', finalPatients.length);
    } catch (err) {
      console.error('❌ Error fetching patients:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(`Failed to load patients: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleSearch = () => {
    fetchPatients();
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
    setPage(1); // Reset to first page on filter change
  };

  const handleActionClick = (event, patient) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedPatient(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when changing rows per page
  };

  const handleViewPatient = () => {
    navigate(`/patients/${selectedPatient.id}`);
    handleActionClose();
  };

  const handleEditPatient = () => {
    navigate(`/patients/${selectedPatient.id}/edit`);
    handleActionClose();
  };

  const handleDeletePatient = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await axios.delete(`${API_URL}/patients/${selectedPatient.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`Patient ${selectedPatient.name} deleted successfully`);
        handleActionClose();
        fetchPatients(); // Refresh the list
      } else {
        toast.error('Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete patient';
      toast.error(errorMessage);
    }
  };

  const handleAddAppointment = () => {
    navigate('/appointments/add', { state: { patientId: selectedPatient.id } });
    handleActionClose();
  };

  const handleAddTreatment = () => {
    navigate('/treatments/add', { state: { patientId: selectedPatient.id } });
    handleActionClose();
  };

  const handleCreateInvoice = () => {
    navigate('/billing/create', { state: { patientId: selectedPatient.id } });
    handleActionClose();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.row.gender === 'Male' ? (
            <MaleIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
          ) : (
            <FemaleIcon fontSize="small" color="secondary" sx={{ mr: 1 }} />
          )}
          {params.value}
        </Box>
      ),
    },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'age', headerName: 'Age', width: 80 },
    { 
      field: 'clinic', 
      headerName: 'Clinic', 
      width: 180,
      valueGetter: (params) => {
        return params.row.registeredClinic?.name || 'Not Assigned';
      },
    },
    {
      field: 'registrationDate',
      headerName: 'Registration Date',
      width: 180,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          aria-label="actions"
          onClick={(event) => handleActionClick(event, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  if (loading && patients.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexShrink: 0 }}>
        <Typography variant="h4">Patients</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/patients/add')}
        >
          Add Patient
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Section */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: 2, 
        flexShrink: 0,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name, phone, or email"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        size="small"
                      >
                        Search
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleFilterClick}
                >
                  Filters
                  {Object.values(filters).some(value => value !== '') && (
                    <Chip
                      size="small"
                      label={Object.values(filters).filter(value => value !== '').length}
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Button>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={handleFilterClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                      mt: 1.5,
                      width: 300,
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1,
                        color: theme.palette.text.primary,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      },
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                    Filter Patients
                  </Typography>
                  <Divider />
                  
                  <Box sx={{ p: 2 }}>
                    <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={filters.gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                        label="Gender"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                      <InputLabel>Age Group</InputLabel>
                      <Select
                        value={filters.ageGroup}
                        onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                        label="Age Group"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="below18">Below 18</MenuItem>
                        <MenuItem value="18to30">18-30</MenuItem>
                        <MenuItem value="31to45">31-45</MenuItem>
                        <MenuItem value="46to60">46-60</MenuItem>
                        <MenuItem value="above60">Above 60</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                      <InputLabel>Clinic</InputLabel>
                      <Select
                        value={filters.clinic}
                        onChange={(e) => handleFilterChange('clinic', e.target.value)}
                        label="Clinic"
                      >
                        <MenuItem value="">All</MenuItem>
                        {clinics.map((clinic) => (
                          <MenuItem key={clinic._id} value={clinic.name}>
                            {clinic.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setFilters({
                            gender: '',
                            ageGroup: '',
                            clinic: ''
                          });
                        }}
                      >
                        Clear All
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleFilterClose}
                      >
                        Apply Filters
                      </Button>
                    </Box>
                  </Box>
                </Menu>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card sx={{ 
        flex: 1, 
        borderRadius: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 0, 
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <DataGrid
          rows={patients}
          columns={columns}
          pageSize={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          loading={loading}
          sx={{
            flex: 1,
            minHeight: 0,
            border: 'none',
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.paper,
            },
            '& .MuiDataGrid-row': {
              backgroundColor: theme.palette.background.paper,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.background.default,
              borderBottom: `2px solid ${theme.palette.divider}`,
              color: theme.palette.text.primary,
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: theme.palette.background.paper,
            },
            '& .MuiDataGrid-main': {
              overflow: 'hidden',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: theme.palette.background.default,
              borderTop: `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-toolbarContainer': {
              backgroundColor: theme.palette.background.default,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
          }}
                      components={{
              Pagination: () => (
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: theme.palette.background.default,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {patients.length} of {totalPatients} patients
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl variant="outlined" size="small">
                      <Select
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                        displayEmpty
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                          },
                          '& .MuiSelect-icon': {
                            color: theme.palette.text.primary,
                          }
                        }}
                      >
                        <MenuItem value={5}>5 per page</MenuItem>
                        <MenuItem value={10}>10 per page</MenuItem>
                        <MenuItem value={25}>25 per page</MenuItem>
                      </Select>
                    </FormControl>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      shape="rounded"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: theme.palette.text.primary,
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>
              ),
            }}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleViewPatient}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditPatient}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeletePatient}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleAddAppointment}>
          <ListItemIcon>
            <CalendarIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Add Appointment</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddTreatment}>
          <ListItemIcon>
            <MedicalServicesIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText>Add Treatment</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCreateInvoice}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Create Invoice</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Patients;