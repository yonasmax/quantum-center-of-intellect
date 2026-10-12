// src/pages/Leaderboard.jsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

const MOCK_LEADERS = [
  { name: 'Abebe K.', lessons: 47, points: 940 },
  { name: 'Sara T.', lessons: 42, points: 880 },
  { name: 'Mikael W.', lessons: 38, points: 810 },
  { name: 'Hanna B.', lessons: 35, points: 750 },
  { name: 'Yonas M.', lessons: 31, points: 680 },
  { name: 'Lily A.', lessons: 28, points: 620 },
  { name: 'Dawit G.', lessons: 24, points: 540 },
  { name: 'Marta H.', lessons: 21, points: 480 },
  { name: 'Biniam D.', lessons: 18, points: 420 },
];

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();
  const { stats } = useProgress();

  const leaders = useMemo(() => {
    const you = {
      name: `${user?.fullName?.split(' ')[0] || 'You'} (You)`,
      lessons: stats.totalCompleted,
      points: stats.totalCompleted * 20,
      isYou: true,
    };
    const all = [...MOCK_LEADERS.map((l) => ({ ...l, isYou: false })), you];
    return all.sort((a, b) => b.lessons - a.lessons);
  }, [user, stats]);

  const yourRank = leaders.findIndex((l) => l.isYou) + 1;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
          <p className="text-sm opacity-80 mt-1">Top learners this month</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Your Rank Card */}
        {isAuthenticated && (
          <div className="bg-gradient-to-r from-[#ED8936] to-orange-400 p-6 rounded-xl shadow-lg mb-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                  Your Rank
                </p>
                <p className="text-4xl font-bold">#{yourRank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">
                  {stats.totalCompleted} lesson{stats.totalCompleted !== 1 ? 's' : ''} completed
                </p>
                <p className="font-bold text-lg">{stats.totalCompleted * 20} points</p>
              </div>
            </div>
            {stats.totalCompleted === 0 && (
              <p className="text-xs mt-3 opacity-90 bg-white/20 p-2 rounded">
                💡 Complete a lesson to climb the leaderboard!
              </p>
            )}
          </div>
        )}

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 items-end">
          {[1, 0, 2].map((idx) => {
            const leader = leaders[idx];
            if (!leader) return null;
            const heights = ['pt-8', 'pt-2', 'pt-12'];
            const medals = ['🥈', '🥇', '🥉'];
            const borders = ['border-gray-300', 'border-yellow-400', 'border-orange-300'];
            const bgColors = ['bg-gray-50', 'bg-yellow-50', 'bg-orange-50'];
            const position = idx + 1;
            return (
              <div
                key={idx}
                className={`${bgColors[position - 1]} rounded-xl p-4 shadow-md border-2 ${borders[position - 1]} text-center ${heights[position - 1]}`}
              >
                <div className="text-4xl mb-1">{medals[position - 1]}</div>
                <p className={`font-bold text-sm truncate ${
                  leader.isYou ? 'text-[#ED8936]' : 'text-[#1A365D]'
                }`}>
                  {leader.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{leader.lessons} lessons</p>
                <p className="text-xs font-bold text-[#ED8936] mt-1">{leader.points} pts</p>
              </div>
            );
          })}
        </div>

        {/* Full List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 grid grid-cols-12 text-xs font-bold text-gray-500 uppercase">
            <div className="col-span-1">#</div>
            <div className="col-span-7">Student</div>
            <div className="col-span-2 text-right">Lessons</div>
            <div className="col-span-2 text-right">Points</div>
          </div>
          {leaders.map((leader, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 px-5 py-3 items-center border-b border-gray-50 last:border-b-0 ${
                leader.isYou ? 'bg-orange-50 font-bold' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`col-span-1 ${leader.isYou ? 'text-[#ED8936]' : 'text-[#1A365D]'}`}>
                {i + 1}
              </div>
              <div className="col-span-7 text-gray-800 truncate">
                {leader.name}
                {leader.isYou && (
                  <span className="ml-2 text-xs bg-[#ED8936] text-white px-2 py-0.5 rounded">
                    YOU
                  </span>
                )}
              </div>
              <div className="col-span-2 text-right text-[#1A365D] font-bold">{leader.lessons}</div>
              <div className="col-span-2 text-right text-[#ED8936] font-bold">{leader.points}</div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <p className="text-xs text-blue-800">
            ℹ️ <strong>Note:</strong> The list above shows demo data. Real rankings from all students will appear once the backend sync is complete.
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/progress" className="text-[#1A365D] hover:underline font-bold text-sm">
            ← Back to My Progress
          </Link>
        </div>
      </div>
    </div>
  );
}
