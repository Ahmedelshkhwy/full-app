import axios from 'axios';

// Dynamic API configuration based on environment
const getBaseURL = () => {
  if (__DEV__) {
    // Development - use localhost
    return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  }
  // Production - use production domain
  return process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-production-domain.com/api';
};

// Create axios instance with custom settings
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  // Accept 2xx, 3xx, and 4xx status codes
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`🌐 Using Base URL: ${config.baseURL}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Wait function
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Initialize retry count if not set
    if (typeof originalRequest._retry === 'undefined') {
      originalRequest._retry = 1;
    }

    console.error('❌ Response Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      retry: originalRequest._retry,
    });

    // Retry on network errors
    if (originalRequest._retry < MAX_RETRIES && 
        (error.message === 'Network Error' || 
         error.code === 'ECONNABORTED' || 
         error.message.includes('timeout'))) {
      
      originalRequest._retry++;
      
      // Wait before retrying
      await wait(RETRY_DELAY * originalRequest._retry);
      
      console.log(`🔄 Retrying request (${originalRequest._retry}/${MAX_RETRIES})`);
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default apiClient;