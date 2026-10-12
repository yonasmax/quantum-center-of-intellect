// src/pages/Progress.jsx
import React, { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useAchievements } from '../context/AchievementsContext';

export default function Progress() {
  const { user, isAuthenticated } = useAuth();
  const { progressMap, stats, loading, loadProgress } = useProgress();
  const { unlocked, allAchievements, checkAndUnlock } = useAchievements();

  React.useEffect(() => {
    if (stats.totalCompleted > 0) {
      const subjectsStarted = new Set(
        Object.values(progressMap).filter(p => p.completed).map(p => p.lesson?.subject).filter(Boolean)
      ).size;
      checkAndUnlock({ ...stats, subjectsStarted, currentStreak: 1 });
    }
  }, [stats.totalCompleted, progressMap, checkAndUnlock]);

  const bySubject = useMemo(() => {
    const groups = {};
    Object.values(progressMap).forEach((p) => {
      const lesson = p.lesson;
      if (!lesson) return;
      const subject = lesson.subject || 'Other';
      if (!groups[subject]) groups[subject] = { completed: 0, total: 0 };
      groups[subject].total += 1;
      if (p.completed) groups[subject].completed += 1;
    });
    return groups;
  }, [progressMap]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Compute real weekly activity based on progress timestamps
  const weeklyActivity = useMemo(() => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date();
    const counts = [0, 0, 0, 0, 0, 0, 0];

    Object.values(progressMap).forEach((p) => {
      if (!p.completedAt && !p.lastAccessedAt) return;
      const date = new Date(p.completedAt || p.lastAccessedAt);
      const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        const dayIndex = (today.getDay() - diffDays + 7) % 7;
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Monday-first
        counts[adjustedIndex] += 1;
      }
    });

    const max = Math.max(...counts, 1);
    return days.map((d, i) => ({
      day: d,
      count: counts[i],
      height: counts[i] > 0 ? Math.round((counts[i] / max) * 100) : 0,
      isToday: i === ((today.getDay() + 6) % 7),
    }));
  }, [progressMap]);

  const totalThisWeek = weeklyActivity.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">📊 My Progress</h1>
            <p className="text-sm opacity-80 mt-1">Welcome back, {user?.fullName || 'Student'}!</p>
          </div>
          <Link to="/certificates" className="text-sm bg-[#ED8936] hover:bg-orange-500 px-4 py-2 rounded-lg font-bold">
            🎓 Certificates
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Completed</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{stats.totalCompleted}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Time Learned</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{stats.totalTimeHours}h</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Subjects</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{Object.keys(bySubject).length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Achievements</p>
            <p className="text-3xl font-bold text-[#ED8936] mt-1">{unlocked.length}</p>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-[#1A365D]">📅 This Week</h2>
            <span className="text-sm text-gray-500">
              {totalThisWeek} lesson{totalThisWeek !== 1 ? 's' : ''} this week
            </span>
          </div>

          {totalThisWeek === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-4xl mb-2">📚</p>
              <p className="text-gray-600 font-medium">No activity yet this week</p>
              <p className="text-xs text-gray-500 mt-1">Complete a lesson to see your progress here</p>
            </div>
          ) : (
            <div className="flex justify-between items-end h-32 gap-3">
              {weeklyActivity.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  {d.count > 0 && (
                    <span className="text-xs font-bold text-[#1A365D]">{d.count}</span>
                  )}
                  <div
                    className={`w-full rounded-t transition-all ${
                      d.isToday ? 'bg-[#ED8936]' : d.count > 0 ? 'bg-[#1A365D]' : 'bg-gray-200'
                    }`}
                    style={{ height: `${Math.max(d.height, 5)}%`, minHeight: '4px' }}
                  />
                  <span className={`text-xs ${d.isToday ? 'font-bold text-[#ED8936]' : 'text-gray-500'}`}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#1A365D]">🏆 Achievements</h2>
            <Link to="/leaderboard" className="text-sm text-[#ED8936] hover:underline font-bold">
              🏅 Leaderboard →
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {allAchievements.map((a) => {
              const isUnlocked = unlocked.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`p-3 rounded-lg text-center border-2 transition-all ${
                    isUnlocked
                      ? 'bg-orange-50 border-[#ED8936]'
                      : 'bg-gray-50 border-gray-200 opacity-40'
                  }`}
                >
                  <div className="text-2xl mb-1">{isUnlocked ? a.icon : '🔒'}</div>
                  <p className="text-xs font-bold text-[#1A365D] leading-tight">{a.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#1A365D]">📚 Your Subjects</h2>
            <button onClick={loadProgress} className="text-sm text-[#ED8936] hover:underline font-bold">
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : Object.keys(bySubject).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't started any lessons yet.</p>
              <Link to="/catalog" className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold">
                Browse Lessons →
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(bySubject).map(([subject, data]) => {
                const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                return (
                  <div key={subject}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">{subject}</span>
                      <span className="text-sm text-gray-500">
                        {data.completed} / {data.total} • {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-[#ED8936] h-2.5 rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-[#1A365D] hover:underline font-bold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
