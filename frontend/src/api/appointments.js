import api from '../utils/apiConfig';

// Appointment API service
export const appointmentAPI = {
  // Get all appointments with pagination and filters
  getAppointments: async (params = {}) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  // Get a single appointment by ID
  getAppointment: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Create a new appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Update an existing appointment
  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  // Delete an appointment
  deleteAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  // Get appointments for a specific patient
  getPatientAppointments: async (patientId) => {
    const response = await api.get('/appointments', { 
      params: { patientId, limit: 100 },
      headers: { 'X-Clinic-Scope': 'all' }
    });
    return response.data;
  },

  // Get upcoming appointments
  getUpcomingAppointments: async () => {
    const response = await api.get('/appointments', { 
      params: { status: 'scheduled', limit: 100 },
      headers: { 'X-Clinic-Scope': 'all' }
    });
    return response.data;
  }
};
