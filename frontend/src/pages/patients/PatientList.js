import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Mock data for patients (replace with API call)
const MOCK_PATIENTS = [
  {
    id: '123456',
    firstName: 'Rahul',
    lastName: 'Sharma',
    phone: '9876543210',
    email: 'rahul.sharma@example.com',
    age: 38,
    gender: 'male',
    lastVisit: '2023-05-15',
    nextAppointment: '2023-06-20',
    clinicName: 'Dental Care - Bandra',
  },
  {
    id: '123457',
    firstName: 'Priya',
    lastName: 'Patel',
    phone: '9876543211',
    email: 'priya.patel@example.com',
    age: 29,
    gender: 'female',
    lastVisit: '2023-05-10',
    nextAppointment: null,
    clinicName: 'Dental Care - Andheri',
  },
  {
    id: '123458',
    firstName: 'Amit',
    lastName: 'Singh',
    phone: '9876543212',
    email: 'amit.singh@example.com',
    age: 45,
    gender: 'male',
    lastVisit: '2023-04-22',
    nextAppointment: '2023-06-15',
    clinicName: 'Dental Care - Powai',
  },
  {
    id: '123459',
    firstName: 'Neha',
    lastName: 'Gupta',
    phone: '9876543213',
    email: 'neha.gupta@example.com',
    age: 32,
    gender: 'female',
    lastVisit: '2023-05-18',
    nextAppointment: '2023-06-25',
    clinicName: 'Dental Care - Bandra',
  },
  {
    id: '123460',
    firstName: 'Vikram',
    lastName: 'Malhotra',
    phone: '9876543214',
    email: 'vikram.malhotra@example.com',
    age: 50,
    gender: 'male',
    lastVisit: '2023-05-05',
    nextAppointment: '2023-06-10',
    clinicName: 'Dental Care - Juhu',
  },
  {
    id: '123461',
    firstName: 'Ananya',
    lastName: 'Desai',
    phone: '9876543215',
    email: 'ananya.desai@example.com',
    age: 27,
    gender: 'female',
    lastVisit: '2023-05-12',
    nextAppointment: null,
    clinicName: 'Dental Care - Andheri',
  },
  {
    id: '123462',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    phone: '9876543216',
    email: 'rajesh.kumar@example.com',
    age: 42,
    gender: 'male',
    lastVisit: '2023-04-30',
    nextAppointment: '2023-06-18',
    clinicName: 'Dental Care - Powai',
  },
  {
    id: '123463',
    firstName: 'Meera',
    lastName: 'Reddy',
    phone: '9876543217',
    email: 'meera.reddy@example.com',
    age: 35,
    gender: 'female',
    lastVisit: '2023-05-20',
    nextAppointment: '2023-06-22',
    clinicName: 'Dental Care - Bandra',
  },
  {
    id: '123464',
    firstName: 'Sanjay',
    lastName: 'Joshi',
    phone: '9876543218',
    email: 'sanjay.joshi@example.com',
    age: 48,
    gender: 'male',
    lastVisit: '2023-05-08',
    nextAppointment: '2023-06-12',
    clinicName: 'Dental Care - Juhu',
  },
  {
    id: '123465',
    firstName: 'Kavita',
    lastName: 'Sharma',
    phone: '9876543219',
    email: 'kavita.sharma@example.com',
    age: 30,
    gender: 'female',
    lastVisit: '2023-05-14',
    nextAppointment: null,
    clinicName: 'Dental Care - Andheri',
  },
];

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        // const response = await axios.get('/api/patients');
        // setPatients(response.data);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setPatients(MOCK_PATIENTS);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again.');
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Handle menu open
  const handleMenuOpen = (event, patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle view patient
  const handleViewPatient = () => {
    handleMenuClose();
    navigate(`/patients/${selectedPatient.id}`);
  };

  // Handle edit patient
  const handleEditPatient = () => {
    handleMenuClose();
    navigate(`/patients/edit/${selectedPatient.id}`);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  // Handle delete patient
  const handleDeletePatient = async () => {
    try {
      setDeletingPatient(true);

      // In a real app, this would be an API call
      // await axios.delete(`/api/patients/${selectedPatient.id}`);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setPatients(patients.filter(patient => patient.id !== selectedPatient.id));
      toast.success('Patient deleted successfully');
    } catch (err) {
      console.error('Error deleting patient:', err);
      toast.error('Failed to delete patient');
    } finally {
      setDeletingPatient(false);
      handleDeleteDialogClose();
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const searchString = searchTerm.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchString) ||
      patient.lastName.toLowerCase().includes(searchString) ||
      patient.phone.includes(searchString) ||
      patient.email.toLowerCase().includes(searchString) ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchString)
    );
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not Scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Patients
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/patients/add"
          >
            Add Patient
          </Button>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <TextField
              placeholder="Search patients..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '40%' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box>
              <Tooltip title="Filter">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sort">
                <IconButton>
                  <SortIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Age/Gender</TableCell>
                  <TableCell>Last Visit</TableCell>
                  <TableCell>Next Appointment</TableCell>
                  <TableCell>Clinic</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>
                        <Box sx={{ fontWeight: 'medium' }}>
                          {patient.firstName} {patient.lastName}
                        </Box>
                      </TableCell>
                      <TableCell>+91 {patient.phone}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>
                        {patient.age} / {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O'}
                      </TableCell>
                      <TableCell>{formatDate(patient.lastVisit)}</TableCell>
                      <TableCell>
                        {patient.nextAppointment ? (
                          <Chip
                            label={formatDate(patient.nextAppointment)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Not Scheduled"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>{patient.clinicName}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/patients/${patient.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/patients/edit/${patient.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Options">
                          <IconButton
                            size="small"
                            onClick={(event) => handleMenuOpen(event, patient)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No patients found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredPatients.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      </Box>

      {/* Patient Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewPatient}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditPatient}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Patient
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Patient
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedPatient?.firstName} {selectedPatient?.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={deletingPatient}>
            Cancel
          </Button>
          <Button
            onClick={handleDeletePatient}
            color="error"
            disabled={deletingPatient}
            startIcon={deletingPatient && <CircularProgress size={20} />}
          >
            {deletingPatient ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientList;