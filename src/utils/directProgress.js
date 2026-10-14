// src/utils/directProgress.js
// Direct Supabase save ? reads user from Supabase Auth session
import { supabase } from '../supabaseClient';

async function getStableUserId() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      return session.user.email.toLowerCase().trim();
    }
  } catch (e) {
    console.warn('[directProgress] Session read failed:', e.message);
  }
  return null;
}

export async function saveLessonProgress(lessonId, lessonMeta = {}, timeSpentSeconds = 0) {
  const userId = await getStableUserId();

  if (!userId) {
    console.warn('[directProgress] No authenticated user');
    return { success: false, error: 'Not authenticated' };
  }

  console.log('[directProgress] Saving for:', userId);

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
  const userId = await getStableUserId();
  if (!userId) return [];

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

export { getStableUserId };
