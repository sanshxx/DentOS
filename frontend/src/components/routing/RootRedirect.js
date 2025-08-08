import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only clear auth data if this is the first time visiting the app
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      console.log('🔍 First visit - clearing authentication data...');
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  useEffect(() => {
    console.log('🔍 RootRedirect Debug:');
    console.log('   Loading:', loading);
    console.log('   Is authenticated:', isAuthenticated);
    
    if (!loading) {
      if (isAuthenticated) {
        console.log('   User is authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('   User is not authenticated, redirecting to login');
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate]);



  // Show loading while checking authentication
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Loading...
      </Typography>
      
      {/* Loading info */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Checking authentication...
      </Typography>
    </Box>
  );
};

export default RootRedirect; 