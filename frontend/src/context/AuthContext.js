import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';

  // Get API URL from environment variables or use default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Debug API URL
console.log('🔍 API URL Debug:');
console.log('   REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);
console.log('   Final API_URL:', API_URL);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token
  useEffect(() => {
    if (token) {
      // Format token with Bearer prefix for API requests
      const formattedToken = `Bearer ${token}`;
      axios.defaults.headers.common['Authorization'] = formattedToken;
      loadUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Check token expiration and validity
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        // Check if token is expired
        if (decoded.exp < currentTime) {
          logout();
          toast.error('Your session has expired. Please login again.');
          return;
        }
        
        // Check if token has the correct structure
        if (!decoded.id) {
          console.warn('Token has invalid structure, logging out');
          logout();
          toast.error('Invalid session. Please login again.');
          return;
        }
        
      } catch (err) {
        console.error('Token validation failed:', err);
        logout();
        toast.error('Session invalid. Please login again.');
      }
    }
  }, [token]);

  // Load user
  const loadUser = async () => {
    try {
      setLoading(true);
      
      // Use API_URL variable instead of hardcoded URL
      const res = await axios.get(`${API_URL}/auth/me`);
      setUser(res.data.data);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Load user error:', err);
      setError(err.response?.data?.message || 'Error loading user');
      setToken(null);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Clear all auth data and restart
  const clearAuthData = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem('token');
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('🔍 Register Debug:');
      console.log('   API_URL:', API_URL);
      console.log('   Making request to:', `${API_URL}/auth/register`);
      console.log('   User data:', userData);
      
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      // Store the raw token (without Bearer prefix)
      const rawToken = res.data.token;
      
      // Set token in localStorage and state
      setToken(rawToken);
      localStorage.setItem('token', rawToken);
      
      // Set axios header immediately
      const formattedToken = `Bearer ${rawToken}`;
      axios.defaults.headers.common['Authorization'] = formattedToken;
      
      // Now load user with proper headers
      await loadUser();
      toast.success('Registration successful!');
      return res.data;
    } catch (err) {
      console.error('🔍 Register Error Debug:');
      console.error('   Error:', err);
      console.error('   Error response:', err.response?.data);
      console.error('   Error status:', err.response?.status);
      console.error('   Error message:', err.message);
      
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Use API_URL variable instead of hardcoded URL
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // Store the raw token (without Bearer prefix)
      const rawToken = res.data.token;
      
      // Set token in localStorage and state
      setToken(rawToken);
      localStorage.setItem('token', rawToken);
      
      // Set axios header immediately
      const formattedToken = `Bearer ${rawToken}`;
      axios.defaults.headers.common['Authorization'] = formattedToken;
      
      // Now load user with proper headers
      await loadUser();
      toast.success('Login successful!');
      return res.data;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.info('You have been logged out');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/auth/updatedetails`, userData);
      setUser(res.data.data);
      toast.success('Profile updated successfully!');
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/auth/updatepassword`, passwordData);
      toast.success('Password updated successfully!');
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
      toast.error(err.response?.data?.message || 'Failed to update password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      toast.success('Password reset email sent!');
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
      toast.error(err.response?.data?.message || 'Failed to send reset email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (password, resetToken) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/auth/resetpassword/${resetToken}`, { password });
      toast.success('Password has been reset!');
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      toast.error(err.response?.data?.message || 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        loadUser,
        updateProfile,
        updatePassword,
        forgotPassword,
        resetPassword,
        clearAuthData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);