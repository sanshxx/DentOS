import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Business, Group, Add, Search } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const OrganizationChoice = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect if not authenticated or if user already has organization setup
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    
    // If user has an organization that's not the default, redirect to dashboard
    if (user && user.organization && user.organization.slug && user.organization.slug !== 'dentos-default') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleCreateOrganization = () => {
    navigate('/organization-setup');
  };

  const handleJoinOrganization = () => {
    navigate('/join-organization');
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
      <Card sx={{ maxWidth: 600, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              DentOS
            </Typography>
            <Typography variant="h5" gutterBottom>
              Welcome to DentOS!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose how you'd like to get started with DentOS
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={handleCreateOrganization}
              >
                <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Create New Organization
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start your own dental practice organization. You'll be the admin and can invite team members.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  size="large"
                  fullWidth
                >
                  Create Organization
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={handleJoinOrganization}
              >
                <Group sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Join Existing Organization
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Join an existing dental practice. Search for your organization and request to join.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Search />}
                  size="large"
                  fullWidth
                >
                  Join Organization
                </Button>
              </Paper>
            </Grid>
          </Grid>

          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              Need help? Contact your organization administrator or our support team.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrganizationChoice; 