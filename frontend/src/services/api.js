import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/token', formData);
  },
  getUserProfile: () => api.get('/api/users/profile'),
  updateUserProfile: (userData) => api.put('/api/users/me', userData),
};

// Images API
export const imagesAPI = {
  uploadImage: (file, isReference = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_reference', isReference);
    return api.post('/api/upload', formData);
  },
  getUserImages: (referenceOnly = false) => {
    return api.get('/api/images', { params: { reference_only: referenceOnly } });
  },
  getImage: (imageId) => api.get(`/api/images/${imageId}`),
  matchImage: (imageId) => api.post(`/api/match/${imageId}`),
  getMatchHistory: () => api.get('/api/match-history'),
};

export default api;
