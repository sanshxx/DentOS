// Centralized API Configuration
// This ensures all API requests use the correct base URL with /api prefix

import axios from 'axios';

// Get the base URL from environment variable
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Ensure the URL ends with /api
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

// Debug logging
console.log('🔍 API Configuration Debug:');
console.log('   REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('   BASE_URL:', BASE_URL);
console.log('   Final API_URL:', API_URL);

// Create axios instance with default configuration

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { API_URL, apiClient };
export default apiClient;
