// src/services/progressAPI.js
// Progress tracking API — talks to backend via Vercel proxy (/api)
// Includes localStorage fallback for when backend is unavailable
import api from './api';

// ═══════════════════════════════════════════════════════════
// LOCAL STORAGE FALLBACK
// Used when backend is down so students don't lose progress
// ═══════════════════════════════════════════════════════════
const LOCAL_KEY = 'qci_progress_v1';

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocal(lessonId, data) {
  const current = loadLocal();
  current[lessonId] = { ...current[lessonId], ...data, updatedAt: Date.now() };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(current));
}

function getAllLocalProgress() {
  const local = loadLocal();
  const items = Object.entries(local).map(([lessonId, data]) => ({
    lesson: { _id: lessonId },
    ...data,
  }));
  const completed = items.filter((p) => p.completed).length;
  return {
    success: true,
    count: items.length,
    stats: {
      totalCompleted: completed,
      totalTimeSeconds: 0,
      totalTimeHours: 0,
    },
    progress: items,
    _source: 'local', // marker
  };
}

// ═══════════════════════════════════════════════════════════
// MARK LESSON AS COMPLETED
// ═══════════════════════════════════════════════════════════
export const markLessonComplete = async (lessonId, timeSpentSeconds = 0, courseId = null) => {
  // Always save locally first (never lose progress)
  saveLocal(lessonId, {
    completed: true,
    completedAt: new Date().toISOString(),
    timeSpentSeconds,
    courseId,
  });

  // Then try to sync with backend
  try {
    const res = await api.post(`/progress/lesson/${lessonId}/complete`, {
      timeSpentSeconds,
      courseId,
    });
    return res;
  } catch (err) {
    // Backend failed — that's OK, local save worked
    console.warn('[progress] Backend sync failed, saved locally:', err.message);
    return {
      data: {
        success: true,
        progress: {
          lesson: lessonId,
          completed: true,
          completedAt: new Date().toISOString(),
          timeSpentSeconds,
        },
        _source: 'local',
      },
    };
  }
};

// ═══════════════════════════════════════════════════════════
// MARK LESSON AS ACCESSED (opened but not completed)
// ═══════════════════════════════════════════════════════════
export const markLessonAccessed = async (lessonId, timeSpentSeconds = 0) => {
  // Save to local first
  const existing = loadLocal()[lessonId] || {};
  saveLocal(lessonId, {
    timeSpentSeconds: (existing.timeSpentSeconds || 0) + timeSpentSeconds,
    lastAccessedAt: new Date().toISOString(),
  });

  // Try backend
  try {
    await api.post(`/progress/lesson/${lessonId}/access`, {
      timeSpentSeconds,
    });
  } catch (err) {
    // Silent fail — access tracking is not critical
    console.warn('[progress] Access sync failed:', err.message);
  }
};

// ═══════════════════════════════════════════════════════════
// FETCH ALL USER PROGRESS
// ═══════════════════════════════════════════════════════════
export const getMyProgress = async () => {
  try {
    const res = await api.get('/progress/me');
    return res;
  } catch (err) {
    // Fallback to local storage
    console.warn('[progress] Backend fetch failed, using local:', err.message);
    return { data: getAllLocalProgress() };
  }
};

// ═══════════════════════════════════════════════════════════
// FETCH PROGRESS FOR A COURSE
// ═══════════════════════════════════════════════════════════
export const getCourseProgress = async (courseId) => {
  try {
    const res = await api.get(`/progress/course/${courseId}`);
    return res;
  } catch (err) {
    // Fallback: compute from local
    const local = loadLocal();
    const courseLessons = Object.entries(local).filter(
      ([_, data]) => data.courseId === courseId
    );
    return {
      data: {
        success: true,
        completedCount: courseLessons.filter(([_, d]) => d.completed).length,
        lessonCount: 0,
        percent: 0,
        _source: 'local',
      },
    };
  }
};

// ═══════════════════════════════════════════════════════════
// FETCH PROGRESS FOR A SINGLE LESSON
// ═══════════════════════════════════════════════════════════
export const getLessonProgress = async (lessonId) => {
  try {
    const res = await api.get(`/progress/lesson/${lessonId}`);
    return res;
  } catch (err) {
    const local = loadLocal()[lessonId];
    return {
      data: {
        success: true,
        progress: local || { completed: false },
        _source: 'local',
      },
    };
  }
};