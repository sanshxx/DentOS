import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem as MenuItemComponent
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

import { API_URL } from '../../utils/apiConfig';

const Team = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'receptionist',
    temporaryPassword: ''
  });
  
  // Edit user state
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'receptionist'
  });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  // Clinic Access edit dialog
  const [clinics, setClinics] = useState([]);
  const [clinicAccessDialog, setClinicAccessDialog] = useState(false);
  const [clinicAccessForm, setClinicAccessForm] = useState({ type: 'all', clinics: [] });
  const [clinicAccessUser, setClinicAccessUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get organization details
      const orgResponse = await axios.get(`${API_URL}/organizations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (orgResponse.data.success) {
        setOrganization(orgResponse.data.data);
        
        // Get users and join requests
        const [usersResponse, requestsResponse, clinicsResponse] = await Promise.all([
          axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/organizations/${orgResponse.data.data._id}/join-requests`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/clinics`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (usersResponse.data.success) {
          setUsers(usersResponse.data.data);
        }

        if (requestsResponse.data.success) {
          setJoinRequests(requestsResponse.data.data);
        }

        if (clinicsResponse.data.success) {
          setClinics(clinicsResponse.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/organizations/${organization._id}/users`,
        createUserForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('User created successfully');
        setCreateUserDialog(false);
        setCreateUserForm({
          name: '',
          email: '',
          phone: '',
          role: 'receptionist',
          temporaryPassword: ''
        });
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
    }
  };

  const handleJoinRequest = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/organizations/${organization._id}/join-requests/${requestId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Join request ${action}d successfully`);
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error('Error handling join request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to handle join request';
      toast.error(errorMessage);
    }
  };

  const handleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    setEditUserDialog(true);
    handleMenuClose();
  };

  const openClinicAccessDialog = (user) => {
    setClinicAccessUser(user);
    const current = user.clinicAccess || { type: 'all', clinics: [] };
    setClinicAccessForm({ type: current.type || 'all', clinics: (current.clinics || []).map(c => (typeof c === 'string' ? c : c?._id)) });
    setClinicAccessDialog(true);
    handleMenuClose();
  };

  const saveClinicAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = { type: clinicAccessForm.type, clinics: clinicAccessForm.type === 'subset' ? clinicAccessForm.clinics : [] };
      const res = await axios.put(`${API_URL}/users/${clinicAccessUser._id}/clinic-access`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Clinic access updated');
        setClinicAccessDialog(false);
        setClinicAccessUser(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating clinic access:', error);
      toast.error(error.response?.data?.message || 'Failed to update clinic access');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/users/${editingUser._id}`,
        editUserForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('User updated successfully');
        setEditUserDialog(false);
        setEditingUser(null);
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    }
    handleMenuClose();
  };

  const handleInputChange = (field, value) => {
    setCreateUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Team Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateUserDialog(true)}
        >
          Create User
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label={`Team Members (${users.length})`} />
        <Tab label={`Join Requests (${joinRequests.length})`} />
      </Tabs>

      {/* Team Members Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} md={6} lg={4} key={user._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>{user.name}</Typography>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'admin' ? 'error' : 'primary'}
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, user._id)}
                      disabled={user.role === 'admin' && user._id !== user._id} // Prevent admin actions on other admins
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {user.phone}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Join Requests Tab */}
      {activeTab === 1 && (
        <Box>
          {joinRequests.length === 0 ? (
            <Alert severity="info">No pending join requests</Alert>
          ) : (
            <Grid container spacing={3}>
              {joinRequests.map((request) => (
                <Grid item xs={12} md={6} key={request._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">{request.user.name}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.user.email}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.user.phone}
                        </Typography>
                      </Box>
                      {request.message && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          <strong>Message:</strong> {request.message}
                        </Typography>
                      )}
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleJoinRequest(request._id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DenyIcon />}
                          onClick={() => handleJoinRequest(request._id, 'deny')}
                        >
                          Deny
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Create User Dialog */}
      <Dialog open={createUserDialog} onClose={() => setCreateUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={createUserForm.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={createUserForm.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone"
            value={createUserForm.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={createUserForm.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="dentist">Dentist</MenuItem>
              <MenuItem value="receptionist">Receptionist</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Temporary Password"
            type="password"
            value={createUserForm.temporaryPassword}
            onChange={(e) => handleInputChange('temporaryPassword', e.target.value)}
            margin="normal"
            required
            helperText="User will be required to change this password on first login"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateUserDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent
          onClick={() => {
            const user = users.find(u => u._id === selectedUserId);
            handleEditUser(user);
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edit User
        </MenuItemComponent>
        <MenuItemComponent
          onClick={() => {
            const user = users.find(u => u._id === selectedUserId);
            openClinicAccessDialog(user);
          }}
        >
          <BusinessIcon sx={{ mr: 1 }} />
          Edit Clinic Access
        </MenuItemComponent>
        <MenuItemComponent
          onClick={() => handleDeleteUser(selectedUserId)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete User
        </MenuItemComponent>
      </Menu>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onClose={() => setEditUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editUserForm.name}
            onChange={(e) => handleEditInputChange('name', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editUserForm.email}
            onChange={(e) => handleEditInputChange('email', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone"
            value={editUserForm.phone}
            onChange={(e) => handleEditInputChange('phone', e.target.value)}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Select
              value={editUserForm.role}
              onChange={(e) => handleEditInputChange('role', e.target.value)}
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="dentist">Dentist</MenuItem>
              <MenuItem value="receptionist">Receptionist</MenuItem>
              <MenuItem value="assistant">Assistant</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Clinic Access Dialog */}
      <Dialog open={clinicAccessDialog} onClose={() => setClinicAccessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Clinic Access</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Access Type</InputLabel>
              <Select
                value={clinicAccessForm.type}
                label="Access Type"
                onChange={(e) => setClinicAccessForm((p) => ({ ...p, type: e.target.value }))}
              >
                <MenuItem value="all">All clinics</MenuItem>
                <MenuItem value="subset">Specific clinics</MenuItem>
              </Select>
            </FormControl>
            {clinicAccessForm.type === 'subset' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Clinics</InputLabel>
                <Select
                  multiple
                  value={clinicAccessForm.clinics}
                  label="Clinics"
                  onChange={(e) => setClinicAccessForm((p) => ({ ...p, clinics: e.target.value }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const c = clinics.find(cl => cl._id === id);
                        return <Chip key={id} label={c ? c.name : id} />;
                      })}
                    </Box>
                  )}
                >
                  {clinics.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClinicAccessDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveClinicAccess}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team; 