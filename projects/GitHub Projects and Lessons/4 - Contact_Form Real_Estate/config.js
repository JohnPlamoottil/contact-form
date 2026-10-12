// Configuration for API endpoints
const CONFIG = {
  // Set to your Railway backend URL (e.g., https://contact-form-prod-xxxx.up.railway.app)
  // For local development, use http://localhost:3000
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'https://your-railway-url-here.up.railway.app'
};
