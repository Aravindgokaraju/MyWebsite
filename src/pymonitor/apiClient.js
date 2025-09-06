// src/api/apiClient.js
import axios from 'axios';
import { getCookie } from '../utils/cookies'; // Helper to get Django CSRF token

// Determine base URL based on environment
const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8000/';

console.log('API Base URL:', baseURL); // Debug logging

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Helps Django identify AJAX requests
  },
  withCredentials: true, // Required for session/cookie authentication
});

// Add CSRF token to all mutating requests (POST, PUT, PATCH, DELETE)
apiClient.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  const method = config.method?.toUpperCase();

  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  // Add Authorization header if token exists (for JWT)
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle Django REST Framework error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // DRF typically returns errors in this format
      const drfError = error.response.data;
      
      if (typeof drfError === 'object') {
        // Handle field-specific validation errors
        if (drfError.detail) {
          error.drfMessage = drfError.detail;
        } else {
          // Format field errors as string
          error.drfMessage = Object.entries(drfError)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
        }
      }
      
      // Common HTTP status code handling
      switch (error.response.status) {
        case 401:
          // Handle unauthorized (redirect to login or refresh token)
          break;
        case 403:
          // Handle forbidden (CSRF failure or permission denied)
          break;
        case 404:
          error.drfMessage = 'Resource not found';
          break;
        case 500:
          error.drfMessage = 'Server error';
          break;
        default:
          error.drfMessage = 'An unexpected error occurred';
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;