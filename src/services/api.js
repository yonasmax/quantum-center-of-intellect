// frontend/src/services/api.js
// Kept for non-auth API calls (courses, exams, certificates, notifications).
// Auth is now handled by Supabase (see AuthContext.jsx).
import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase session token as Bearer (if available)
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await import('../supabaseClient')
        .then((m) => m.supabase.auth.getSession());
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      // ignore
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
      // For non-auth routes, redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

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
