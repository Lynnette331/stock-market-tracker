import axios from 'axios';

// Create axios instance with base configuration
const getBaseURL = () => {
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    hostname: window.location.hostname
  });
  
  // Check if we have the environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    // Ensure the API URL ends with /api
    const apiUrl = process.env.REACT_APP_API_URL;
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
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
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response success:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
      message: error.message,
      response: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;