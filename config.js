// Configuration for API endpoints
const CONFIG = {
  API_URL: ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:3000'
    : 'https://contact-form-production-d728.up.railway.app'
};
