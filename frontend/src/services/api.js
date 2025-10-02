import axios from 'axios';

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api`; // Backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const riskAPI = {
  submitQuiz: (userId, responses) => 
    api.post('/risk/quiz', { userId, responses }),
  
  getRiskProfile: (userId) => 
    api.get(`/risk/profile/${userId}`),
  
  getMetrics: (userId) => 
    api.get(`/risk/metrics/${userId}`),
  
  simulate: (userId, marketChange) => 
    api.post('/risk/simulate', { userId, marketChange }),
  
  getBadges: (userId) => 
    api.get(`/risk/badges/${userId}`)
};

export default api;