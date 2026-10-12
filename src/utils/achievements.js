// src/utils/achievements.js
// Achievement definitions and unlock logic

export const ACHIEVEMENTS = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🌱',
    color: 'green',
    condition: (stats) => stats.totalCompleted >= 1,
  },
  {
    id: 'getting_serious',
    title: 'Getting Serious',
    description: 'Complete 5 lessons',
    icon: '📚',
    color: 'blue',
    condition: (stats) => stats.totalCompleted >= 5,
  },
  {
    id: 'dedicated',
    title: 'Dedicated Learner',
    description: 'Complete 25 lessons',
    icon: '💎',
    color: 'purple',
    condition: (stats) => stats.totalCompleted >= 25,
  },
  {
    id: 'legend',
    title: 'Legend',
    description: 'Complete 50 lessons',
    icon: '🏅',
    color: 'orange',
    condition: (stats) => stats.totalCompleted >= 50,
  },
  {
    id: 'time_traveler',
    title: 'Time Traveler',
    description: 'Spend 1 hour learning',
    icon: '⏰',
    color: 'blue',
    condition: (stats) => stats.totalTimeHours >= 1,
  },
  {
    id: 'marathon',
    title: 'Marathoner',
    description: 'Spend 10 hours learning',
    icon: '🏃',
    color: 'purple',
    condition: (stats) => stats.totalTimeHours >= 10,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Study 3 different subjects',
    icon: '🧭',
    color: 'green',
    condition: (stats) => (stats.subjectsStarted || 0) >= 3,
  },
  {
    id: 'polymath',
    title: 'Polymath',
    description: 'Study 5 different subjects',
    icon: '🎓',
    color: 'orange',
    condition: (stats) => (stats.subjectsStarted || 0) >= 5,
  },
  {
    id: 'on_fire',
    title: 'On Fire',
    description: 'Learn 3 days in a row',
    icon: '🔥',
    color: 'orange',
    condition: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Learn 7 days in a row',
    icon: '⚡',
    color: 'purple',
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Learn 30 days in a row',
    icon: '👑',
    color: 'orange',
    condition: (stats) => stats.currentStreak >= 30,
  },
];

export function checkUnlockedAchievements(stats) {
  return ACHIEVEMENTS.filter((a) => {
    try {
      return a.condition(stats);
    } catch {
      return false;
    }
  }).map((a) => a.id);
}

export function getAchievement(id) {
  return ACHIEVEMENTS.find((a) => a.id === id) || null;
}
