import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Paper, Box, Grid, Button, Chip, Divider,
  Card, CardContent, CardHeader, Avatar, List, ListItem, ListItemText,
  ListItemAvatar, ListItemIcon, Tab, Tabs, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  MedicalServices as MedicalServicesIcon,
  People as PeopleIcon,
  EventAvailable as EventAvailableIcon,
  Biotech as BiotechIcon,
  BarChart as BarChartIcon,
  Star as StarIcon
} from '@mui/icons-material';

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

const ClinicDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchClinicDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Call the API to get clinic details
        const response = await axios.get(`${API_URL}/clinics/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Format the clinic data for display
        const clinicData = response.data.data;
        
        // Transform the data to match the expected format in the UI
        const formattedClinic = {
          id: clinicData._id,
          name: clinicData.name,
          address: clinicData.address?.street ? 
            `${clinicData.address.street}, ${clinicData.address.city}, ${clinicData.address.state} ${clinicData.address.pincode}` : 
            'Address not available',
          phone: clinicData.contactNumbers?.[0] || 'Phone not available',
          email: clinicData.email || 'Email not available',
          operatingHours: [
            { day: 'Monday', hours: clinicData.operatingHours?.monday?.isOpen ? 
              `${clinicData.operatingHours.monday.openTime} - ${clinicData.operatingHours.monday.closeTime}` : 'Closed' },
            { day: 'Tuesday', hours: clinicData.operatingHours?.tuesday?.isOpen ? 
              `${clinicData.operatingHours.tuesday.openTime} - ${clinicData.operatingHours.tuesday.closeTime}` : 'Closed' },
            { day: 'Wednesday', hours: clinicData.operatingHours?.wednesday?.isOpen ? 
              `${clinicData.operatingHours.wednesday.openTime} - ${clinicData.operatingHours.wednesday.closeTime}` : 'Closed' },
            { day: 'Thursday', hours: clinicData.operatingHours?.thursday?.isOpen ? 
              `${clinicData.operatingHours.thursday.openTime} - ${clinicData.operatingHours.thursday.closeTime}` : 'Closed' },
            { day: 'Friday', hours: clinicData.operatingHours?.friday?.isOpen ? 
              `${clinicData.operatingHours.friday.openTime} - ${clinicData.operatingHours.friday.closeTime}` : 'Closed' },
            { day: 'Saturday', hours: clinicData.operatingHours?.saturday?.isOpen ? 
              `${clinicData.operatingHours.saturday.openTime} - ${clinicData.operatingHours.saturday.closeTime}` : 'Closed' },
            { day: 'Sunday', hours: clinicData.operatingHours?.sunday?.isOpen ? 
              `${clinicData.operatingHours.sunday.openTime} - ${clinicData.operatingHours.sunday.closeTime}` : 'Closed' }
          ],
          specialties: clinicData.specialties || clinicData.facilities || [],
          established: clinicData.establishedDate ? new Date(clinicData.establishedDate).getFullYear().toString() : 'N/A',
          staff: [], // This would need to be fetched separately
          equipment: [], // This would need to be fetched separately
          stats: {
            patientsServed: 0, // These would need to be fetched from analytics
            appointmentsThisMonth: 0,
            averageRating: 0,
            reviewCount: 0
          },
          description: clinicData.description || 'No description available',
          images: clinicData.images?.map(img => ({ url: img.url, caption: img.caption })) || []
        };
        
        setClinic(formattedClinic);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clinic details:', err);
        setError(err.response?.data?.message || 'Failed to load clinic details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchClinicDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    navigate(`/clinics/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this clinic?')) {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Call the API to delete the clinic
        await axios.delete(`${API_URL}/clinics/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Navigate back to clinics list after successful deletion
        navigate('/clinics');
      } catch (err) {
        console.error('Error deleting clinic:', err);
        setError(err.response?.data?.message || 'Failed to delete clinic');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading clinic details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/clinics')}
            sx={{ mt: 2 }}
          >
            Back to Clinics
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header with back button and actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/clinics')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            {clinic.name}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>

        {/* Clinic Overview Card */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body1" paragraph>
                {clinic.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {clinic.address ? 
                    (typeof clinic.address === 'string' ? clinic.address :
                     `${clinic.address.street || ''}, ${clinic.address.city || ''}, ${clinic.address.state || ''} ${clinic.address.pincode || ''}`) :
                    'Address not available'
                  }
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{clinic.phone}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{clinic.email}</Typography>
              </Box>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Specialties
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {clinic.specialties.map((specialty, index) => (
                  <Chip key={index} label={specialty} color="primary" variant="outlined" />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardHeader title="Clinic Stats" avatar={<BarChartIcon color="primary" />} />
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PeopleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Patients Served" 
                        secondary={clinic.stats.patientsServed.toLocaleString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EventAvailableIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Appointments This Month" 
                        secondary={clinic.stats.appointmentsThisMonth} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <StarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Rating (${clinic.stats.reviewCount} reviews)`} 
                        secondary={`${clinic.stats.averageRating}/5`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTimeIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Established" 
                        secondary={clinic.established} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs for different sections */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="clinic details tabs"
          >
            <Tab label="Operating Hours" icon={<AccessTimeIcon />} iconPosition="start" />
            <Tab label="Staff" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Equipment" icon={<BiotechIcon />} iconPosition="start" />
            <Tab label="Services" icon={<MedicalServicesIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* Operating Hours Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Operating Hours
              </Typography>
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Hours</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clinic.operatingHours.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body1" fontWeight={item.day === 'Sunday' ? 'bold' : 'normal'}>
                            {item.day}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body1" 
                            color={item.hours === 'Closed' ? 'error' : 'inherit'}
                            fontWeight={item.day === 'Sunday' ? 'bold' : 'normal'}
                          >
                            {item.hours}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Staff Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Staff Members
              </Typography>
              <Grid container spacing={2}>
                {clinic.staff.map((staff) => (
                  <Grid item xs={12} sm={6} md={3} key={staff.id}>
                    <Card elevation={2}>
                      <CardHeader
                        avatar={
                          <Avatar>{staff.name.charAt(0)}</Avatar>
                        }
                        title={staff.name}
                        subheader={staff.role}
                      />
                      <CardContent>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          fullWidth
                          onClick={() => navigate(`/staff/${staff.id}`)}
                        >
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Equipment Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Equipment
              </Typography>
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Equipment</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Last Maintenance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clinic.equipment.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {item.name}
                        </TableCell>
                        <TableCell align="center">{item.count}</TableCell>
                        <TableCell align="right">
                          {new Date(item.lastMaintenance).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Services Tab */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Services Offered
              </Typography>
              <Grid container spacing={2}>
                {/* Mock services based on specialties */}
                {clinic.specialties.map((specialty, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card elevation={2}>
                      <CardHeader
                        avatar={
                          <Avatar><MedicalServicesIcon /></Avatar>
                        }
                        title={specialty}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {`Comprehensive ${specialty.toLowerCase()} services provided by our experienced team of specialists.`}
                        </Typography>
                        <Button 
                          variant="text" 
                          size="small" 
                          sx={{ mt: 1 }}
                          onClick={() => navigate('/treatments')}
                        >
                          View Treatments
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ClinicDetails;