// src/pages/Leaderboard.jsx
// Shows top students (mock data + your real local progress)
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

// Mock top students (until backend provides real data)
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
  const { user } = useAuth();
  const { stats } = useProgress();

  // Combine mock leaders with current user
  const leaders = useMemo(() => {
    const you = {
      name: `${user?.fullName || 'You'} (You)`,
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
        <div className="bg-gradient-to-r from-[#ED8936] to-orange-400 p-6 rounded-xl shadow-lg mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                Your Rank
              </p>
              <p className="text-4xl font-bold">#{yourRank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">{stats.totalCompleted} lessons completed</p>
              <p className="font-bold text-lg">{stats.totalCompleted * 20} points</p>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((idx) => {
            const leader = leaders[idx];
            if (!leader) return null;
            const heights = ['pt-8', 'pt-0', 'pt-12'];
            const medals = ['🥈', '🥇', '🥉'];
            const position = idx + 1;
            return (
              <div
                key={idx}
                className={`bg-white rounded-xl p-4 shadow-md border-2 text-center ${heights[idx === 0 ? 1 : idx === 1 ? 0 : 2]} ${
                  position === 1 ? 'border-yellow-400' : position === 2 ? 'border-gray-300' : 'border-orange-300'
                }`}
              >
                <div className="text-4xl mb-1">{medals[position - 1]}</div>
                <p className="font-bold text-[#1A365D] text-sm truncate">{leader.name}</p>
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
              <div className="col-span-1 text-[#1A365D]">{i + 1}</div>
              <div className="col-span-7 text-gray-800 truncate">{leader.name}</div>
              <div className="col-span-2 text-right text-[#1A365D] font-bold">{leader.lessons}</div>
              <div className="col-span-2 text-right text-[#ED8936] font-bold">{leader.points}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Leaderboard updates as you complete lessons. Live rankings coming soon.
        </p>

        <div className="text-center mt-6">
          <Link to="/progress" className="text-[#1A365D] hover:underline font-bold text-sm">
            ← Back to My Progress
          </Link>
        </div>
      </div>
    </div>
  );
}
