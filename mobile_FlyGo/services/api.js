import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your backend URL
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          await AsyncStorage.setItem('accessToken', accessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại');
        // Navigation to login screen would be handled in the app
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  signup: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};

// Flight API
export const flightAPI = {
  searchFlights: async (searchParams) => {
    const response = await apiClient.get('/flights/search', {
      params: searchParams,
    });
    return response.data;
  },

  getFlightDetails: async (flightId) => {
    const response = await apiClient.get(`/flights/${flightId}`);
    return response.data;
  },

  getAirports: async (query = '') => {
    const response = await apiClient.get('/airports', {
      params: { search: query },
    });
    return response.data;
  },

  getAirlines: async () => {
    const response = await apiClient.get('/airlines');
    return response.data;
  },

  getFlightSeats: async (flightId) => {
    const response = await apiClient.get(`/flights/${flightId}/seats`);
    return response.data;
  },
};

// Booking API
export const bookingAPI = {
  createBooking: async (bookingData) => {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  },

  getBookings: async (userId) => {
    const response = await apiClient.get(`/bookings/user/${userId}`);
    return response.data;
  },

  getBookingDetails: async (bookingId) => {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  },

  updateBooking: async (bookingId, updateData) => {
    const response = await apiClient.put(`/bookings/${bookingId}`, updateData);
    return response.data;
  },

  cancelBooking: async (bookingId, reason = '') => {
    const response = await apiClient.post(`/bookings/${bookingId}/cancel`, {
      reason,
    });
    return response.data;
  },

  getBookingByReference: async (bookingReference) => {
    const response = await apiClient.get(`/bookings/reference/${bookingReference}`);
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  createPayment: async (paymentData) => {
    const response = await apiClient.post('/payments', paymentData);
    return response.data;
  },

  getPaymentStatus: async (paymentId) => {
    const response = await apiClient.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await apiClient.get('/payments/methods');
    return response.data;
  },

  processVNPayPayment: async (paymentData) => {
    const response = await apiClient.post('/payments/vnpay', paymentData);
    return response.data;
  },

  processMoMoPayment: async (paymentData) => {
    const response = await apiClient.post('/payments/momo', paymentData);
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put('/users/profile', userData);
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await apiClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.post('/users/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

// General utility functions
export const apiUtils = {
  handleApiError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        message: data.message || `Request failed with status ${status}`,
        status,
        details: data,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your internet connection.',
        status: 0,
        details: error.request,
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
        details: error,
      };
    }
  },

  isNetworkError: (error) => {
    return !error.response && error.request;
  },

  isAuthError: (error) => {
    return error.response?.status === 401;
  },

  isServerError: (error) => {
    return error.response?.status >= 500;
  },
};

// Export axios instance for custom requests
export { apiClient };
export default apiClient;