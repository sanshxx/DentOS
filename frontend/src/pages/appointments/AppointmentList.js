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
  FormControl,
  InputLabel,
  Select,
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
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';

// Mock data for appointments (replace with API call)
const MOCK_APPOINTMENTS = [
  {
    id: 'APT001',
    patientId: '123456',
    patientName: 'Rahul Sharma',
    patientPhone: '9876543210',
    doctorId: 'DOC001',
    doctorName: 'Dr. Priya Patel',
    clinicId: 1,
    clinicName: 'Dental Care - Bandra',
    date: '2023-06-20',
    startTime: '10:00',
    endTime: '10:30',
    status: 'scheduled',
    type: 'checkup',
    notes: 'Regular dental checkup',
    createdAt: '2023-05-15T10:30:00Z',
  },
  {
    id: 'APT002',
    patientId: '123457',
    patientName: 'Priya Patel',
    patientPhone: '9876543211',
    doctorId: 'DOC002',
    doctorName: 'Dr. Amit Singh',
    clinicId: 2,
    clinicName: 'Dental Care - Andheri',
    date: '2023-06-21',
    startTime: '11:00',
    endTime: '12:00',
    status: 'confirmed',
    type: 'treatment',
    notes: 'Root canal treatment - second session',
    createdAt: '2023-05-16T09:15:00Z',
  },
  {
    id: 'APT003',
    patientId: '123458',
    patientName: 'Amit Singh',
    patientPhone: '9876543212',
    doctorId: 'DOC003',
    doctorName: 'Dr. Neha Gupta',
    clinicId: 3,
    clinicName: 'Dental Care - Powai',
    date: '2023-06-15',
    startTime: '14:00',
    endTime: '14:30',
    status: 'completed',
    type: 'checkup',
    notes: 'Post-treatment follow-up',
    createdAt: '2023-05-10T14:20:00Z',
  },
  {
    id: 'APT004',
    patientId: '123459',
    patientName: 'Neha Gupta',
    patientPhone: '9876543213',
    doctorId: 'DOC001',
    doctorName: 'Dr. Priya Patel',
    clinicId: 1,
    clinicName: 'Dental Care - Bandra',
    date: '2023-06-25',
    startTime: '16:00',
    endTime: '17:00',
    status: 'scheduled',
    type: 'treatment',
    notes: 'Wisdom tooth extraction',
    createdAt: '2023-05-18T11:45:00Z',
  },
  {
    id: 'APT005',
    patientId: '123460',
    patientName: 'Vikram Malhotra',
    patientPhone: '9876543214',
    doctorId: 'DOC004',
    doctorName: 'Dr. Rajesh Kumar',
    clinicId: 4,
    clinicName: 'Dental Care - Juhu',
    date: '2023-06-10',
    startTime: '09:30',
    endTime: '10:00',
    status: 'cancelled',
    type: 'consultation',
    notes: 'Initial consultation for dental implants',
    createdAt: '2023-05-05T16:30:00Z',
  },
  {
    id: 'APT006',
    patientId: '123461',
    patientName: 'Ananya Desai',
    patientPhone: '9876543215',
    doctorId: 'DOC002',
    doctorName: 'Dr. Amit Singh',
    clinicId: 2,
    clinicName: 'Dental Care - Andheri',
    date: '2023-06-22',
    startTime: '13:00',
    endTime: '13:30',
    status: 'confirmed',
    type: 'checkup',
    notes: 'Regular dental checkup and cleaning',
    createdAt: '2023-05-12T10:00:00Z',
  },
  {
    id: 'APT007',
    patientId: '123462',
    patientName: 'Rajesh Kumar',
    patientPhone: '9876543216',
    doctorId: 'DOC003',
    doctorName: 'Dr. Neha Gupta',
    clinicId: 3,
    clinicName: 'Dental Care - Powai',
    date: '2023-06-18',
    startTime: '15:00',
    endTime: '16:00',
    status: 'scheduled',
    type: 'treatment',
    notes: 'Dental crown fitting',
    createdAt: '2023-04-30T09:45:00Z',
  },
  {
    id: 'APT008',
    patientId: '123463',
    patientName: 'Meera Reddy',
    patientPhone: '9876543217',
    doctorId: 'DOC001',
    doctorName: 'Dr. Priya Patel',
    clinicId: 1,
    clinicName: 'Dental Care - Bandra',
    date: '2023-06-22',
    startTime: '11:30',
    endTime: '12:00',
    status: 'confirmed',
    type: 'checkup',
    notes: 'Six-month dental checkup',
    createdAt: '2023-05-20T13:15:00Z',
  },
  {
    id: 'APT009',
    patientId: '123464',
    patientName: 'Sanjay Joshi',
    patientPhone: '9876543218',
    doctorId: 'DOC004',
    doctorName: 'Dr. Rajesh Kumar',
    clinicId: 4,
    clinicName: 'Dental Care - Juhu',
    date: '2023-06-12',
    startTime: '10:00',
    endTime: '11:00',
    status: 'completed',
    type: 'treatment',
    notes: 'Dental filling - two cavities',
    createdAt: '2023-05-08T11:30:00Z',
  },
  {
    id: 'APT010',
    patientId: '123465',
    patientName: 'Kavita Sharma',
    patientPhone: '9876543219',
    doctorId: 'DOC002',
    doctorName: 'Dr. Amit Singh',
    clinicId: 2,
    clinicName: 'Dental Care - Andheri',
    date: '2023-06-28',
    startTime: '14:30',
    endTime: '15:00',
    status: 'scheduled',
    type: 'consultation',
    notes: 'Consultation for orthodontic treatment',
    createdAt: '2023-05-14T15:45:00Z',
  },
];

