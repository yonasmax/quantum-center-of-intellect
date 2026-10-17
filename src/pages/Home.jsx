// src/pages/Home.jsx
// Dashboard-style homepage
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useAchievements } from '../context/AchievementsContext';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { progressMap, stats } = useProgress();
  const { unlocked } = useAchievements();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // ═════════════════════════════════════════════════════════
  // GUEST VIEW (Not logged in)
  // ═════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A365D] via-[#2C4A7C] to-[#1A365D] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-3xl text-center">
          <div className="text-7xl mb-6">⚛️</div>
          <h1 className="text-5xl font-bold mb-4">Quantum Center of Intellect</h1>
          <p className="text-xl opacity-90 mb-2">Free Education for Every Ethiopian Student</p>
          <p className="text-sm opacity-70 mb-10">
            Chemistry · Biology · Physics · Math · Geez · History and more
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Link
              to="/register"
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition-transform"
            >
              🚀 Create Free Account
            </Link>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg border-2 border-white/30"
            >
              Sign In
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-12">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-3xl font-bold">11</p>
              <p className="text-xs opacity-80">Subjects</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-3xl font-bold">8</p>
              <p className="text-xs opacity-80">Grade Levels</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-xs opacity-80">Free</p>
            </div>
          </div>

          <p className="text-xs opacity-60 mt-12">
            © 2026 Quantum Center of Intellect · Made with ❤️ for Ethiopian Students 🇪🇹
          </p>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════
  // LOGGED IN VIEW (Dashboard)
  // ═════════════════════════════════════════════════════════
  const firstName = user?.fullName?.split(' ')[0] || 'Student';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  // Find last accessed lesson
  const lastAccessed = Object.values(progressMap)
    .filter((p) => p.lastAccessedAt)
    .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))[0];

  const completedLessons = Object.values(progressMap).filter((p) => p.completed);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">⚛️ Quantum Center of Intellect</h1>
            <p className="text-sm opacity-80">
              {getGreeting()}, {firstName}! 👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isTeacher && (
              <Link
                to="/teacher"
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold"
              >
                👨‍🏫 Teacher
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold"
            >
              Sign Out
            </button>
            <div className="w-10 h-10 bg-[#ED8936] rounded-full flex items-center justify-center font-bold">
              {firstName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Lessons Completed</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{stats.totalCompleted}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Time Learned</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{stats.totalTimeHours}h</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Achievements</p>
            <p className="text-3xl font-bold text-[#ED8936] mt-1">{unlocked.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Current Streak</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">1 🔥</p>
          </div>
        </div>

        {/* Continue Learning */}
        {lastAccessed && lastAccessed.lesson && (
          <div className="bg-gradient-to-r from-[#1A365D] to-[#2C4A7C] p-6 rounded-xl shadow-lg text-white">
            <p className="text-xs font-bold text-[#ED8936] uppercase tracking-wider mb-2">
              📖 Continue Learning
            </p>
            <h2 className="font-bold text-xl mb-1">
              {lastAccessed.lesson.mainTopic || lastAccessed.lesson.title}
            </h2>
            <p className="text-sm opacity-80 mb-4">
              {lastAccessed.lesson.subject} · Grade {lastAccessed.lesson.grade}
              {lastAccessed.completed && ' · ✅ Completed'}
            </p>
            <Link
              to={`/lesson/${lastAccessed.lesson._id}`}
              className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm"
            >
              {lastAccessed.completed ? 'Review Again →' : 'Resume Lesson →'}
            </Link>
          </div>
        )}

        {/* Big feature cards */}
        <div>
          <h2 className="font-bold text-[#1A365D] text-lg mb-3">🎯 Explore</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/catalog"
              className="bg-gradient-to-br from-[#ED8936] to-orange-400 p-5 rounded-xl shadow-md text-white hover:scale-105 transition-transform"
            >
              <p className="text-3xl mb-2">📚</p>
              <p className="font-bold">Browse</p>
              <p className="text-xs opacity-80 mt-1">All subjects</p>
            </Link>
            <Link
              to="/progress"
              className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-xl shadow-md text-white hover:scale-105 transition-transform"
            >
              <p className="text-3xl mb-2">📊</p>
              <p className="font-bold">My Progress</p>
              <p className="text-xs opacity-80 mt-1">Track journey</p>
            </Link>
            <Link
              to="/certificates"
              className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl shadow-md text-white hover:scale-105 transition-transform"
            >
              <p className="text-3xl mb-2">🎓</p>
              <p className="font-bold">Certificates</p>
              <p className="text-xs opacity-80 mt-1">Your awards</p>
            </Link>
            <Link
              to="/leaderboard"
              className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-5 rounded-xl shadow-md text-white hover:scale-105 transition-transform"
            >
              <p className="text-3xl mb-2">🏆</p>
              <p className="font-bold">Leaderboard</p>
              <p className="text-xs opacity-80 mt-1">Top students</p>
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        {completedLessons.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-[#1A365D]">📚 Recently Completed</h2>
              <Link to="/progress" className="text-sm text-[#ED8936] hover:underline font-bold">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {completedLessons.slice(-3).reverse().map((p, i) => (
                <Link
                  key={i}
                  to={`/lesson/${p.lesson?._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1A365D] truncate">
                      {p.lesson?.mainTopic || p.lesson?.title || 'Lesson'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.lesson?.subject || ''} · Grade {p.lesson?.grade || ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick action: browse catalog if none completed */}
        {completedLessons.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="font-bold text-[#1A365D] text-xl mb-2">
              Start Your Learning Journey
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't completed any lessons yet. Explore the catalog and start learning!
            </p>
            <Link
              to="/catalog"
              className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-bold"
            >
              Browse Catalog →
            </Link>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pt-6">
          © 2026 Quantum Center of Intellect · Free for Ethiopian Students 🇪🇹
        </p>
      </div>
    </div>
  );
}
