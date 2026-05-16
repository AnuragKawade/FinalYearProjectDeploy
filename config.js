// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000'
  },
  production: {
    baseURL: 'https://final-year-project-deploy.vercel.app'
  }
};

// Detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const currentConfig = isProduction ? API_CONFIG.production : API_CONFIG.development;

// Export API base URL
window.API_BASE_URL = currentConfig.baseURL;

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('API Base URL:', window.API_BASE_URL);