// src/services/progressAPI.js
// Progress tracking API — talks to backend via Vercel proxy (/api)
import api from './api';

// ═══════════════════════════════════════════════════════════
// MARK LESSON AS COMPLETED
// ═══════════════════════════════════════════════════════════
export const markLessonComplete = (lessonId, timeSpentSeconds = 0, courseId = null) =>
  api.post(`/progress/lesson/${lessonId}/complete`, {
    timeSpentSeconds,
    courseId,
  });

// ═══════════════════════════════════════════════════════════
// MARK LESSON AS ACCESSED (opened but not completed)
// ═══════════════════════════════════════════════════════════
export const markLessonAccessed = (lessonId, timeSpentSeconds = 0) =>
  api.post(`/progress/lesson/${lessonId}/access`, {
    timeSpentSeconds,
  });

// ═══════════════════════════════════════════════════════════
// FETCH ALL USER PROGRESS
// ═══════════════════════════════════════════════════════════
export const getMyProgress = () => api.get('/progress/me');

// ═══════════════════════════════════════════════════════════
// FETCH PROGRESS FOR A COURSE
// ═══════════════════════════════════════════════════════════
export const getCourseProgress = (courseId) =>
  api.get(`/progress/course/${courseId}`);

// ═══════════════════════════════════════════════════════════
// FETCH PROGRESS FOR A SINGLE LESSON
// ═══════════════════════════════════════════════════════════
export const getLessonProgress = (lessonId) =>
  api.get(`/progress/lesson/${lessonId}`);