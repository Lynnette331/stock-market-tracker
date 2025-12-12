import axios from 'axios';

// FORCE PRODUCTION URL - NO MORE ENVIRONMENT DETECTION ISSUES
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://stock-market-tracker-backend.onrender.com/api';

console.log('🚀 FORCED API BASE URL:', API_BASE_URL);
console.log('🌍 Current hostname:', window.location.hostname);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🔥 FINAL API REQUEST:', {
      method: config.method?.toUpperCase(),
      endpoint: config.url,
      baseURL: config.baseURL,
      FULL_URL: `${config.baseURL}${config.url}`,
      timestamp: new Date().toLocaleTimeString()
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
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

// Test API configuration on load
console.log('✅ API Instance Created:', {
  baseURL: api.defaults.baseURL,
  timeout: api.defaults.timeout,
  withCredentials: api.defaults.withCredentials
});

export default api;