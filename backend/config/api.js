// API configuration
const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://192.168.1.100:3000' : 'https://your-production-server.com',
  ENDPOINTS: {
    CHAT: '/api/chat',
    HEALTH: '/health',
    COLLECTION_INFO: '/api/collection-info'
  },
  TIMEOUT: 30000, // 30 seconds
};

export default API_CONFIG;
