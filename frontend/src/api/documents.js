import axios from 'axios';
import { API_URL } from '../utils/apiConfig';

// Get all documents for a patient
export const getPatientDocuments = async (patientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/patients/${patientId}/documents`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching documents' };
  }
};

// Upload a document
export const uploadDocument = async (patientId, formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/patients/${patientId}/documents`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // You can use this for progress tracking in the UI
        if (formData.onProgress) {
          formData.onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error uploading document' };
  }
};

// Get a single document
export const getDocument = async (patientId, documentId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/patients/${patientId}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching document' };
  }
};

// Download a document
export const downloadDocument = async (patientId, documentId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/patients/${patientId}/documents/${documentId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error downloading document' };
  }
};

// Update document details
export const updateDocument = async (patientId, documentId, documentData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/patients/${patientId}/documents/${documentId}`, documentData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating document' };
  }
};

// Delete a document
export const deleteDocument = async (patientId, documentId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/patients/${patientId}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting document' };
  }
};

// Search documents
export const searchDocuments = async (patientId, searchQuery) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/patients/${patientId}/documents/search`, {
      params: { query: searchQuery },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error searching documents' };
  }
};