import api from '../utils/apiConfig';

// Patient API service
export const patientAPI = {
  // Get all patients with pagination and filters
  getPatients: async (params = {}) => {
    const response = await api.get('/patients', { 
      params,
      headers: { 'X-Clinic-Scope': 'all' }
    });
    return response.data;
  },

  // Get a single patient by ID
  getPatient: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Create a new patient
  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  // Update an existing patient
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  // Delete a patient
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  // Search patients
  searchPatients: async (searchTerm) => {
    const response = await api.get('/patients', { 
      params: { search: searchTerm, limit: 50 } 
    });
    return response.data;
  }
};
