import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch all progress rows
        const { data, error } = await supabase
          .from('progress')
          .select('user_id, completed, time_spent_seconds');

        if (error) throw error;

        // Group by user and count
        const map = {};
        (data || []).forEach((row) => {
          if (!map[row.user_id]) {
            map[row.user_id] = { userId: row.user_id, completed: 0, time: 0 };
          }
          if (row.completed) map[row.user_id].completed += 1;
          map[row.user_id].time += row.time_spent_seconds || 0;
        });

        // Sort by completed desc
        const ranked = Object.values(map)
          .sort((a, b) => b.completed - a.completed)
          .slice(0, 20);

        setLeaders(ranked);
      } catch (err) {
        console.error('[leaderboard] Load error:', err);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A365D]">Leaderboard</h1>
          <p className="text-gray-600 mt-1">Top learners this season</p>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-500">
            Loading rankings...
          </div>
        ) : leaders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center">
            <p className="text-gray-600">No progress yet. Be the first!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {leaders.map((entry, i) => {
              const isMe = entry.userId === (user?.email || '').toLowerCase().trim().replace(/\s+/g, '_')
                || entry.userId === user?._id;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 ${
                    isMe ? 'bg-orange-50' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      i === 0
                        ? 'bg-yellow-400 text-white'
                        : i === 1
                        ? 'bg-gray-300 text-white'
                        : i === 2
                        ? 'bg-orange-400 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1A365D] truncate">
                      {entry.userId} {isMe && <span className="text-xs text-[#ED8936]">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.completed} lessons - {Math.round(entry.time / 60)} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#ED8936]">{entry.completed}</p>
                    <p className="text-xs text-gray-500">completed</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-[#1A365D]">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
