// services/index.js - Service exports
export { default as apiClient } from './api';
export {
  authAPI,
  flightAPI,
  bookingAPI,
  paymentAPI,
  userAPI,
  apiUtils,
} from './api';

// Re-export commonly used functions
export { default } from './api';