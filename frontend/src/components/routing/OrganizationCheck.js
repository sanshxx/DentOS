import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

// Get API URL from environment variables or use default
import { API_URL } from '../../utils/apiConfig';

const OrganizationCheck = ({ children }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasOrganization, setHasOrganization] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);

  useEffect(() => {
    const checkOrganization = async () => {
      console.log('🔍 OrganizationCheck Debug:');
      console.log('   Token exists:', !!token);
      console.log('   User exists:', !!user);
      console.log('   API_URL:', API_URL);
      
      if (!token || !user) {
        console.log('   No token or user, setting loading to false');
        setLoading(false);
        return;
      }

      try {
        console.log('   Making organization and user checks...');
        // Check if user has an organization and if they need to change password
        // Ensure every call carries clinic scope even if some pages use bare axios
        const commonHeaders = {
          Authorization: `Bearer ${token}`,
          'X-Clinic-Scope': localStorage.getItem('clinicScope') || 'all'
        };
        const [orgResponse, userResponse] = await Promise.all([
          axios.get(`${API_URL}/organizations/my`, { headers: commonHeaders }),
          axios.get(`${API_URL}/auth/me`, { headers: commonHeaders })
        ]);

        console.log('   Organization response:', orgResponse.data);
        console.log('   User response:', userResponse.data);
        
        // Check organization status
        if (orgResponse.data.success && orgResponse.data.data) {
          const organization = orgResponse.data.data;
          console.log('   Organization slug:', organization.slug);
          
          // Check if user is assigned to the default organization
          // Users assigned to default organization need to complete setup
          if (organization.slug === 'dentos-default') {
            console.log('   User is in default organization, needs setup');
            setHasOrganization(false); // Need to complete setup
          } else {
            console.log('   User has completed organization setup');
            setHasOrganization(true); // Has completed setup
          }
        } else {
          console.log('   No organization data, needs setup');
          setHasOrganization(false);
        }

        // Check if user needs to change password
        if (userResponse.data.success && userResponse.data.data) {
          const forceChange = userResponse.data.data.forcePasswordChange || false;
          console.log('   Force password change:', forceChange);
          setForcePasswordChange(forceChange);
        }
      } catch (error) {
        console.error('🔍 OrganizationCheck Error:', error);
        console.error('   Error response:', error.response?.data);
        console.error('   Error status:', error.response?.status);
        // If user doesn't have an organization, redirect to setup
        setHasOrganization(false);
      } finally {
        console.log('   Setting loading to false');
        setLoading(false);
      }
    };

    checkOrganization();
  }, [token, user]);

  useEffect(() => {
    console.log('🔍 OrganizationCheck Navigation Debug:');
    console.log('   Loading:', loading);
    console.log('   User exists:', !!user);
    console.log('   Has organization:', hasOrganization);
    console.log('   Force password change:', forcePasswordChange);
    
    if (!loading && user) {
      if (forcePasswordChange) {
        console.log('   Redirecting to change password');
        navigate('/change-password');
      } else if (!hasOrganization) {
        console.log('   Redirecting to organization choice');
        navigate('/organization-choice');
      } else {
        console.log('   User has organization, showing dashboard');
      }
    }
  }, [loading, hasOrganization, forcePasswordChange, user, navigate]);

  if (loading) {
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
          Checking organization setup...
        </Typography>
      </Box>
    );
  }

  if (!hasOrganization) {
    return null; // Will redirect to organization setup
  }

  return children;
};

export default OrganizationCheck; 