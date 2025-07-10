import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5182/api',
  timeout: 10000,
});

// Request interceptor to add JWT token to headers
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

// Response interceptor to handle 401 errors (invalid token)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, remove it and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Improve error handling - extract meaningful error messages
    if (error.response?.data) {
      if (typeof error.response.data === 'object') {
        // If it's a validation error object, extract the message
        if (error.response.data.errors) {
          // ASP.NET validation errors
          const firstError = Object.values(error.response.data.errors)[0];
          error.message = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (error.response.data.message) {
          error.message = error.response.data.message;
        } else if (error.response.data.title) {
          error.message = error.response.data.title;
        }
      } else if (typeof error.response.data === 'string') {
        error.message = error.response.data;
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  registerCandidate: (userData) => api.post('/auth/register/candidate', userData),
  registerEmployer: (userData) => api.post('/auth/register/employer', userData),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (userData) => api.put('/user/profile', userData),
  getUsers: () => api.get('/user'),
};

export const vacancyAPI = {
  getVacancies: (page = 1, pageSize = 15) => api.get(`/vacancies?page=${page}&pageSize=${pageSize}`),
  getVacancy: (id) => api.get(`/vacancies/${id}`),
  createVacancy: (vacancyData) => api.post('/vacancies', vacancyData),
  updateVacancy: (id, vacancyData) => api.put(`/vacancies/${id}`, vacancyData),
  deleteVacancy: (id) => api.delete(`/vacancies/${id}`),
  getMyVacancies: () => api.get('/vacancies/my'),
};

export const applicationAPI = {
  getApplications: () => api.get('/applications'),
  getApplication: (id) => api.get(`/applications/${id}`),
  createApplication: (applicationData) => api.post('/applications', applicationData),
  updateApplicationStatus: (id, status) => api.put(`/applications/${id}/status?status=${status}`),
  withdrawApplication: (id) => api.put(`/applications/${id}/withdraw`),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
};

export const messageAPI = {
 getMessages: (vacancyId, candidateId) =>
    api.get(`/messages/vacancy/${vacancyId}/candidate/${candidateId}`),
  createMessage: (messageData) => api.post('/messages', messageData),
};

export default api;