// src/context/ProgressContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
  getMyProgress,
  markLessonComplete as apiMarkComplete,
  markLessonAccessed as apiMarkAccessed,
} from '../services/progressAPI';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [progressMap, setProgressMap] = useState({}); // { lessonId: progressObject }
  // Compute stats from progressMap to guarantee accuracy
const items = res.data?.progress || [];
const totalCompleted = items.filter((p) => p.completed).length;
const totalTime = items.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0);

setStats({
  totalCompleted,
  totalTimeSeconds: totalTime,
  totalTimeHours: Math.round((totalTime / 3600) * 10) / 10,
});
  const [loading, setLoading] = useState(false);

  // ═════════════════════════════════════════════════════════
  // LOAD PROGRESS FROM BACKEND
  // ═════════════════════════════════════════════════════════
  const loadProgress = useCallback(async () => {
    if (!isAuthenticated) {
      setProgressMap({});
      setStats({ totalCompleted: 0, totalTimeSeconds: 0, totalTimeHours: 0 });
      return;
    }

    setLoading(true);
    try {
      const res = await getMyProgress();
      const items = res.data?.progress || [];

      // Build a map by lessonId for O(1) lookups
      const map = {};
      items.forEach((p) => {
        const lessonId = p.lesson?._id || p.lesson;
        if (lessonId) map[lessonId] = p;
      });

      setProgressMap(map);
      setStats(res.data?.stats || {
        totalCompleted: 0,
        totalTimeSeconds: 0,
        totalTimeHours: 0,
      });
    } catch (err) {
      // Silent fail — user may not be authenticated or backend may be down
      if (err.response?.status !== 401) {
        console.warn('[progress] Load failed:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // ═════════════════════════════════════════════════════════
  // MARK A LESSON COMPLETE
  // ═════════════════════════════════════════════════════════
  const markComplete = async (lessonId, timeSpentSeconds = 0, courseId = null) => {
    try {
      const res = await apiMarkComplete(lessonId, timeSpentSeconds, courseId);
      const progress = res.data?.progress;

      setProgressMap((prev) => ({
        ...prev,
        [lessonId]: progress,
      }));

      // Update stats
setStats((prev) => {
  const wasCompleted = progressMap[lessonId]?.completed;
  const newTotal = wasCompleted ? prev.totalCompleted : prev.totalCompleted + 1;
  const newTime = prev.totalTimeSeconds + timeSpentSeconds;
  return {
    totalCompleted: newTotal,
    totalTimeSeconds: newTime,
    totalTimeHours: Math.round((newTime / 3600) * 10) / 10,
  };
});

  // ═════════════════════════════════════════════════════════
  // MARK A LESSON ACCESSED (not complete, just opened)
  // ═════════════════════════════════════════════════════════
  const markAccessed = async (lessonId, timeSpentSeconds = 0) => {
    if (!isAuthenticated) return;
    try {
      await apiMarkAccessed(lessonId, timeSpentSeconds);
    } catch (err) {
      // Silent fail — not critical
      console.warn('[progress] Mark accessed failed:', err.message);
    }
  };

  // ═════════════════════════════════════════════════════════
  // HELPERS
  // ═════════════════════════════════════════════════════════
  const isLessonCompleted = (lessonId) => !!progressMap[lessonId]?.completed;

  const getLessonTime = (lessonId) => progressMap[lessonId]?.timeSpentSeconds || 0;

  const value = {
    progressMap,
    stats,
    loading,
    loadProgress,
    markComplete,
    markAccessed,
    isLessonCompleted,
    getLessonTime,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};