// API configuration with dynamic URL detection
// Use environment variables for API configuration
let API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.8.87:5000/api';

// Function to detect and update API base URL
export const updateAPIBase = async (): Promise<string> => {
  const testUrls = [
    process.env.EXPO_PUBLIC_API_BASE_URL ? 
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/health` : 
      'http://localhost:5000/api/health',
    'http://192.168.8.87:5000/api/health', // Current network IP
    'http://127.0.0.1:5000/api/health',
    'http://10.0.2.2:5000/api/health', // Android emulator
    'http://172.19.112.1:5000/api/health', // Common development IP
    'http://192.168.1.100:5000/api/health', // Common local network IP
    'http://0.0.0.0:5000/api/health', // All interfaces
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`🔍 Testing API connectivity: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        const baseUrl = url.replace('/health', '');
        API_BASE = baseUrl;
        console.log('🌐 Updated API Base URL:', API_BASE);
        return API_BASE;
      }
    } catch (error: any) {
      console.log(`⚠️ Failed to connect to ${url}:`, error.message);
    }
  }
  
  // Fallback to environment variable or network IP
  console.log('⚠️ Could not detect API connectivity, using fallback URL');
  API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.8.87:5000/api';
  return API_BASE;
};

// Initialize API base URL
export const initializeAPI = async (): Promise<void> => {
  await updateAPIBase();
};

// Get current API base URL
export const getAPIBase = (): string => {
  return API_BASE;
};

// Export for backward compatibility
export { API_BASE };
