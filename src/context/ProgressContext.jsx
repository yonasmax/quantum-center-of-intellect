// src/context/ProgressContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  markLessonComplete as apiMarkComplete,
  markLessonAccessed as apiMarkAccessed,
  getMyProgress,
} from '../services/progressAPI';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export function ProgressProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [progressMap, setProgressMap] = useState({});
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalTimeSeconds: 0,
    totalTimeHours: 0,
  });
  const [loading, setLoading] = useState(true);

  // ??? Load progress when user logs in ???
  useEffect(() => {
    if (!isAuthenticated) {
      setProgressMap({});
      setStats({ totalCompleted: 0, totalTimeSeconds: 0, totalTimeHours: 0 });
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await getMyProgress();
        if (cancelled) return;

        const items = res?.data?.progress || [];
        const map = {};
        items.forEach((p) => {
          if (p.lesson?._id) {
            map[p.lesson._id] = {
              lesson: p.lesson,
              completed: p.completed,
              timeSpentSeconds: p.timeSpentSeconds || 0,
              completedAt: p.completedAt,
            };
          }
        });
        setProgressMap(map);

        const totalCompleted = items.filter((p) => p.completed).length;
        const totalTime = items.reduce((s, p) => s + (p.timeSpentSeconds || 0), 0);
        setStats({
          totalCompleted,
          totalTimeSeconds: totalTime,
          totalTimeHours: Math.round((totalTime / 3600) * 10) / 10,
        });
      } catch (err) {
        console.error('[progress] Load failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // ??? Mark a lesson as complete ???
  const markComplete = async (lessonId, timeSpentSeconds = 0, courseId = null, lessonMeta = {}) => {
    try {
      const res = await apiMarkComplete(lessonId, timeSpentSeconds, courseId, lessonMeta);
      const progress = res?.data?.progress;

      setProgressMap((prev) => ({
        ...prev,
        [lessonId]: {
          lesson: {
            _id: lessonId,
            title: lessonMeta.title || prev[lessonId]?.lesson?.title,
            subject: lessonMeta.subject || prev[lessonId]?.lesson?.subject,
          },
          completed: true,
          timeSpentSeconds,
          completedAt: new Date().toISOString(),
        },
      }));

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

      return { success: true, progress };
    } catch (err) {
      console.error('[progress] Mark complete failed:', err);
      return { success: false, error: err.message };
    }
  };

  // ??? Mark a lesson as accessed (currently disabled) ???
  const markAccessed = async (lessonId, timeSpentSeconds = 0) => {
    try {
      await apiMarkAccessed(lessonId, timeSpentSeconds);
    } catch (err) {
      console.warn('[progress] Mark accessed failed:', err.message);
    }
  };

  // ??? Helpers ???
  const isLessonCompleted = (lessonId) => !!progressMap[lessonId]?.completed;

  const getLessonTime = (lessonId) => progressMap[lessonId]?.timeSpentSeconds || 0;

  const value = {
    progressMap,
    stats,
    loading,
    markComplete,
    markAccessed,
    isLessonCompleted,
    getLessonTime,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
