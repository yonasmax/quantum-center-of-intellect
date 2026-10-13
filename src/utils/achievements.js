// src/utils/achievements.js
// Achievement definitions + Supabase sync
import { unlockAchievement, getMyAchievements } from '../services/achievementsAPI';

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

// Check which achievements should be unlocked based on progress
export function computeUnlockedAchievements(progressItems) {
  const completed = progressItems.filter((p) => p.completed).length;

  // Count per subject
  const subjectCounts = {};
  progressItems.forEach((p) => {
    if (!p.completed || !p.lesson?.subject) return;
    subjectCounts[p.lesson.subject] = (subjectCounts[p.lesson.subject] || 0) + 1;
  });

  // Week count (last 7 days)
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

// Sync computed achievements to Supabase
export async function syncAchievements(progressItems) {
  const computed = computeUnlockedAchievements(progressItems);
  const results = [];
  for (const ach of computed) {
    try {
      const res = await unlockAchievement(ach.key, ach.title, ach.description);
      results.push(res.data.achievement);
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
