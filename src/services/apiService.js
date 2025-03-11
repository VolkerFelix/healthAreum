import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../utils/apiConstants';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class ApiService {
  // User registration
  async registerUser(userData) {
    try {
      const response = await api.post(ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // User login
  async loginUser(credentials) {
    try {
      const response = await api.post(ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Upload acceleration data
  async uploadAccelerationData(data, token) {
    try {
      const response = await api.post(
        ENDPOINTS.UPLOAD_ACCELERATION, 
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload acceleration data error:', error);
      throw error;
    }
  }

  // Get acceleration data history
  async getAccelerationData(token) {
    try {
      const response = await api.get(
        ENDPOINTS.GET_ACCELERATION,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get acceleration data error:', error);
      throw error;
    }
  }

  // Health check
  async checkBackendHealth() {
    try {
      const response = await api.get(ENDPOINTS.HEALTH_CHECK);
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
}

export default new ApiService();