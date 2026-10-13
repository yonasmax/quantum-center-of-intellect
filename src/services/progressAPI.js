// src/services/progressAPI.js
// Progress tracking — talks to Supabase directly
import { supabase } from '../supabaseClient';

// ═══════════════════════════════════════════════════════════
// STABLE USER ID — uses email so it's the same across devices
// ═══════════════════════════════════════════════════════════
function getUserId() {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const id = parsed.email || parsed._id || parsed.id;
      if (id) {
        const normalized = String(id).toLowerCase().trim().replace(/\s+/g, '_');
        console.log('[progress] Using userId:', normalized);
        return normalized;
      }
    }
  } catch (e) {
    console.warn('[progress] Failed to parse user:', e.message);
  }

  const token = localStorage.getItem('token');
  if (token) {
    const normalized = String(token).toLowerCase().trim();
    console.log('[progress] Using token as userId:', normalized.substring(0, 20) + '...');
    return normalized;
  }

  console.warn('[progress] No user found — progress not saved');
  return 'anonymous';
}

// ═══════════════════════════════════════════════════════════
// MARK LESSON COMPLETE
// ═══════════════════════════════════════════════════════════
export const markLessonComplete = async (lessonId, timeSpentSeconds = 0, courseId = null, lessonMeta = {}) => {
  const userId = getUserId();
  console.log('[progress] Saving lesson:', lessonId, 'for user:', userId);

  if (!userId || userId === 'anonymous') {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        lesson_title: lessonMeta.title || null,
        lesson_subject: lessonMeta.subject || null,
        completed: true,
        completed_at: new Date().toISOString(),
        time_spent_seconds: timeSpentSeconds,
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('[progress] Save error:', error);
    throw error;
  }
  console.log('[progress] ✅ Saved:', data);
  return { data: { success: true, progress: data } };
};

// ═══════════════════════════════════════════════════════════
// MARK LESSON ACCESSED — DISABLED
// We only save progress on explicit "Mark as Complete"
// ═══════════════════════════════════════════════════════════
export const markLessonAccessed = async (lessonId, timeSpentSeconds = 0) => {
  return;
};

// ═══════════════════════════════════════════════════════════
// GET ALL USER PROGRESS
// ═══════════════════════════════════════════════════════════
export const getMyProgress = async () => {
  const userId = getUserId();
  console.log('[progress] Loading for user:', userId);

  if (!userId || userId === 'anonymous') {
    return {
      data: {
        success: true,
        count: 0,
        stats: { totalCompleted: 0, totalTimeSeconds: 0, totalTimeHours: 0 },
        progress: [],
      },
    };
  }

  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false });

  if (error) {
    console.error('[progress] Load error:', error);
    throw error;
  }

  console.log('[progress] Loaded', data?.length || 0, 'records');

  const formatted = (data || []).map((p) => ({
    lesson: {
      _id: p.lesson_id,
      title: p.lesson_title,
      subject: p.lesson_subject,
    },
    completed: p.completed,
    completedAt: p.completed_at,
    lastAccessedAt: p.last_accessed_at,
    timeSpentSeconds: p.time_spent_seconds,
  }));

  const totalCompleted = formatted.filter((p) => p.completed).length;
  const totalTime = formatted.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0);

  return {
    data: {
      success: true,
      count: formatted.length,
      stats: {
        totalCompleted,
        totalTimeSeconds: totalTime,
        totalTimeHours: Math.round((totalTime / 3600) * 10) / 10,
      },
      progress: formatted,
    },
  };
};

// ═══════════════════════════════════════════════════════════
// GET COURSE PROGRESS
// ═══════════════════════════════════════════════════════════
export const getCourseProgress = async (courseId) => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    return { data: { success: true, completedCount: 0, percent: 0 } };
  }

  const { data } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId);

  const completed = (data || []).filter((p) => p.completed).length;
  return {
    data: {
      success: true,
      completedCount: completed,
      lessonCount: 0,
      percent: 0,
    },
  };
};

// ═══════════════════════════════════════════════════════════
// GET SINGLE LESSON PROGRESS
// ═══════════════════════════════════════════════════════════
export const getLessonProgress = async (lessonId) => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    return { data: { success: true, progress: { completed: false } } };
  }

  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return {
    data: {
      success: true,
      progress: data
        ? {
            completed: data.completed,
            timeSpentSeconds: data.time_spent_seconds,
          }
        : { completed: false },
    },
  };
};
