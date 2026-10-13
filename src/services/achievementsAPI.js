// src/services/achievementsAPI.js
// Achievements - Supabase storage
import { supabase } from '../supabaseClient';

function getUserId() {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const id = parsed.email || parsed._id || parsed.id;
      if (id) return String(id).toLowerCase().trim().replace(/\s+/g, '_');
    }
  } catch {}
  const token = localStorage.getItem('token');
  if (token) return String(token).toLowerCase().trim();
  return 'anonymous';
}

// Get all achievements for current user
export const getMyAchievements = async () => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    return { data: { success: true, achievements: [] } };
  }

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('[achievements] Load error:', error);
    throw error;
  }

  return { data: { success: true, achievements: data || [] } };
};

// Unlock an achievement
export const unlockAchievement = async (achievementKey, title, description) => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('achievements')
    .upsert(
      {
        user_id: userId,
        achievement_key: achievementKey,
        title,
        description,
        unlocked_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,achievement_key' }
    )
    .select()
    .single();

  if (error) {
    console.error('[achievements] Unlock error:', error);
    throw error;
  }

  return { data: { success: true, achievement: data } };
};

// Check if an achievement is unlocked
export const hasAchievement = async (achievementKey) => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') return false;

  const { data } = await supabase
    .from('achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_key', achievementKey)
    .maybeSingle();

  return !!data;
};
