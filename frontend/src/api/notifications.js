import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all notifications
export const getNotifications = async (page = 1, limit = 20) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/notifications?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching notifications' };
  }
};

// Get unread notifications count
export const getUnreadCount = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching unread count' };
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error marking notification as read' };
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error marking all notifications as read' };
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/notifications/${notificationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting notification' };
  }
};
