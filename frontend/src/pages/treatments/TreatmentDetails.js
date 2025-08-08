import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Grid, Button, Chip, Divider,
  Card, CardContent, CardMedia, CircularProgress, Alert, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Tabs, Tab, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MedicalServices as MedicalServicesIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Notes as NotesIcon,
  Inventory as InventoryIcon,
  LocalHospital as LocalHospitalIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Healing as HealingIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TreatmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchTreatmentDetails();
  }, [id]);

  const fetchTreatmentDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API call to get treatment details
      const response = await axios.get(`${API_URL}/treatments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTreatment(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching treatment details:', err);
      setError('Failed to load treatment details. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to load treatment details');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    navigate(`/treatments/edit/${id}`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // In a real app, we would call the API to delete the treatment
    toast.success('Treatment deleted successfully');
    setDeleteDialogOpen(false);
    navigate('/treatments');
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy, h:mm a');
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
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/treatments')}
          >
            Back to Treatments
          </Button>
        </Box>
      </Container>
    );
  }

  if (!treatment) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Treatment not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/treatments')}
          >
            Back to Treatments
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with treatment name and actions */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/treatments')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h5" component="h1">
              {treatment.name}
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Edit Treatment">
              <IconButton color="primary" onClick={handleEdit} sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Treatment">
              <IconButton color="error" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Treatment Code
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {treatment.code}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Category
            </Typography>
            <Chip 
              label={treatment.category} 
              color="primary" 
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Price
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
              {formatPrice(treatment.price)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="textSecondary">
              Duration
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
              {treatment.duration} minutes
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different sections */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label="Procedure" />
          <Tab label="Medical Info" />
          <Tab label="Related Treatments" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ mb: 4 }}>
        {/* Overview Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Treatment Image and Description */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Treatment Overview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {treatment.imageUrl && (
                  <Box sx={{ mb: 2 }}>
                    <img 
                      src={treatment.imageUrl} 
                      alt={treatment.name} 
                      style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'cover' }} 
                    />
                  </Box>
                )}
                <Typography variant="body1" paragraph>
                  {treatment.description}
                </Typography>
                {treatment.notes && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <NotesIcon color="action" sx={{ mr: 1, mt: 0.5 }} />
                    <Typography variant="body2" color="textSecondary">
                      <strong>Notes:</strong> {treatment.notes}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Equipment and Details */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Required Equipment
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {treatment.requiredEquipment.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <InventoryIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Status
                      </Typography>
                      <Chip 
                        label={treatment.isActive ? 'Active' : 'Inactive'} 
                        color={treatment.isActive ? 'success' : 'default'} 
                        size="small" 
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(treatment.createdAt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(treatment.updatedAt)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Procedure Tab */}
        {tabValue === 1 && (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Procedure Steps
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {treatment.procedureSteps.map((step, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Chip label={index + 1} color="primary" size="small" />
                  </ListItemIcon>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Medical Info Tab */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Contraindications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {treatment.contraindications.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LocalHospitalIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Side Effects
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {treatment.sideEffects.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <AssignmentIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Aftercare
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {treatment.aftercare.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <HealingIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Related Treatments Tab */}
        {tabValue === 3 && (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Related Treatments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {treatment.relatedTreatments.map((relatedTreatment) => (
                <Grid item xs={12} sm={6} md={4} key={relatedTreatment.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <MedicalServicesIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {relatedTreatment.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        Code: {relatedTreatment.code}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate(`/treatments/${relatedTreatment.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Statistics Tab */}
        {tabValue === 4 && (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Usage Statistics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h3" align="center">
                      {treatment.usageStatistics.totalPerformed}
                    </Typography>
                    <Typography variant="body2" align="center">
                      Total Performed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, bgcolor: 'info.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h3" align="center">
                      {treatment.usageStatistics.averageDuration}
                    </Typography>
                    <Typography variant="body2" align="center">
                      Avg. Duration (mins)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, bgcolor: 'success.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h3" align="center">
                      {treatment.usageStatistics.successRate}%
                    </Typography>
                    <Typography variant="body2" align="center">
                      Success Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, bgcolor: 'secondary.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h5" align="center">
                      {treatment.usageStatistics.commonlyUsedWith.join(', ')}
                    </Typography>
                    <Typography variant="body2" align="center">
                      Commonly Used With
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Treatment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the treatment "{treatment.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TreatmentDetails;