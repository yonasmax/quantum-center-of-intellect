// src/utils/directProgress.js
// Direct Supabase save - bypasses ProgressContext
import { supabase } from '../supabaseClient';

export function getStableUserId() {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const id = parsed.email || parsed._id || parsed.id;
      if (id) {
        return String(id).toLowerCase().trim().replace(/\s+/g, '_');
      }
    }
  } catch (e) {
    console.warn('[directProgress] Parse error:', e.message);
  }
  const token = localStorage.getItem('token');
  if (token) return String(token).toLowerCase().trim();
  return 'anonymous';
}

export async function saveLessonProgress(lessonId, lessonMeta = {}, timeSpentSeconds = 0) {
  const userId = getStableUserId();

  if (!userId || userId === 'anonymous') {
    console.warn('[directProgress] No user - skipping save');
    return { success: false, error: 'Not authenticated' };
  }

  console.log('[directProgress] Saving for user:', userId);
  console.log('[directProgress] Lesson:', lessonId);
  console.log('[directProgress] Meta:', lessonMeta);

  const { data, error } = await supabase
    .from('progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        lesson_title: lessonMeta.title || 'Lesson',
        lesson_subject: lessonMeta.subject || 'General',
        completed: true,
        completed_at: new Date().toISOString(),
        time_spent_seconds: timeSpentSeconds,
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('[directProgress] Save error:', error);
    return { success: false, error: error.message };
  }

  console.log('[directProgress] SAVED:', data);
  return { success: true, data };
}

export async function loadUserProgress() {
  const userId = getStableUserId();
  if (!userId || userId === 'anonymous') return [];

  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('[directProgress] Load error:', error);
    return [];
  }

  return data || [];
}
