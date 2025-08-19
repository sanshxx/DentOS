import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Pagination,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LocalPharmacy as PharmacyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { prescriptionAPI } from '../../api/prescriptions';
import { downloadPrescriptionPDF } from '../../utils/pdfPrescription';
import AddPrescription from './AddPrescription';
import EditPrescription from './EditPrescription';
import PrescriptionDetails from './PrescriptionDetails';
import { useAuth } from '../../context/AuthContext';

const Prescriptions = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination and filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Handle URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const patientIdParam = searchParams.get('patientId');
    const selectedPrescriptionParam = searchParams.get('selectedPrescription');
    const editPrescriptionParam = searchParams.get('editPrescription');
    
    if (patientIdParam) {
      setPatientId(patientIdParam);
    }
    
    if (selectedPrescriptionParam) {
      // Find the prescription and open view dialog
      const prescription = prescriptions.find(p => p._id === selectedPrescriptionParam);
      if (prescription) {
        setSelectedPrescription(prescription);
        setViewDialogOpen(true);
      }
    }
    
    if (editPrescriptionParam) {
      // Find the prescription and open edit dialog
      const prescription = prescriptions.find(p => p._id === editPrescriptionParam);
      if (prescription) {
        setSelectedPrescription(prescription);
        setEditDialogOpen(true);
      }
    }
  }, [location.search, prescriptions]);
  
  // Load prescriptions
  useEffect(() => {
    loadPrescriptions();
  }, [page, search, status, patientId, doctorId, dateFrom, dateTo]);
  
  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        search: search || undefined,
        status: status || undefined,
        patientId: patientId || undefined,
        doctorId: doctorId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      };
      
      const response = await prescriptionAPI.getPrescriptions(params);
      setPrescriptions(response.data.docs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to load prescriptions');
      console.error('Error loading prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddPrescription = async (prescriptionData) => {
    try {
      await prescriptionAPI.createPrescription(prescriptionData);
      setSuccess('Prescription created successfully');
      setAddDialogOpen(false);
      loadPrescriptions();
    } catch (err) {
      setError('Failed to create prescription');
      console.error('Error creating prescription:', err);
    }
  };
  
  const handleEditPrescription = async (id, prescriptionData) => {
    try {
      await prescriptionAPI.updatePrescription(id, prescriptionData);
      setSuccess('Prescription updated successfully');
      setEditDialogOpen(false);
      setSelectedPrescription(null);
      loadPrescriptions();
    } catch (err) {
      setError('Failed to update prescription');
      console.error('Error updating prescription:', err);
    }
  };
  
  const handleDeletePrescription = async () => {
    try {
      await prescriptionAPI.deletePrescription(selectedPrescription._id);
      setSuccess('Prescription deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedPrescription(null);
      loadPrescriptions();
    } catch (err) {
      setError('Failed to delete prescription');
      console.error('Error deleting prescription:', err);
    }
  };
  
  const handleIssuePrescriptionToPatient = async (id) => {
    try {
      await prescriptionAPI.issuePrescriptionToPatient(id);
      setSuccess('Prescription issued to patient successfully');
      loadPrescriptions();
    } catch (err) {
      setError('Failed to issue prescription to patient');
      console.error('Error issuing prescription to patient:', err);
    }
  };
  
  const handleDownloadPrescription = async (prescription) => {
    try {
      const full = (await prescriptionAPI.getPrescription(prescription._id))?.data || prescription;
      await downloadPrescriptionPDF(full);
      setSuccess('Prescription PDF downloaded successfully');
    } catch (err) {
      setError('Failed to download prescription');
      console.error('Error downloading prescription:', err);
    }
  };
  
  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setViewDialogOpen(true);
  };
  
  const handleEditPrescriptionClick = (prescription) => {
    setSelectedPrescription(prescription);
    setEditDialogOpen(true);
  };
  
  const handleDeletePrescriptionClick = (prescription) => {
    setSelectedPrescription(prescription);
    setDeleteDialogOpen(true);
  };
  
  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPatientId('');
    setDoctorId('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };
  
  const canManagePrescriptions = user?.role === 'admin' || user?.role === 'doctor';
  const canIssuePrescription = user?.role === 'admin' || user?.role === 'doctor';
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Prescription Management
        </Typography>
        {canManagePrescriptions && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Create Prescription
          </Button>
        )}
      </Box>
      
      {/* Action Legend */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Action Buttons Legend:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewIcon fontSize="small" color="action" />
            <Typography variant="caption">View Details</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DownloadIcon fontSize="small" color="primary" />
            <Typography variant="caption">Download</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon fontSize="small" color="info" />
            <Typography variant="caption">Edit (Active prescriptions only)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon fontSize="small" color="error" />
            <Typography variant="caption">Delete (Active prescriptions only)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PharmacyIcon fontSize="small" color="success" />
            <Typography variant="caption">Issue to Patient (Active prescriptions only)</Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Prescriptions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={clearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Prescriptions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Prescription #</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Medications</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {prescription.prescriptionNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {prescription.patient?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {prescription.patient?.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Dr. {prescription.doctor?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(prescription.date).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {prescription.medications?.slice(0, 2).map((med, index) => (
                      <Typography key={index} variant="caption">
                        {med.drug?.name} {med.strength} - {med.dosage}
                      </Typography>
                    ))}
                    {prescription.medications?.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        +{prescription.medications.length - 2} more
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Chip
                      label={prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      color={getStatusColor(prescription.status)}
                      size="small"
                    />
                    {prescription.isIssuedToPatient && (
                      <Chip
                        label="Issued"
                        color="success"
                        size="small"
                      />
                    )}
                    {!prescription.isIssuedToPatient && prescription.status === 'active' && (
                      <Chip
                        label="Editable"
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {/* View - Always available */}
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewPrescription(prescription)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {/* Download - Always available */}
                    <Tooltip title="Download Prescription">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownloadPrescription(prescription)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {/* Edit - Only for non-issued prescriptions */}
                    {canManagePrescriptions && !prescription.isIssuedToPatient && (
                      <Tooltip title="Edit Prescription">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleEditPrescriptionClick(prescription)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {/* Delete - Only for non-issued prescriptions */}
                    {canManagePrescriptions && !prescription.isIssuedToPatient && (
                      <Tooltip title="Delete Prescription">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePrescriptionClick(prescription)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {/* Issue to Patient - Only for active, non-issued prescriptions */}
                    {canIssuePrescription && !prescription.isIssuedToPatient && prescription.status === 'active' && (
                      <Tooltip title="Issue Prescription to Patient">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleIssuePrescriptionToPatient(prescription._id)}
                        >
                          <PharmacyIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {/* Show info when prescription can't be edited */}
                    {canManagePrescriptions && prescription.isIssuedToPatient && (
                      <Tooltip title="Prescription completed and issued to patient - cannot be edited">
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          ✓ Completed
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
      
      {/* Dialogs */}
      <AddPrescription
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddPrescription}
      />
      
      {selectedPrescription && (
        <>
          <EditPrescription
            open={editDialogOpen}
            prescription={selectedPrescription}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedPrescription(null);
            }}
            onEdit={handleEditPrescription}
          />
          
          <PrescriptionDetails
            open={viewDialogOpen}
            prescription={selectedPrescription}
            onClose={() => {
              setViewDialogOpen(false);
              setSelectedPrescription(null);
            }}
          />
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete prescription "{selectedPrescription?.prescriptionNumber}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePrescription} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Prescriptions;
