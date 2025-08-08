import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Grid, Button, Chip, Divider,
  Card, CardContent, CardHeader, Avatar, List, ListItem, ListItemText,
  ListItemAvatar, ListItemIcon, Tab, Tabs, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Rating
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  MedicalServices as MedicalServicesIcon,
  School as SchoolIcon,
  EventAvailable as EventAvailableIcon,
  Work as WorkIcon,
  BarChart as BarChartIcon,
  Star as StarIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

const StaffDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staff, setStaff] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Make API call to get staff details
        const response = await axios.get(`${API_URL}/staff/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setStaff(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching staff details:', err);
        setError('Failed to load staff details. Please try again.');
        toast.error(err.response?.data?.message || 'Failed to load staff details');
        setLoading(false);
      }
    };
    
    fetchStaffDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    navigate(`/staff/edit/${id}`);
  };

  const handleDelete = () => {
    // In a real app, we would call the API to delete the staff member
    // For now, we'll just navigate back to the staff list
    navigate('/staff');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading staff details...
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
            onClick={() => navigate('/staff')}
            sx={{ mt: 2 }}
          >
            Back to Staff
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
            onClick={() => navigate('/staff')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            Staff Profile
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

        {/* Staff Overview Card */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
                  {staff.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5">{staff.name}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">{staff.role}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Rating value={staff.stats.averageRating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({staff.stats.reviewCount} reviews)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                {staff.bio}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BadgeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">License: {staff.licenseNumber}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{staff.phone}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{staff.email}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {staff.address ? 
                    (typeof staff.address === 'string' ? staff.address :
                     `${staff.address.street || ''}, ${staff.address.city || ''}, ${staff.address.state || ''} ${staff.address.pincode || ''}`) :
                    'Address not available'
                  }
                </Typography>
              </Box>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Specializations
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {staff.specializations.map((specialization, index) => (
                  <Chip key={index} label={specialization} color="primary" variant="outlined" />
                ))}
              </Box>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Languages
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {staff.languages.map((language, index) => (
                  <Chip key={index} label={language} variant="outlined" />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardHeader title="Performance Stats" avatar={<BarChartIcon color="primary" />} />
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Patients Served" 
                        secondary={staff.stats.patientsServed.toLocaleString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EventAvailableIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Appointments This Month" 
                        secondary={staff.stats.appointmentsThisMonth} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <StarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Treatment Success Rate" 
                        secondary={`${staff.stats.treatmentSuccess}%`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarMonthIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Joined" 
                        secondary={new Date(staff.joinDate).toLocaleDateString()} 
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
            aria-label="staff details tabs"
          >
            <Tab label="Qualifications" icon={<SchoolIcon />} iconPosition="start" />
            <Tab label="Schedule" icon={<AccessTimeIcon />} iconPosition="start" />
            <Tab label="Recent Patients" icon={<PersonIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* Qualifications Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Education & Qualifications
              </Typography>
              <List>
                {staff.qualifications.map((qualification, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        <SchoolIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={qualification.degree}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {qualification.institution}
                          </Typography>
                          {` — ${qualification.year}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Certifications
              </Typography>
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Certification</TableCell>
                      <TableCell>Issuing Authority</TableCell>
                      <TableCell>Year</TableCell>
                      <TableCell>Valid Until</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staff.certifications.map((cert, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {cert.name}
                        </TableCell>
                        <TableCell>{cert.issuer}</TableCell>
                        <TableCell>{cert.year}</TableCell>
                        <TableCell>{cert.expiry}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Schedule Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Weekly Schedule
              </Typography>
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Hours</TableCell>
                      <TableCell>Clinic</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staff.schedule.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body1" fontWeight={item.day === 'Sunday' ? 'bold' : 'normal'}>
                            {item.day}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body1" 
                            color={item.hours === 'Off' ? 'error' : 'inherit'}
                            fontWeight={item.day === 'Sunday' ? 'bold' : 'normal'}
                          >
                            {item.hours}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.clinic}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Recent Patients Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Recent Patients
              </Typography>
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient Name</TableCell>
                      <TableCell>Treatment</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staff.recentPatients.map((patient, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {patient.name}
                        </TableCell>
                        <TableCell>{patient.treatment}</TableCell>
                        <TableCell>{new Date(patient.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => navigate(`/patients/${patient.id}`)}
                          >
                            View Patient
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/appointments/new')}
                  startIcon={<EventAvailableIcon />}
                >
                  Schedule Appointment
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default StaffDetails;