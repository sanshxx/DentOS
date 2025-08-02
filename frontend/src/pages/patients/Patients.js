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

const Patients = () => {
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
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, [page, rowsPerPage, filters]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // In a real application, you would fetch this data from your API
      // For now, we'll use mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockPatients = [
        { id: 1, name: 'Rahul Sharma', phone: '9876543210', email: 'rahul.sharma@example.com', gender: 'Male', age: 35, address: 'Mumbai, Maharashtra', clinic: 'Mumbai Central', registrationDate: '2023-01-15' },
        { id: 2, name: 'Priya Patel', phone: '9876543211', email: 'priya.patel@example.com', gender: 'Female', age: 28, address: 'Delhi, Delhi', clinic: 'Delhi Heights', registrationDate: '2023-02-20' },
        { id: 3, name: 'Amit Singh', phone: '9876543212', email: 'amit.singh@example.com', gender: 'Male', age: 42, address: 'Bangalore, Karnataka', clinic: 'Bangalore Central', registrationDate: '2023-03-05' },
        { id: 4, name: 'Neha Gupta', phone: '9876543213', email: 'neha.gupta@example.com', gender: 'Female', age: 31, address: 'Chennai, Tamil Nadu', clinic: 'Chennai Heights', registrationDate: '2023-03-18' },
        { id: 5, name: 'Vikram Mehta', phone: '9876543214', email: 'vikram.mehta@example.com', gender: 'Male', age: 45, address: 'Hyderabad, Telangana', clinic: 'Hyderabad Central', registrationDate: '2023-04-02' },
        { id: 6, name: 'Sneha Verma', phone: '9876543215', email: 'sneha.verma@example.com', gender: 'Female', age: 29, address: 'Pune, Maharashtra', clinic: 'Pune Heights', registrationDate: '2023-04-15' },
        { id: 7, name: 'Rajesh Kumar', phone: '9876543216', email: 'rajesh.kumar@example.com', gender: 'Male', age: 38, address: 'Kolkata, West Bengal', clinic: 'Kolkata Central', registrationDate: '2023-05-01' },
        { id: 8, name: 'Ananya Desai', phone: '9876543217', email: 'ananya.desai@example.com', gender: 'Female', age: 26, address: 'Ahmedabad, Gujarat', clinic: 'Ahmedabad Heights', registrationDate: '2023-05-12' },
        { id: 9, name: 'Suresh Reddy', phone: '9876543218', email: 'suresh.reddy@example.com', gender: 'Male', age: 50, address: 'Jaipur, Rajasthan', clinic: 'Jaipur Central', registrationDate: '2023-06-03' },
        { id: 10, name: 'Pooja Sharma', phone: '9876543219', email: 'pooja.sharma@example.com', gender: 'Female', age: 33, address: 'Lucknow, Uttar Pradesh', clinic: 'Lucknow Heights', registrationDate: '2023-06-20' },
        { id: 11, name: 'Kiran Joshi', phone: '9876543220', email: 'kiran.joshi@example.com', gender: 'Male', age: 41, address: 'Chandigarh, Punjab', clinic: 'Chandigarh Central', registrationDate: '2023-07-05' },
        { id: 12, name: 'Meera Iyer', phone: '9876543221', email: 'meera.iyer@example.com', gender: 'Female', age: 27, address: 'Bhopal, Madhya Pradesh', clinic: 'Bhopal Heights', registrationDate: '2023-07-10' }
      ];
      
      // Apply filters
      let filteredPatients = [...mockPatients];
      
      if (filters.gender) {
        filteredPatients = filteredPatients.filter(patient => patient.gender === filters.gender);
      }
      
      if (filters.ageGroup) {
        switch (filters.ageGroup) {
          case 'below18':
            filteredPatients = filteredPatients.filter(patient => patient.age < 18);
            break;
          case '18to30':
            filteredPatients = filteredPatients.filter(patient => patient.age >= 18 && patient.age <= 30);
            break;
          case '31to45':
            filteredPatients = filteredPatients.filter(patient => patient.age >= 31 && patient.age <= 45);
            break;
          case '46to60':
            filteredPatients = filteredPatients.filter(patient => patient.age >= 46 && patient.age <= 60);
            break;
          case 'above60':
            filteredPatients = filteredPatients.filter(patient => patient.age > 60);
            break;
          default:
            break;
        }
      }
      
      if (filters.clinic) {
        filteredPatients = filteredPatients.filter(patient => patient.clinic === filters.clinic);
      }
      
      // Apply search
      if (searchTerm) {
        filteredPatients = filteredPatients.filter(patient => 
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Calculate pagination
      setTotalPatients(filteredPatients.length);
      setTotalPages(Math.ceil(filteredPatients.length / rowsPerPage));
      
      // Slice for current page
      const startIndex = (page - 1) * rowsPerPage;
      const paginatedPatients = filteredPatients.slice(startIndex, startIndex + rowsPerPage);
      
      setPatients(paginatedPatients);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
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

  const handleDeletePatient = () => {
    // In a real application, you would call your API to delete the patient
    toast.success(`Patient ${selectedPatient.name} deleted successfully`);
    handleActionClose();
    fetchPatients();
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
    navigate('/invoices/create', { state: { patientId: selectedPatient.id } });
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
    { field: 'clinic', headerName: 'Clinic', width: 180 },
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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

      <Card sx={{ mb: 3, borderRadius: 2 }}>
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
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1,
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
                        <MenuItem value="Mumbai Central">Mumbai Central</MenuItem>
                        <MenuItem value="Delhi Heights">Delhi Heights</MenuItem>
                        <MenuItem value="Bangalore Central">Bangalore Central</MenuItem>
                        <MenuItem value="Chennai Heights">Chennai Heights</MenuItem>
                        <MenuItem value="Hyderabad Central">Hyderabad Central</MenuItem>
                        <MenuItem value="Pune Heights">Pune Heights</MenuItem>
                        <MenuItem value="Kolkata Central">Kolkata Central</MenuItem>
                        <MenuItem value="Ahmedabad Heights">Ahmedabad Heights</MenuItem>
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

      <Card sx={{ height: 600, borderRadius: 2 }}>
        <DataGrid
          rows={patients}
          columns={columns}
          pageSize={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          loading={loading}
          components={{
            Pagination: () => (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {patients.length} of {totalPatients} patients
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={rowsPerPage}
                      onChange={handleRowsPerPageChange}
                      displayEmpty
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
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
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