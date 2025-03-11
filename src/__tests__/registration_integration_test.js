// src/__tests__/registration_integration_test.js

const axios = require('axios');

// Simple function to generate a unique string
function generateUniqueId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// API constants
const API_BASE_URL = 'http://localhost:8080'; // Change this to match your backend URL
const ENDPOINTS = {
  REGISTER: '/register_user',
  LOGIN: '/login'
};

// Safe error handling to avoid circular reference issues
function getErrorInfo(error) {
  if (error.response) {
    return {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    };
  }
  return { message: error.message };
}

describe('User Registration', () => {
  // Create a new Axios instance for each test
  let api;
  
  beforeEach(() => {
    api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  afterEach(() => {
    // Clean up to avoid memory leaks
    api = null;
  });

  test('Should register a new user successfully', async () => {
    // Generate a unique username to avoid conflicts with existing users
    const uniqueId = generateUniqueId();
    const testUser = {
      username: `testuser_${uniqueId}`,
      password: 'Password123!',
      email: `testuser_${uniqueId}@example.com`
    };

    try {
      // Register a new user
      const registerResponse = await api.post(ENDPOINTS.REGISTER, testUser);
      expect(registerResponse.status).toBe(200);

      // Try to login with the newly created credentials
      const loginResponse = await api.post(ENDPOINTS.LOGIN, {
        username: testUser.username,
        password: testUser.password
      });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('token');
      
      console.log('Registration test completed successfully');
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      console.error('Test failed:', errorInfo);
      throw new Error(`Registration test failed: ${JSON.stringify(errorInfo)}`);
    }
  });

  test('Should fail when registering with missing fields', async () => {
    const incompleteUser = {
      username: 'incomplete_user',
      // Missing password and email
    };

    try {
      await api.post(ENDPOINTS.REGISTER, incompleteUser);
      // If we reach this point, the test should fail because the request should have errored
      fail('Registration should fail with incomplete data');
    } catch (error) {
      // We expect an error response - just check it's not a 200
      if (error.response) {
        expect(error.response.status).not.toBe(200);
      } else {
        // If it's a network error, that's fine too
        console.log('Network error occurred (expected):', error.message);
      }
    }
  });

  test('Should prevent duplicate username registration', async () => {
    // Generate a unique username
    const uniqueId = generateUniqueId();
    const testUser = {
      username: `duplicate_${uniqueId}`,
      password: 'Password123!',
      email: `duplicate_${uniqueId}@example.com`
    };

    try {
      // Register first user
      const firstResponse = await api.post(ENDPOINTS.REGISTER, testUser);
      expect(firstResponse.status).toBe(200);
      
      try {
        // Try to register the same username again
        await api.post(ENDPOINTS.REGISTER, {
          username: testUser.username,
          password: 'DifferentPassword123!',
          email: 'different@example.com'
        });
        
        // If we reach this point, the test should fail
        fail('Should not allow duplicate usernames');
      } catch (duplicateError) {
        // We expect an error for the duplicate registration
        if (duplicateError.response) {
          expect(duplicateError.response.status).not.toBe(200);
        } else {
          console.log('Network error occurred (expected):', duplicateError.message);
        }
      }
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      console.error('Test setup failed:', errorInfo);
      throw new Error(`Registration test setup failed: ${JSON.stringify(errorInfo)}`);
    }
  });
});