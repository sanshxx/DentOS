import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Paper, Box, Grid, TextField, Button, Avatar,
  Divider, Tab, Tabs, IconButton, Alert, Snackbar, Switch, FormControlLabel,
  List, ListItem, ListItemText, ListItemIcon, Card, CardContent, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  Save as SaveIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as PhotoCameraIcon,
  Language as LanguageIcon,
  ColorLens as ColorLensIcon,
  AccessTime as AccessTimeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Work as WorkIcon
} from '@mui/icons-material';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [editMode, setEditMode] = useState(false);
  
  // Form state
  const [profileData, setProfileData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      role: '',
      department: '',
      bio: ''
    },
    accountSettings: {
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    preferences: {
      language: 'English',
      theme: 'Light',
      notifications: {
        email: true,
        sms: true,
        app: true
      },
      timeFormat: '12h'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      lastPasswordChange: '',
      lastLogin: ''
    }
  });

  useEffect(() => {
    // Fetch user profile data
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch user profile data from API
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Set profile data from API response
        const userData = response.data.data;
        setProfileData({
          personalInfo: {
            firstName: userData.name ? userData.name.split(' ')[0] : '',
            lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: '', // Not available in current User model
            city: '', // Not available in current User model
            state: '', // Not available in current User model
            zipCode: '', // Not available in current User model
            country: '', // Not available in current User model
            role: userData.role || '',
            department: '', // Not available in current User model
            bio: '' // Not available in current User model
          },
          accountSettings: {
            username: userData.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          },
          preferences: {
            language: 'English',
            theme: 'Light',
            notifications: {
              email: true,
              sms: true,
              app: true
            },
            timeFormat: '12h'
          },
          security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            lastPasswordChange: userData.lastPasswordChange || '',
            lastLogin: userData.lastLogin || ''
          }
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setNotification({
          open: true,
          message: 'Failed to load profile data',
          severity: 'error'
        });
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (section, field, value) => {
    setProfileData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, nestedField, field, value) => {
    setProfileData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [nestedField]: {
          ...prevData[section][nestedField],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data for API (combine first and last name)
      const updateData = {
        name: `${profileData.personalInfo.firstName} ${profileData.personalInfo.lastName}`.trim(),
        email: profileData.personalInfo.email,
        phone: profileData.personalInfo.phone
      };
      
      // Save profile data to API
      await axios.put(`${API_URL}/auth/updatedetails`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      setEditMode(false);
      setSaving(false);
    } catch (error) {
      console.error('Error saving profile data:', error);
      setNotification({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
      setSaving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Profile
          </Typography>
          <Button
            variant={editMode ? "contained" : "outlined"}
            color={editMode ? "primary" : "secondary"}
            startIcon={editMode ? <SaveIcon /> : <EditIcon />}
            onClick={editMode ? handleSave : () => setEditMode(true)}
            disabled={saving}
          >
            {editMode ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
          </Button>
        </Box>

        {/* Profile Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={2}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  sx={{ width: 120, height: 120, fontSize: '3rem' }}
                  alt={`${profileData.personalInfo.firstName} ${profileData.personalInfo.lastName}`}
                  src=""
                >
                  {profileData.personalInfo.firstName.charAt(0)}{profileData.personalInfo.lastName.charAt(0)}
                </Avatar>
                {editMode && (
                  <IconButton 
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.dark' },
                      color: 'white',
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={10}>
              <Typography variant="h5">
                {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {profileData.personalInfo.role} - {profileData.personalInfo.department}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">{profileData.personalInfo.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">{profileData.personalInfo.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {profileData.personalInfo.city}, {profileData.personalInfo.country}
                </Typography>
              </Box>
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
            aria-label="profile tabs"
          >
            <Tab label="Personal Information" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Account Settings" icon={<SettingsIcon />} iconPosition="start" />
            <Tab label="Preferences" icon={<ColorLensIcon />} iconPosition="start" />
            <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* Personal Information Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.personalInfo.firstName}
                    onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.personalInfo.lastName}
                    onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileData.personalInfo.phone}
                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profileData.personalInfo.address}
                    onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={profileData.personalInfo.city}
                    onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    value={profileData.personalInfo.state}
                    onChange={(e) => handleInputChange('personalInfo', 'state', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ZIP/Postal Code"
                    value={profileData.personalInfo.zipCode}
                    onChange={(e) => handleInputChange('personalInfo', 'zipCode', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={profileData.personalInfo.country}
                    onChange={(e) => handleInputChange('personalInfo', 'country', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={profileData.personalInfo.role}
                    onChange={(e) => handleInputChange('personalInfo', 'role', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={profileData.personalInfo.bio}
                    onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
                    margin="normal"
                    multiline
                    rows={4}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Account Settings Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={profileData.accountSettings.username}
                    onChange={(e) => handleInputChange('accountSettings', 'username', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Change Password
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    value={profileData.accountSettings.currentPassword}
                    onChange={(e) => handleInputChange('accountSettings', 'currentPassword', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                          disabled={!editMode}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={profileData.accountSettings.newPassword}
                    onChange={(e) => handleInputChange('accountSettings', 'newPassword', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={profileData.accountSettings.confirmPassword}
                    onChange={(e) => handleInputChange('accountSettings', 'confirmPassword', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                    error={profileData.accountSettings.newPassword !== profileData.accountSettings.confirmPassword && profileData.accountSettings.confirmPassword !== ''}
                    helperText={profileData.accountSettings.newPassword !== profileData.accountSettings.confirmPassword && profileData.accountSettings.confirmPassword !== '' ? 'Passwords do not match' : ''}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Preferences Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LanguageIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Language</Typography>
                      </Box>
                      <TextField
                        select
                        fullWidth
                        label="Select Language"
                        value={profileData.preferences.language}
                        onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                        margin="normal"
                        disabled={!editMode}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </TextField>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ColorLensIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Theme</Typography>
                      </Box>
                      <TextField
                        select
                        fullWidth
                        label="Select Theme"
                        value={profileData.preferences.theme}
                        onChange={(e) => handleInputChange('preferences', 'theme', e.target.value)}
                        margin="normal"
                        disabled={!editMode}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="Light">Light</option>
                        <option value="Dark">Dark</option>
                        <option value="System">System Default</option>
                      </TextField>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Notifications</Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Email Notifications" />
                          <Switch
                            edge="end"
                            checked={profileData.preferences.notifications.email}
                            onChange={(e) => handleNestedInputChange('preferences', 'notifications', 'email', e.target.checked)}
                            disabled={!editMode}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="SMS Notifications" />
                          <Switch
                            edge="end"
                            checked={profileData.preferences.notifications.sms}
                            onChange={(e) => handleNestedInputChange('preferences', 'notifications', 'sms', e.target.checked)}
                            disabled={!editMode}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="In-App Notifications" />
                          <Switch
                            edge="end"
                            checked={profileData.preferences.notifications.app}
                            onChange={(e) => handleNestedInputChange('preferences', 'notifications', 'app', e.target.checked)}
                            disabled={!editMode}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Time Format</Typography>
                      </Box>
                      <TextField
                        select
                        fullWidth
                        label="Select Time Format"
                        value={profileData.preferences.timeFormat}
                        onChange={(e) => handleInputChange('preferences', 'timeFormat', e.target.value)}
                        margin="normal"
                        disabled={!editMode}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                      </TextField>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Security Tab */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SecurityIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">Two-Factor Authentication</Typography>
                        </Box>
                        <Switch
                          checked={profileData.security.twoFactorAuth}
                          onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                          disabled={!editMode}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Add an extra layer of security to your account by requiring a verification code in addition to your password when signing in.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Session Timeout (minutes)"
                    type="number"
                    value={profileData.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
                    margin="normal"
                    disabled={!editMode}
                    InputProps={{ inputProps: { min: 5, max: 120 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Security Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Last Password Change" 
                        secondary={new Date(profileData.security.lastPasswordChange).toLocaleString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Last Login" 
                        secondary={new Date(profileData.security.lastLogin).toLocaleString()} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="error"
                      disabled={!editMode}
                    >
                      Log Out From All Devices
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;