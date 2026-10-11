// frontend/src/services/api.js
import axios from 'axios';

// ⭐ Use /api proxy (Vercel forwards to Railway - no CORS!)
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;

    if (status === 403 && data?.needsSubscription) {
      const from = window.location.pathname;
      if (!from.startsWith('/subscriptions')) {
        window.location.href = `/subscriptions?from=${encodeURIComponent(from)}`;
      }
    }

    if (status === 401) {
      const isLoginAttempt = err.config?.url?.includes('/auth/login');
      const isRegisterAttempt = err.config?.url?.includes('/auth/register');
      if (!isLoginAttempt && !isRegisterAttempt) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(err);
  }
);

// AUTH
export const register = (userData) => api.post('/auth/register', userData);
export const login = (userData) => api.post('/auth/login', userData);
export const getMe = () => api.get('/auth/me');
export const changePassword = (data) => api.put('/auth/change-password', data);
export const updateProfile = (data) => api.put('/auth/profile', data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.put(`/auth/reset-password/${token}`, { password });

// COURSES
export const getCourses = (params) => api.get('/courses', { params });
export const getCourse = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// EXAMS
export const getMyResults = () => api.get('/exams/results/my');
export const submitExam = (id, data) => api.post(`/exams/${id}/submit`, data);
export const getAvailableExams = () => api.get('/exams/available');

// CERTIFICATES
export const verifyCertificate = (code) => api.get(`/certificates/verify/${code}`);

// NOTIFICATIONS
export const getNotifications = (params) => api.get('/notifications', { params });
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

export default api;