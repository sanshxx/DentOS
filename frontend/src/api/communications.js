import axios from 'axios';
import { API_URL } from '../utils/apiConfig';

// Get all communications for a patient
export const getPatientCommunications = async (patientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/patients/${patientId}/communications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching communications' };
  }
};

// Send a communication
export const sendCommunication = async (patientId, communicationData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/patients/${patientId}/communications`, communicationData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error sending communication' };
  }
};

// Get a single communication
export const getCommunication = async (patientId, communicationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/patients/${patientId}/communications/${communicationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching communication' };
  }
};

// Update communication status
export const updateCommunicationStatus = async (patientId, communicationId, status) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/patients/${patientId}/communications/${communicationId}/status`, { status }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating communication status' };
  }
};

// Get communication statistics
export const getCommunicationStats = async (patientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/patients/${patientId}/communications/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching communication statistics' };
  }
};

// Send bulk communications
export const sendBulkCommunications = async (communicationData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/patients/communications/bulk`, communicationData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error sending bulk communications' };
  }
};