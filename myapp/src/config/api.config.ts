import { getAPIBase, updateAPIBase } from './api';

// API configuration object
export const apiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.8.87:5000/api',
  
  // Function to update base URL
  updateBaseURL: async () => {
    try {
      const newBaseURL = await updateAPIBase();
      apiConfig.baseURL = newBaseURL;
      console.log('🌐 Updated API Base URL in config:', apiConfig.baseURL);
      return newBaseURL;
    } catch (error) {
      console.log('⚠️ Could not update API base URL in config');
      return apiConfig.baseURL;
    }
  },

  // Initialize the config
  initialize: async () => {
    await apiConfig.updateBaseURL();
  }
};

// Initialize the config immediately
apiConfig.initialize().catch(console.error);

// Helper function to get full API URL
export const getAPIUrl = (endpoint: string): string => {
  const API_BASE = getAPIBase();
  return `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
