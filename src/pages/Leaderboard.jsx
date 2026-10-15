import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const SUBJECTS = ['All', 'Chemistry', 'Physics', 'Biology', 'Math', 'English', 'History', 'Geography'];
const GRADES = ['All', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const TIMEFRAMES = [
  { key: 'all', label: 'All Time' },
  { key: 'month', label: 'This Month' },
  { key: 'week', label: 'This Week' },
  { key: 'today', label: 'Today' },
];

function getCutoff(timeframe) {
  if (timeframe === 'all') return null;
  const now = new Date();
  if (timeframe === 'today') {
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }
  if (timeframe === 'week') {
    return now.getTime() - 7 * 24 * 60 * 60 * 1000;
  }
  if (timeframe === 'month') {
    return now.getTime() - 30 * 24 * 60 * 60 * 1000;
  }
  return null;
}

function rankIcon(i) {
  if (i === 0) return '??';
  if (i === 1) return '??';
  if (i === 2) return '??';
  return `#${i + 1}`;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const [allProgress, setAllProgress] = useState([]);
  const [profilesMap, setProfilesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [timeframe, setTimeframe] = useState('all');
  const [subject, setSubject] = useState('All');
  const [grade, setGrade] = useState('All');

  // Load all progress rows + all profiles once
  useEffect(() => {
    (async () => {
      try {
        const [progressRes, profilesRes] = await Promise.all([
          supabase
            .from('progress')
            .select('user_id, lesson_id, lesson_title, lesson_subject, completed, completed_at, time_spent_seconds'),
          supabase.from('profiles').select('email, full_name, role'),
        ]);

        if (progressRes.error) throw progressRes.error;
        if (profilesRes.error) throw profilesRes.error;

        setAllProgress(progressRes.data || []);

        const map = {};
        (profilesRes.data || []).forEach((p) => {
          map[p.email] = p;
        });
        setProfilesMap(map);
      } catch (err) {
        console.error('[leaderboard] Load error:', err);
      }
      setLoading(false);
    })();
  }, []);

  // Compute filtered rankings
  const leaders = useMemo(() => {
    const cutoff = getCutoff(timeframe);

    // Group by user
    const grouped = {};
    for (const row of allProgress) {
      if (!row.completed) continue;
      if (cutoff && row.completed_at && new Date(row.completed_at).getTime() < cutoff) continue;
      if (subject !== 'All' && row.lesson_subject !== subject) continue;

      // grade filter: only include if the user's profile grade matches, OR user has no grade filter set
      const userProfile = profilesMap[row.user_id];
      if (grade !== 'All' && userProfile?.grade && userProfile.grade !== grade) continue;

      if (!grouped[row.user_id]) {
        grouped[row.user_id] = {
          userId: row.user_id,
          completed: 0,
          time: 0,
          subjects: new Set(),
        };
      }
      grouped[row.user_id].completed += 1;
      grouped[row.user_id].time += row.time_spent_seconds || 0;
      if (row.lesson_subject) grouped[row.user_id].subjects.add(row.lesson_subject);
    }

    // Convert to array, sort, slice top 50
    const ranked = Object.values(grouped)
      .map((entry) => {
        const profile = profilesMap[entry.userId];
        return {
          ...entry,
          fullName: profile?.full_name || entry.userId,
          email: entry.userId,
          subjects: [...entry.subjects],
        };
      })
      .sort((a, b) => {
        if (b.completed !== a.completed) return b.completed - a.completed;
        return b.time - a.time;
      })
      .slice(0, 50);

    return ranked;
  }, [allProgress, profilesMap, timeframe, subject, grade]);

  const myEmail = user?.email?.toLowerCase().trim();

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1A365D]">?? Leaderboard</h1>
          <p className="text-gray-600 mt-1">Top learners this season</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                {TIMEFRAMES.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g === 'All' ? 'All Grades' : g}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Showing {leaders.length} {leaders.length === 1 ? 'learner' : 'learners'}
          </p>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-500">
            Loading rankings...
          </div>
        ) : leaders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center">
            <p className="text-gray-600 mb-2">No progress matches these filters yet.</p>
            <p className="text-xs text-gray-400">Try a different timeframe or subject.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {leaders.map((entry, i) => {
              const isMe = entry.email === myEmail;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 ${
                    isMe ? 'bg-orange-50 ring-1 ring-orange-200 ring-inset' : ''
                  }`}
                >
                  <div className="w-12 text-center text-2xl flex-shrink-0">
                    {rankIcon(i)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1A365D] truncate">
                      {entry.fullName}
                      {isMe && <span className="text-xs text-[#ED8936] ml-2">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {entry.subjects.length > 0 ? entry.subjects.slice(0, 3).join(' ? ') : '?'}
                      {entry.subjects.length > 3 ? ` +${entry.subjects.length - 3}` : ''}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#ED8936] text-lg">{entry.completed}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(entry.time / 60)} min
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-[#1A365D]">
            ? Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
