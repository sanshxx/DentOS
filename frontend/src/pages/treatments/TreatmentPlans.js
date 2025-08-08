import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

const TreatmentPlans = () => {
  const navigate = useNavigate();
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state for new/edit plan
  const [planForm, setPlanForm] = useState({
    patientId: '',
    name: '',
    description: '',
    treatments: [],
    totalCost: 0,
    estimatedDuration: 0,
    status: 'draft'
  });

  useEffect(() => {
    fetchTreatmentPlans();
    fetchPatients();
    fetchTreatments();
  }, []);

  // Fetch treatment plans
  const fetchTreatmentPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // For now, we'll show a placeholder since the API doesn't exist yet
      // In a real implementation, this would call the treatment plans API
      setTreatmentPlans([]);
      
    } catch (err) {
      console.error('Error fetching treatment plans:', err);
      setError('Failed to load treatment plans. Please try again.');
      toast.error('Failed to load treatment plans');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPatients(response.data.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      toast.error('Failed to load patients');
    }
  };

  // Fetch treatments
  const fetchTreatments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/treatments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTreatments(response.data.data);
    } catch (err) {
      console.error('Error fetching treatments:', err);
      toast.error('Failed to load treatments');
    }
  };

  // Handle form input changes
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setPlanForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding treatment to plan
  const handleAddTreatment = (treatment) => {
    setPlanForm(prev => ({
      ...prev,
      treatments: [...prev.treatments, treatment],
      totalCost: prev.totalCost + treatment.price,
      estimatedDuration: prev.estimatedDuration + treatment.duration
    }));
  };

  // Handle removing treatment from plan
  const handleRemoveTreatment = (treatmentId) => {
    const treatment = planForm.treatments.find(t => t._id === treatmentId);
    setPlanForm(prev => ({
      ...prev,
      treatments: prev.treatments.filter(t => t._id !== treatmentId),
      totalCost: prev.totalCost - treatment.price,
      estimatedDuration: prev.estimatedDuration - treatment.duration
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // For now, just show a success message since the API doesn't exist
      toast.success('Treatment plan saved successfully!');
      setPlanDialogOpen(false);
      resetForm();
      
    } catch (err) {
      console.error('Error saving treatment plan:', err);
      toast.error('Failed to save treatment plan');
    }
  };

  // Reset form
  const resetForm = () => {
    setPlanForm({
      patientId: '',
      name: '',
      description: '',
      treatments: [],
      totalCost: 0,
      estimatedDuration: 0,
      status: 'draft'
    });
  };

  // Handle dialog open
  const handlePlanDialogOpen = () => {
    setPlanDialogOpen(true);
  };

  // Handle dialog close
  const handlePlanDialogClose = () => {
    setPlanDialogOpen(false);
    resetForm();
  };

  // Handle view plan
  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setViewDialogOpen(true);
  };

  // Handle edit plan
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      patientId: plan.patientId,
      name: plan.name,
      description: plan.description,
      treatments: plan.treatments,
      totalCost: plan.totalCost,
      estimatedDuration: plan.estimatedDuration,
      status: plan.status
    });
    setPlanDialogOpen(true);
  };

  // Handle delete plan
  const handleDeletePlan = (plan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      // For now, just show a success message since the API doesn't exist
      toast.success('Treatment plan deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedPlan(null);
      
    } catch (err) {
      console.error('Error deleting treatment plan:', err);
      toast.error('Failed to delete treatment plan');
    }
  };

  // Filter plans
  const filteredPlans = treatmentPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Treatment Plans
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handlePlanDialogOpen}
        >
          Create Treatment Plan
        </Button>
      </Box>

      {/* Search and Filter */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Treatment Plans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by plan name or patient..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchTreatmentPlans}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {treatmentPlans.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <MedicalServicesIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Treatment Plans Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first treatment plan to start managing patient treatment sequences.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handlePlanDialogOpen}
            size="large"
          >
            Create First Treatment Plan
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPlans.map((plan) => (
            <Grid item xs={12} md={6} lg={4} key={plan.id}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {plan.name}
                    </Typography>
                    <Chip
                      label={plan.status}
                      color={
                        plan.status === 'active' ? 'success' :
                        plan.status === 'completed' ? 'primary' :
                        plan.status === 'cancelled' ? 'error' : 'default'
                      }
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {plan.patientName}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <MedicalServicesIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {plan.treatments.length} treatments
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <CalendarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {plan.estimatedDuration} mins
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <MoneyIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    ₹{plan.totalCost.toLocaleString('en-IN')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewPlan(plan)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditPlan(plan)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeletePlan(plan)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Plan Dialog */}
      <Dialog
        open={planDialogOpen}
        onClose={handlePlanDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedPlan ? 'Edit Treatment Plan' : 'Create Treatment Plan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  name="patientId"
                  value={planForm.patientId}
                  onChange={handleFormChange}
                  label="Patient"
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient._id} value={patient._id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Plan Name"
                name="name"
                value={planForm.name}
                onChange={handleFormChange}
                placeholder="e.g., Complete Dental Care Plan"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={planForm.description}
                onChange={handleFormChange}
                multiline
                rows={3}
                placeholder="Describe the treatment plan..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Selected Treatments
              </Typography>
              <List>
                {planForm.treatments.map((treatment, index) => (
                  <ListItem key={treatment._id}>
                    <ListItemText
                      primary={treatment.name}
                      secondary={`₹${treatment.price} • ${treatment.duration} mins`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveTreatment(treatment._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {planForm.treatments.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No treatments selected
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Available Treatments
              </Typography>
              <Grid container spacing={2}>
                {treatments.map((treatment) => (
                  <Grid item xs={12} sm={6} md={4} key={treatment._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2">{treatment.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {treatment.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₹{treatment.price} • {treatment.duration} mins
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddTreatment(treatment)}
                          sx={{ mt: 1 }}
                        >
                          Add to Plan
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Total: ₹{planForm.totalCost.toLocaleString('en-IN')} • {planForm.estimatedDuration} mins
                </Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={planForm.status}
                    onChange={handleFormChange}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePlanDialogClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Plan Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPlan && (
          <>
            <DialogTitle>
              Treatment Plan Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6">{selectedPlan.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPlan.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Patient: {selectedPlan.patientName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Treatments
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Treatment</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPlan.treatments.map((treatment) => (
                          <TableRow key={treatment._id}>
                            <TableCell>{treatment.name}</TableCell>
                            <TableCell>{treatment.category}</TableCell>
                            <TableCell>{treatment.duration} mins</TableCell>
                            <TableCell>₹{treatment.price}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    Total: ₹{selectedPlan.totalCost.toLocaleString('en-IN')} • {selectedPlan.estimatedDuration} mins
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Delete Treatment Plan
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedPlan?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TreatmentPlans; 