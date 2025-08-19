import api from '../utils/apiConfig';

// Drug API service
export const drugAPI = {
  // Get all drugs with pagination and filters
  getDrugs: async (params = {}) => {
    const response = await api.get('/drugs', { params });
    return response.data;
  },

  // Get single drug by ID
  getDrug: async (id) => {
    const response = await api.get(`/drugs/${id}`);
    return response.data;
  },

  // Create new drug
  createDrug: async (drugData) => {
    const response = await api.post('/drugs', drugData);
    return response.data;
  },

  // Update existing drug
  updateDrug: async (id, drugData) => {
    const response = await api.put(`/drugs/${id}`, drugData);
    return response.data;
  },

  // Delete drug
  deleteDrug: async (id) => {
    const response = await api.delete(`/drugs/${id}`);
    return response.data;
  },

  // Get drug categories
  getDrugCategories: async () => {
    const response = await api.get('/drugs/categories');
    return response.data;
  },

  // Get drug forms
  getDrugForms: async () => {
    const response = await api.get('/drugs/forms');
    return response.data;
  },

  // Check drug interactions
  checkDrugInteractions: async (drugIds) => {
    const response = await api.post('/drugs/check-interactions', { drugIds });
    return response.data;
  },

  // Bulk import drugs
  bulkImportDrugs: async (drugs) => {
    const response = await api.post('/drugs/bulk-import', { drugs });
    return response.data;
  }
};
