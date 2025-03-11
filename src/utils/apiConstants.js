// Base API configuration

// Change this to your backend URL
export const API_BASE_URL = 'http://localhost:8080';

export const ENDPOINTS = {
  REGISTER: '/register_user',
  LOGIN: '/login',
  HEALTH_CHECK: '/backend_health',
  UPLOAD_ACCELERATION: '/health/upload_acceleration',
  GET_ACCELERATION: '/health/acceleration_data',
};

// If you're testing on a physical device, use your computer's local IP address instead of localhost
// For example: export const API_BASE_URL = 'http://192.168.1.100:8080';