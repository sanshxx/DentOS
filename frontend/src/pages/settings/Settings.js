import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, Grid, TextField, Button, Switch,
  FormControlLabel, Divider, List, ListItem, ListItemText, ListItemIcon,
  Card, CardContent, CardHeader, Tab, Tabs, Alert, Snackbar, Select,
  MenuItem, InputLabel, FormControl, IconButton, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Save as SaveIcon,
  Business as BusinessIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Delete as DeleteIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Settings as SettingsIcon,
  SettingsApplications as SettingsApplicationsIcon,
  SettingsEthernet as SettingsEthernetIcon,
  SettingsPhone as SettingsPhoneIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  CreditCard as CreditCardIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import ThemeToggle from '../../components/settings/ThemeToggle';

const Settings = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });
  
  // Settings state
  const [settings, setSettings] = useState({
    practiceInfo: {
      name: 'Smile Dental Care',
      address: '123 Healthcare Avenue, Mumbai, Maharashtra 400001',
      phone: '+91 98765 43210',
      email: 'info@smiledentalcare.com',
      website: 'www.smiledentalcare.com',
      taxId: 'GST1234567890',
      licenseNumber: 'DEN-MH-2018-54321',
      businessHours: {
        monday: '9:00 AM - 5:00 PM',
        tuesday: '9:00 AM - 5:00 PM',
        wednesday: '9:00 AM - 5:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 5:00 PM',
        saturday: '10:00 AM - 2:00 PM',
        sunday: 'Closed'
      }
    },
    system: {
      language: 'English',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      autoLogout: 30,
      backupFrequency: 'Daily',
      dataRetention: 7,
      updateCheck: true
    },
    notifications: {
      appointmentReminders: true,
      appointmentReminderTime: 24,
      missedAppointments: true,
      paymentReminders: true,
      systemUpdates: true,
      marketingEmails: false
    },
    security: {
      passwordExpiry: 90,
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      twoFactorAuth: true,
      ipRestriction: false,
      allowedIPs: ''
    },
    integrations: {
      paymentGateway: 'Razorpay',
      paymentGatewayApiKey: '••••••••••••••••',
      smsProvider: 'Twilio',
      smsApiKey: '••••••••••••••••',
      emailProvider: 'SendGrid',
      emailApiKey: '••••••••••••••••',
      calendarSync: true,
      googleCalendarId: ''
    },
    backup: {
      lastBackup: '2023-12-01T10:30:00',
      backupLocation: 'Cloud Storage',
      autoBackup: true,
      backupEncryption: true,
      includePatientRecords: true,
      includeFinancialData: true,
      includeSystemSettings: true
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, nestedField, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [nestedField]: {
          ...prevSettings[section][nestedField],
          [field]: value
        }
      }
    }));
  };

  const handleSave = (section) => {
    // In a real app, we would call the API to save the settings
    // For now, we'll just show a success notification
    setNotification({
      open: true,
      message: `${section} settings saved successfully`,
      severity: 'success'
    });
  };

  const handleBackup = () => {
    // In a real app, we would call the API to create a backup
    // For now, we'll just show a success notification
    setNotification({
      open: true,
      message: 'Backup created successfully',
      severity: 'success'
    });
    
    // Update last backup time
    handleInputChange('backup', 'lastBackup', new Date().toISOString());
  };

  const handleRestore = () => {
    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Restore from Backup',
      message: 'Are you sure you want to restore from the last backup? This will overwrite current data.',
      action: () => {
        // In a real app, we would call the API to restore from backup
        // For now, we'll just show a success notification
        setNotification({
          open: true,
          message: 'System restored from backup successfully',
          severity: 'success'
        });
      }
    });
  };

  const handleFactoryReset = () => {
    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Factory Reset',
      message: 'WARNING: This will reset all settings to default values and delete all data. This action cannot be undone. Are you sure you want to proceed?',
      action: () => {
        // In a real app, we would call the API to perform a factory reset
        // For now, we'll just show a success notification
        setNotification({
          open: true,
          message: 'System has been reset to factory defaults',
          severity: 'success'
        });
      }
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const handleConfirmDialogConfirm = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    }
    handleConfirmDialogClose();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Settings
        </Typography>

        {/* Tabs for different settings sections */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="settings tabs"
          >
            <Tab label="Practice Information" icon={<BusinessIcon />} iconPosition="start" />
            <Tab label="System" icon={<SettingsApplicationsIcon />} iconPosition="start" />
            <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
            <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
            <Tab label="Integrations" icon={<SettingsEthernetIcon />} iconPosition="start" />
            <Tab label="Backup & Restore" icon={<BackupIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* Practice Information Tab */}
          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Practice Information
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave('Practice')}
                >
                  Save Changes
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Practice Name"
                    value={settings.practiceInfo.name}
                    onChange={(e) => handleInputChange('practiceInfo', 'name', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={settings.practiceInfo.email}
                    onChange={(e) => handleInputChange('practiceInfo', 'email', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={settings.practiceInfo.phone}
                    onChange={(e) => handleInputChange('practiceInfo', 'phone', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={settings.practiceInfo.website}
                    onChange={(e) => handleInputChange('practiceInfo', 'website', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={settings.practiceInfo.address}
                    onChange={(e) => handleInputChange('practiceInfo', 'address', e.target.value)}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tax ID / GST Number"
                    value={settings.practiceInfo.taxId}
                    onChange={(e) => handleInputChange('practiceInfo', 'taxId', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    value={settings.practiceInfo.licenseNumber}
                    onChange={(e) => handleInputChange('practiceInfo', 'licenseNumber', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Business Hours
                  </Typography>
                </Grid>
                {Object.entries(settings.practiceInfo.businessHours).map(([day, hours]) => (
                  <Grid item xs={12} md={6} key={day}>
                    <TextField
                      fullWidth
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                      value={hours}
                      onChange={(e) => handleNestedInputChange('practiceInfo', 'businessHours', day, e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* System Tab */}
          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  System Settings
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave('System')}
                >
                  Save Changes
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.system.language}
                      label="Language"
                      onChange={(e) => handleInputChange('system', 'language', e.target.value)}
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Hindi">Hindi</MenuItem>
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                      <MenuItem value="German">German</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.system.dateFormat}
                      label="Date Format"
                      onChange={(e) => handleInputChange('system', 'dateFormat', e.target.value)}
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Time Format</InputLabel>
                    <Select
                      value={settings.system.timeFormat}
                      label="Time Format"
                      onChange={(e) => handleInputChange('system', 'timeFormat', e.target.value)}
                    >
                      <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                      <MenuItem value="24h">24-hour</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.system.timezone}
                      label="Timezone"
                      onChange={(e) => handleInputChange('system', 'timezone', e.target.value)}
                    >
                      <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                      <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                      <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                      <MenuItem value="Australia/Sydney">Australia/Sydney (AEST)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={settings.system.currency}
                      label="Currency"
                      onChange={(e) => handleInputChange('system', 'currency', e.target.value)}
                    >
                      <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                      <MenuItem value="USD">US Dollar ($)</MenuItem>
                      <MenuItem value="EUR">Euro (€)</MenuItem>
                      <MenuItem value="GBP">British Pound (£)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Auto Logout (minutes)"
                    type="number"
                    value={settings.system.autoLogout}
                    onChange={(e) => handleInputChange('system', 'autoLogout', e.target.value)}
                    margin="normal"
                    InputProps={{ inputProps: { min: 5, max: 120 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Backup Frequency</InputLabel>
                    <Select
                      value={settings.system.backupFrequency}
                      label="Backup Frequency"
                      onChange={(e) => handleInputChange('system', 'backupFrequency', e.target.value)}
                    >
                      <MenuItem value="Daily">Daily</MenuItem>
                      <MenuItem value="Weekly">Weekly</MenuItem>
                      <MenuItem value="Monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data Retention (years)"
                    type="number"
                    value={settings.system.dataRetention}
                    onChange={(e) => handleInputChange('system', 'dataRetention', e.target.value)}
                    margin="normal"
                    InputProps={{ inputProps: { min: 1, max: 10 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.system.updateCheck}
                        onChange={(e) => handleInputChange('system', 'updateCheck', e.target.checked)}
                      />
                    }
                    label="Automatically check for updates"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Notifications Tab */}
          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave('Notification')}
                >
                  Save Changes
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Appointment Notifications
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.notifications.appointmentReminders}
                                onChange={(e) => handleInputChange('notifications', 'appointmentReminders', e.target.checked)}
                              />
                            }
                            label="Send appointment reminders"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Reminder Time (hours before appointment)"
                            type="number"
                            value={settings.notifications.appointmentReminderTime}
                            onChange={(e) => handleInputChange('notifications', 'appointmentReminderTime', e.target.value)}
                            margin="normal"
                            disabled={!settings.notifications.appointmentReminders}
                            InputProps={{ inputProps: { min: 1, max: 72 } }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.notifications.missedAppointments}
                                onChange={(e) => handleInputChange('notifications', 'missedAppointments', e.target.checked)}
                              />
                            }
                            label="Send missed appointment notifications"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Payment Notifications
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.paymentReminders}
                            onChange={(e) => handleInputChange('notifications', 'paymentReminders', e.target.checked)}
                          />
                        }
                        label="Send payment reminders"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        System Notifications
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.systemUpdates}
                            onChange={(e) => handleInputChange('notifications', 'systemUpdates', e.target.checked)}
                          />
                        }
                        label="Receive system update notifications"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Marketing Communications
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.marketingEmails}
                            onChange={(e) => handleInputChange('notifications', 'marketingEmails', e.target.checked)}
                          />
                        }
                        label="Receive marketing emails and newsletters"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Security Tab */}
          {tabValue === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave('Security')}
                >
                  Save Changes
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Password Policy
                      </Typography>
                      <TextField
                        fullWidth
                        label="Password Expiry (days)"
                        type="number"
                        value={settings.security.passwordExpiry}
                        onChange={(e) => handleInputChange('security', 'passwordExpiry', e.target.value)}
                        margin="normal"
                        InputProps={{ inputProps: { min: 30, max: 365 } }}
                      />
                      <TextField
                        fullWidth
                        label="Minimum Password Length"
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleInputChange('security', 'passwordMinLength', e.target.value)}
                        margin="normal"
                        InputProps={{ inputProps: { min: 6, max: 20 } }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.requireSpecialChars}
                            onChange={(e) => handleInputChange('security', 'requireSpecialChars', e.target.checked)}
                          />
                        }
                        label="Require special characters"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.requireNumbers}
                            onChange={(e) => handleInputChange('security', 'requireNumbers', e.target.checked)}
                          />
                        }
                        label="Require numbers"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Authentication
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.twoFactorAuth}
                            onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                          />
                        }
                        label="Enable two-factor authentication"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        Two-factor authentication adds an extra layer of security to your account.
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.ipRestriction}
                            onChange={(e) => handleInputChange('security', 'ipRestriction', e.target.checked)}
                          />
                        }
                        label="Enable IP restriction"
                      />
                      <TextField
                        fullWidth
                        label="Allowed IP Addresses (comma separated)"
                        value={settings.security.allowedIPs}
                        onChange={(e) => handleInputChange('security', 'allowedIPs', e.target.value)}
                        margin="normal"
                        disabled={!settings.security.ipRestriction}
                        placeholder="192.168.1.1, 10.0.0.1"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Integrations Tab */}
          {tabValue === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Integration Settings
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave('Integration')}
                >
                  Save Changes
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Payment Gateway
                      </Typography>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Payment Gateway</InputLabel>
                        <Select
                          value={settings.integrations.paymentGateway}
                          label="Payment Gateway"
                          onChange={(e) => handleInputChange('integrations', 'paymentGateway', e.target.value)}
                        >
                          <MenuItem value="Razorpay">Razorpay</MenuItem>
                          <MenuItem value="PayTM">PayTM</MenuItem>
                          <MenuItem value="Stripe">Stripe</MenuItem>
                          <MenuItem value="PayPal">PayPal</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="API Key"
                        value={settings.integrations.paymentGatewayApiKey}
                        onChange={(e) => handleInputChange('integrations', 'paymentGatewayApiKey', e.target.value)}
                        margin="normal"
                        type="password"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        SMS Provider
                      </Typography>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>SMS Provider</InputLabel>
                        <Select
                          value={settings.integrations.smsProvider}
                          label="SMS Provider"
                          onChange={(e) => handleInputChange('integrations', 'smsProvider', e.target.value)}
                        >
                          <MenuItem value="Twilio">Twilio</MenuItem>
                          <MenuItem value="MSG91">MSG91</MenuItem>
                          <MenuItem value="TextLocal">TextLocal</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="API Key"
                        value={settings.integrations.smsApiKey}
                        onChange={(e) => handleInputChange('integrations', 'smsApiKey', e.target.value)}
                        margin="normal"
                        type="password"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Email Provider
                      </Typography>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Email Provider</InputLabel>
                        <Select
                          value={settings.integrations.emailProvider}
                          label="Email Provider"
                          onChange={(e) => handleInputChange('integrations', 'emailProvider', e.target.value)}
                        >
                          <MenuItem value="SendGrid">SendGrid</MenuItem>
                          <MenuItem value="Mailchimp">Mailchimp</MenuItem>
                          <MenuItem value="SMTP">Custom SMTP</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="API Key"
                        value={settings.integrations.emailApiKey}
                        onChange={(e) => handleInputChange('integrations', 'emailApiKey', e.target.value)}
                        margin="normal"
                        type="password"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Calendar Integration
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.integrations.calendarSync}
                            onChange={(e) => handleInputChange('integrations', 'calendarSync', e.target.checked)}
                          />
                        }
                        label="Enable calendar synchronization"
                      />
                      <TextField
                        fullWidth
                        label="Google Calendar ID"
                        value={settings.integrations.googleCalendarId}
                        onChange={(e) => handleInputChange('integrations', 'googleCalendarId', e.target.value)}
                        margin="normal"
                        disabled={!settings.integrations.calendarSync}
                        placeholder="example@group.calendar.google.com"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Backup & Restore Tab */}
          {tabValue === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Backup & Restore
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Backup Settings
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.backup.autoBackup}
                            onChange={(e) => handleInputChange('backup', 'autoBackup', e.target.checked)}
                          />
                        }
                        label="Enable automatic backups"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.backup.backupEncryption}
                            onChange={(e) => handleInputChange('backup', 'backupEncryption', e.target.checked)}
                          />
                        }
                        label="Enable backup encryption"
                      />
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Backup Location</InputLabel>
                        <Select
                          value={settings.backup.backupLocation}
                          label="Backup Location"
                          onChange={(e) => handleInputChange('backup', 'backupLocation', e.target.value)}
                        >
                          <MenuItem value="Local Storage">Local Storage</MenuItem>
                          <MenuItem value="Cloud Storage">Cloud Storage</MenuItem>
                          <MenuItem value="External Drive">External Drive</MenuItem>
                        </Select>
                      </FormControl>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Last backup: {new Date(settings.backup.lastBackup).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Backup Data Selection
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.backup.includePatientRecords}
                            onChange={(e) => handleInputChange('backup', 'includePatientRecords', e.target.checked)}
                          />
                        }
                        label="Include patient records"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.backup.includeFinancialData}
                            onChange={(e) => handleInputChange('backup', 'includeFinancialData', e.target.checked)}
                          />
                        }
                        label="Include financial data"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.backup.includeSystemSettings}
                            onChange={(e) => handleInputChange('backup', 'includeSystemSettings', e.target.checked)}
                          />
                        }
                        label="Include system settings"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<BackupIcon />}
                      onClick={handleBackup}
                    >
                      Create Backup Now
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RestoreIcon />}
                      onClick={handleRestore}
                    >
                      Restore from Backup
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleFactoryReset}
                    >
                      Factory Reset
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmDialogConfirm} autoFocus color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;