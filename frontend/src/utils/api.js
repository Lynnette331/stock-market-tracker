import axios from 'axios';

// Create axios instance with base configuration
const getBaseURL = () => {
  // Check if we have the environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Production fallback
  if (window.location.hostname.includes('netlify.app') || process.env.NODE_ENV === 'production') {
    console.log('Using production fallback URL for hostname:', window.location.hostname);
    return 'https://stock-market-tracker-backend.onrender.com/api';
  }
  
  // Development default
  console.log('Using development URL');
  return 'http://localhost:5000/api';
};

const baseURL = getBaseURL();
console.log('Final API Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;