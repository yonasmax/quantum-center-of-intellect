// src/utils/achievements.js
// Achievement definitions + Supabase sync + email notifications
import { unlockAchievement, getMyAchievements } from '../services/achievementsAPI';
import { sendAchievementEmail } from './emailClient';

// All possible achievements in the app
export const ACHIEVEMENTS = {
  FIRST_LESSON: {
    key: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '[Star]',
  },
  FIVE_LESSONS: {
    key: 'five_lessons',
    title: 'Getting Serious',
    description: 'Complete 5 lessons',
    icon: '[Medal]',
  },
  TEN_LESSONS: {
    key: 'ten_lessons',
    title: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    icon: '[Trophy]',
  },
  TWENTY_FIVE_LESSONS: {
    key: 'twenty_five_lessons',
    title: 'Knowledge Seeker',
    description: 'Complete 25 lessons',
    icon: '[Crown]',
  },
  FIRST_SUBJECT: {
    key: 'first_subject',
    title: 'Focus Master',
    description: 'Finish 3 lessons in one subject',
    icon: '[Book]',
  },
  PERFECT_WEEK: {
    key: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete 5 lessons in one week',
    icon: '[Fire]',
  },
};

// Get an achievement by key
export function getAchievement(key) {
  return Object.values(ACHIEVEMENTS).find((a) => a.key === key) || null;
}

// Check which achievements should be unlocked based on progress
export function checkUnlockedAchievements(progressItems) {
  const completed = progressItems.filter((p) => p.completed).length;

  const subjectCounts = {};
  progressItems.forEach((p) => {
    if (!p.completed || !p.lesson?.subject) return;
    subjectCounts[p.lesson.subject] = (subjectCounts[p.lesson.subject] || 0) + 1;
  });

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekCount = progressItems.filter(
    (p) => p.completed && p.completedAt && new Date(p.completedAt).getTime() > weekAgo
  ).length;

  const unlocked = [];
  if (completed >= 1) unlocked.push(ACHIEVEMENTS.FIRST_LESSON);
  if (completed >= 5) unlocked.push(ACHIEVEMENTS.FIVE_LESSONS);
  if (completed >= 10) unlocked.push(ACHIEVEMENTS.TEN_LESSONS);
  if (completed >= 25) unlocked.push(ACHIEVEMENTS.TWENTY_FIVE_LESSONS);
  if (Object.values(subjectCounts).some((c) => c >= 3)) unlocked.push(ACHIEVEMENTS.FIRST_SUBJECT);
  if (weekCount >= 5) unlocked.push(ACHIEVEMENTS.PERFECT_WEEK);

  return unlocked;
}

export const computeUnlockedAchievements = checkUnlockedAchievements;

// Helper: get current user's email + name from Supabase session
async function getCurrentUser() {
  try {
    const { supabase } = await import('../supabaseClient');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return {
      email: session.user.email,
      name: session.user.user_metadata?.fullName || session.user.email,
    };
  } catch {
    return null;
  }
}

// Sync computed achievements to Supabase + send email on NEW unlocks
export async function syncAchievements(progressItems) {
  const computed = checkUnlockedAchievements(progressItems);
  if (computed.length === 0) return [];

  const user = await getCurrentUser();
  const results = [];

  for (const ach of computed) {
    try {
      const res = await unlockAchievement(ach.key, ach.title, ach.description);
      const row = res.data.achievement;
      results.push(row);

      // Only send email if this was a NEW unlock (Supabase upsert returns row with created_at == unlocked_at)
      // Simple heuristic: check if the achievement was just created (within last 5 seconds)
      if (user && row?.unlocked_at) {
        const unlockedAt = new Date(row.unlocked_at).getTime();
        const isNew = Date.now() - unlockedAt < 5000;
        if (isNew) {
          try {
            await sendAchievementEmail(
              user.email,
              user.name,
              ach.title,
              ach.description
            );
            console.log('[achievements] Email sent for:', ach.key);
          } catch (emailErr) {
            console.warn('[achievements] Email failed:', emailErr.message);
          }
        }
      }
    } catch (err) {
      console.warn('[achievements] Sync failed for', ach.key, err.message);
    }
  }
  return results;
}

// Load achievements from Supabase
export async function loadAchievements() {
  try {
    const res = await getMyAchievements();
    return res.data.achievements || [];
  } catch (err) {
    console.error('[achievements] Load failed:', err);
    return [];
  }
}
