import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  MonetizationOn as MonetizationOnIcon,
  MedicalServices as MedicalServicesIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import AuthContext from '../../context/AuthContext';
import { format } from 'date-fns';

// Get API URL from environment variables
import { API_URL } from '../../utils/apiConfig';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalTreatments: 0,
    appointmentsToday: [],
    recentPatients: [],
    upcomingAppointments: [],
    revenueByMonth: [],
    appointmentsByType: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch dashboard data from API
        const response = await axios.get(`${API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = response.data.data;
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Prepare chart data for appointments by type
  const appointmentTypeChartData = {
    labels: stats?.appointmentsByType?.map(item => item.type) || [],
    datasets: [
      {
        label: 'Appointments',
        data: stats?.appointmentsByType?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for revenue by month
  const revenueChartData = {
    labels: stats?.revenueByMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats?.revenueByMonth?.map(item => item.revenue) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue',
      },
    },
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.name || 'User'}! Here's what's happening today.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Total Patients
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
                              <Typography variant="h4">{stats?.totalPatients?.toLocaleString() || '0'}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {stats?.trends?.patients > 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2" 
                  color={stats?.trends?.patients > 0 ? "success.main" : "error.main"} 
                  sx={{ ml: 0.5 }}
                >
                  {stats?.trends?.patients > 0 ? '+' : ''}{stats?.trends?.patients || 0}% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Appointments
                </Typography>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <CalendarTodayIcon />
                </Avatar>
              </Box>
                              <Typography variant="h4">{stats?.totalAppointments?.toLocaleString() || '0'}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {stats?.trends?.appointments > 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2" 
                  color={stats?.trends?.appointments > 0 ? "success.main" : "error.main"} 
                  sx={{ ml: 0.5 }}
                >
                  {stats?.trends?.appointments > 0 ? '+' : ''}{stats?.trends?.appointments || 0}% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Card - Only visible to admin and manager */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.secondary">
                    Revenue
                  </Typography>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <MonetizationOnIcon />
                  </Avatar>
                </Box>
                <Typography variant="h4">{formatCurrency(stats?.totalRevenue || 0)}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {stats?.trends?.revenue > 0 ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography 
                    variant="body2" 
                    color={stats?.trends?.revenue > 0 ? "success.main" : "error.main"} 
                    sx={{ ml: 0.5 }}
                  >
                    {stats?.trends?.revenue > 0 ? '+' : ''}{stats?.trends?.revenue || 0}% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Treatments
                </Typography>
                <Avatar sx={{ bgcolor: 'secondary.light' }}>
                  <MedicalServicesIcon />
                </Avatar>
              </Box>
                              <Typography variant="h4">{stats?.totalTreatments?.toLocaleString() || '0'}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {stats?.trends?.treatments > 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2" 
                  color={stats?.trends?.treatments > 0 ? "success.main" : "error.main"} 
                  sx={{ ml: 0.5 }}
                >
                  {stats?.trends?.treatments > 0 ? '+' : ''}{stats?.trends?.treatments || 0}% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardHeader 
              title="Today's Appointments" 
              action={
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/appointments')}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', p: 0 }}>
                            {stats?.appointmentsToday?.length > 0 ? (
              stats.appointmentsToday.map((appointment, index) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem
                        alignItems="flex-start"
                        secondaryAction={
                          <Chip 
                            label={appointment.status} 
                            size="small" 
                            color={appointment.status === 'confirmed' ? 'success' : 'primary'}
                            variant="outlined"
                          />
                        }
                        sx={{ px: 2 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={appointment.patientName}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {appointment.type}
                              </Typography>
                              {` — `}
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                                {appointment.time}
                              </Box>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < (stats?.appointmentsToday?.length || 0) - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No appointments scheduled for today" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Patients */}
        <Grid item xs={12} md={6} lg={(user?.role === 'admin' || user?.role === 'manager') ? 4 : 6}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardHeader 
              title="Recent Patients" 
              action={
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/patients')}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', p: 0 }}>
                            {stats?.recentPatients?.length > 0 ? (
              stats.recentPatients.map((patient, index) => (
                    <React.Fragment key={patient.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{ px: 2 }}
                        button
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: patient.gender === 'Female' ? 'secondary.light' : 'primary.light' }}>
                            {patient.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={patient.name}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {patient.phone}
                              </Typography>
                              {` — Registered on ${format(new Date(patient.date), 'dd MMM yyyy')}`}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < (stats?.recentPatients?.length || 0) - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent patients" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Appointment Types Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardHeader title="Appointment Types" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie data={appointmentTypeChartData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Chart - Only visible to admin and manager */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 2 }}>
              <CardHeader title="Revenue Trend" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Bar data={revenueChartData} options={revenueChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6} lg={(user?.role === 'admin' || user?.role === 'manager') ? 4 : 6}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardHeader 
              title="Upcoming Appointments" 
              action={
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/calendar')}
                >
                  Calendar
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ width: '100%', p: 0 }}>
                            {stats?.upcomingAppointments?.length > 0 ? (
              stats.upcomingAppointments.map((appointment, index) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{ px: 2 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.light' }}>
                            <CalendarTodayIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={appointment.patientName}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {appointment.type}
                              </Typography>
                              {` — ${format(new Date(appointment.date), 'dd MMM yyyy')} at ${appointment.time}`}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < (stats?.upcomingAppointments?.length || 0) - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No upcoming appointments" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;