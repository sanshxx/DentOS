import api from '../utils/apiConfig';

// Prescription API service
export const prescriptionAPI = {
  // Get all prescriptions with pagination and filters
  getPrescriptions: async (params = {}) => {
    const response = await api.get('/prescriptions', { params });
    return response.data;
  },

  // Get single prescription by ID
  getPrescription: async (id) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  // Create new prescription
  createPrescription: async (prescriptionData) => {
    const response = await api.post('/prescriptions', prescriptionData);
    return response.data;
  },

  // Update existing prescription
  updatePrescription: async (id, prescriptionData) => {
    const response = await api.put(`/prescriptions/${id}`, prescriptionData);
    return response.data;
  },

  // Delete prescription
  deletePrescription: async (id) => {
    const response = await api.delete(`/prescriptions/${id}`);
    return response.data;
  },

  // Issue prescription to patient
  issuePrescriptionToPatient: async (id) => {
    const response = await api.put(`/prescriptions/${id}/issue`);
    return response.data;
  },

  // Get prescription analytics
  getPrescriptionAnalytics: async (params = {}) => {
    const response = await api.get('/prescriptions/analytics', { params });
    return response.data;
  },

  // Get prescription statistics
  getPrescriptionStats: async (params = {}) => {
    const response = await api.get('/prescriptions/stats', { params });
    return response.data;
  },

  // Get prescriptions by patient
  getPrescriptionsByPatient: async (patientId, params = {}) => {
    const response = await api.get(`/prescriptions/patient/${patientId}`, { params });
    return response.data;
  },

  // Get prescriptions by doctor
  getPrescriptionsByDoctor: async (doctorId, params = {}) => {
    const response = await api.get(`/prescriptions/doctor/${doctorId}`, { params });
    return response.data;
  },

  // Search prescriptions
  searchPrescriptions: async (query, params = {}) => {
    const response = await api.get('/prescriptions/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  },

  // Export prescriptions
  exportPrescriptions: async (params = {}) => {
    const response = await api.get('/prescriptions/export', { params });
    return response.data;
  },

  // Bulk update prescription status
  bulkUpdateStatus: async (prescriptionIds, status) => {
    const response = await api.put('/prescriptions/bulk-status', {
      prescriptionIds,
      status
    });
    return response.data;
  }
};
