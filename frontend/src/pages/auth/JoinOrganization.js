import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowBack, Business, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

import { API_URL } from '../../utils/apiConfig';

const JoinOrganization = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [requestedOrgs, setRequestedOrgs] = useState(new Set());

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter an organization name to search');
      return;
    }

    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/organizations/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrganizations(response.data.data);
        if (response.data.data.length === 0) {
          toast.info('No organizations found matching your search');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search organizations');
    } finally {
      setSearching(false);
    }
  };

  const handleRequestJoin = async (organizationId, organizationName) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/organizations/${organizationId}/join-request`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`Join request sent to ${organizationName}`);
        setRequestedOrgs(prev => new Set([...prev, organizationId]));
      }
    } catch (error) {
      console.error('Request error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send join request';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/organization-choice');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Card sx={{ maxWidth: 800, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" color="primary">
              Join Organization
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Search for your organization and request to join. Your request will be reviewed by the organization administrator.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>How it works:</strong> Search for your organization, click "Request to Join", and wait for admin approval. 
              You'll receive an email notification once your request is approved or denied.
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Search organizations"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter organization name..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={searching}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={!searchTerm.trim() || searching}
                startIcon={searching ? <CircularProgress size={20} /> : <Search />}
                sx={{ minWidth: 120 }}
              >
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </Box>
          </Box>

          {organizations.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Search Results ({organizations.length})
              </Typography>
              <List>
                {organizations.map((org, index) => (
                  <React.Fragment key={org._id}>
                    <ListItem sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Business sx={{ mr: 2, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <ListItemText
                            primary={org.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {org.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>
                                {org.address && (
                                  <Typography variant="body2" color="text.secondary">
                                    {org.address.city}, {org.address.state}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {requestedOrgs.has(org._id) ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Request Sent"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Button
                              variant="outlined"
                              onClick={() => handleRequestJoin(org._id, org.name)}
                              disabled={loading}
                              size="small"
                            >
                              Request to Join
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                    {index < organizations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              Can't find your organization? Ask your administrator to invite you or create a new organization.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default JoinOrganization; 