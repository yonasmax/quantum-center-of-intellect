// src/context/AchievementsContext.jsx
// Tracks unlocked achievements + shows notifications when new ones unlock
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { ACHIEVEMENTS, checkUnlockedAchievements, getAchievement } from '../utils/achievements';

const AchievementsContext = createContext();

export const useAchievements = () => useContext(AchievementsContext);

const UNLOCKED_KEY = 'qci_achievements_v1';

function loadUnlocked() {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKED_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUnlocked(ids) {
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(ids));
}

export const AchievementsProvider = ({ children }) => {
  const [unlocked, setUnlocked] = useState(loadUnlocked);
  const [recentUnlock, setRecentUnlock] = useState(null);
  const prevUnlockedRef = useRef(unlocked);

  // Called from anywhere to update stats and check for new unlocks
  const checkAndUnlock = (stats) => {
    const shouldUnlock = checkUnlockedAchievements(stats);
    const newUnlocks = shouldUnlock.filter((id) => !unlocked.includes(id));

    if (newUnlocks.length > 0) {
      const updated = [...unlocked, ...newUnlocks];
      setUnlocked(updated);
      saveUnlocked(updated);

      // Show notification for the first new achievement
      const first = getAchievement(newUnlocks[0]);
      if (first) {
        setRecentUnlock(first);
        setTimeout(() => setRecentUnlock(null), 5000);
      }
    }
  };

  const clearAll = () => {
    setUnlocked([]);
    saveUnlocked([]);
  };

  const isUnlocked = (id) => unlocked.includes(id);

  const value = {
    unlocked,
    recentUnlock,
    checkAndUnlock,
    clearAll,
    isUnlocked,
    allAchievements: ACHIEVEMENTS,
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      {recentUnlock && <AchievementToast achievement={recentUnlock} />}
    </AchievementsContext.Provider>
  );
};

// Toast shown when an achievement unlocks
function AchievementToast({ achievement }) {
  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in">
      <div className="bg-gradient-to-r from-[#1A365D] to-[#2C4A7C] text-white rounded-xl shadow-2xl p-5 flex items-center gap-4 max-w-sm border-2 border-[#ED8936]">
        <div className="text-4xl">{achievement.icon}</div>
        <div>
          <p className="text-xs font-bold text-[#ED8936] uppercase tracking-wider">
            🎉 Achievement Unlocked
          </p>
          <p className="font-bold text-lg leading-tight">{achievement.title}</p>
          <p className="text-xs opacity-80 mt-1">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}