// Appointment types
const APPOINTMENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'checkup', label: 'Checkup' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'emergency', label: 'Emergency' },
];

// Appointment statuses
const APPOINTMENT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

const AppointmentList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        // const response = await axios.get('/api/appointments');
        // setAppointments(response.data);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setAppointments(MOCK_APPOINTMENTS);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again.');
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Handle menu open
  const handleMenuOpen = (event, appointment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle view appointment
  const handleViewAppointment = () => {
    handleMenuClose();
    navigate(`/appointments/${selectedAppointment.id}`);
  };

  // Handle edit appointment
  const handleEditAppointment = () => {
    handleMenuClose();
    navigate(`/appointments/edit/${selectedAppointment.id}`);
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

  // Handle delete appointment
  const handleDeleteAppointment = async () => {
    try {
      setDeletingAppointment(true);

      // In a real app, this would be an API call
      // await axios.delete(`/api/appointments/${selectedAppointment.id}`);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setAppointments(appointments.filter(appointment => appointment.id !== selectedAppointment.id));
      toast.success('Appointment deleted successfully');
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast.error('Failed to delete appointment');
    } finally {
      setDeletingAppointment(false);
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

  // Handle filter type change
  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  // Handle filter status change
  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  // Filter appointments based on search term and filters
  const filteredAppointments = appointments.filter(appointment => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = (
      appointment.patientName.toLowerCase().includes(searchString) ||
      appointment.doctorName.toLowerCase().includes(searchString) ||
      appointment.patientPhone.includes(searchString) ||
      appointment.id.toLowerCase().includes(searchString)
    );

    const matchesType = filterType === 'all' || appointment.type === filterType;
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <EventIcon fontSize="small" />;
      case 'confirmed':
        return <CheckCircleIcon fontSize="small" />;
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      case 'no-show':
        return <AccessTimeIcon fontSize="small" />;
      default:
        return null;
    }
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
            Appointments
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/appointments/add"
              sx={{ mr: 2 }}
            >
              New Appointment
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EventIcon />}
              component={RouterLink}
              to="/appointments/calendar"
            >
              Calendar View
            </Button>
          </Box>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              placeholder="Search appointments..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', sm: '40%' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="appointment-type-label">Type</InputLabel>
                <Select
                  labelId="appointment-type-label"
                  id="appointment-type"
                  value={filterType}
                  label="Type"
                  onChange={handleFilterTypeChange}
                >
                  {APPOINTMENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="appointment-status-label">Status</InputLabel>
                <Select
                  labelId="appointment-status-label"
                  id="appointment-status"
                  value={filterStatus}
                  label="Status"
                  onChange={handleFilterStatusChange}
                >
                  {APPOINTMENT_STATUSES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Clinic</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>{appointment.id}</TableCell>
                      <TableCell>
                        <Box sx={{ fontWeight: 'medium' }}>
                          {appointment.patientName}
                        </Box>
                        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          +91 {appointment.patientPhone}
                        </Box>
                      </TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>{formatDate(appointment.date)}</TableCell>
                      <TableCell>
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(appointment.status)}
                          label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          size="small"
                          color={getStatusChipColor(appointment.status)}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>{appointment.clinicName}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/appointments/edit/${appointment.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Options">
                          <IconButton
                            size="small"
                            onClick={(event) => handleMenuOpen(event, appointment)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredAppointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No appointments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredAppointments.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      </Box>

      {/* Appointment Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewAppointment}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditAppointment}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Appointment
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Appointment
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the appointment for {selectedAppointment?.patientName} on {selectedAppointment ? formatDate(selectedAppointment.date) : ''} at {selectedAppointment ? formatTime(selectedAppointment.startTime) : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={deletingAppointment}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAppointment}
            color="error"
            disabled={deletingAppointment}
            startIcon={deletingAppointment && <CircularProgress size={20} />}
          >
            {deletingAppointment ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentList;