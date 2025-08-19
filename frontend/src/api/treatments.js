import api from '../utils/apiConfig';

export const treatmentsAPI = {
  // Get treatment definitions (catalog)
  getDefinitions: async (params = {}) => {
    const response = await api.get('/treatments', { params });
    return response.data;
  }
};
