// src/pages/Progress.jsx
import React, { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

export default function Progress() {
  const { user, isAuthenticated } = useAuth();
  const { progressMap, stats, loading, loadProgress } = useProgress();

  // ═════════════════════════════════════════════════════════
  // GROUP PROGRESS BY SUBJECT
  // ═════════════════════════════════════════════════════════
  const bySubject = useMemo(() => {
    const groups = {};
    Object.values(progressMap).forEach((p) => {
      const lesson = p.lesson;
      if (!lesson) return;
      const subject = lesson.subject || 'Other';
      if (!groups[subject]) {
        groups[subject] = { completed: 0, total: 0, lessons: [] };
      }
      groups[subject].total += 1;
      if (p.completed) groups[subject].completed += 1;
      groups[subject].lessons.push(p);
    });
    return groups;
  }, [progressMap]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">📊 My Progress</h1>
          <p className="text-sm opacity-80 mt-1">
            Welcome back, {user?.fullName || 'Student'}!
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Lessons Completed</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">
              {stats.totalCompleted}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Total Time Learning</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">
              {stats.totalTimeHours}h
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Subjects Started</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">
              {Object.keys(bySubject).length}
            </p>
          </div>
        </div>

        {/* By Subject */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#1A365D] text-lg">📚 Your Subjects</h2>
            <button
              onClick={loadProgress}
              className="text-sm text-[#ED8936] hover:underline font-bold"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : Object.keys(bySubject).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                You haven't started any lessons yet.
              </p>
              <Link
                to="/catalog"
                className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
              >
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
                        {data.completed} / {data.total} lessons • {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#ED8936] h-2.5 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-[#1A365D] hover:underline font-bold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}