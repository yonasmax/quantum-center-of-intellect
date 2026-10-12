// src/pages/TeacherStudentDetail.jsx
// Individual student detail view
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

const MOCK_STUDENTS = {
  '1': { id: '1', name: 'Abebe Kebede', email: 'abebe@example.com', grade: '9', subject: 'Chemistry', lessons: 47, avgScore: 92, lastActive: 'Today', status: 'active' },
  '2': { id: '2', name: 'Sara Tesfaye', email: 'sara@example.com', grade: '9', subject: 'Chemistry', lessons: 42, avgScore: 88, lastActive: 'Today', status: 'active' },
  '3': { id: '3', name: 'Mikael Wolde', email: 'mikael@example.com', grade: '9', subject: 'Chemistry', lessons: 38, avgScore: 81, lastActive: 'Yesterday', status: 'active' },
  '7': { id: '7', name: 'Dawit Girma', email: 'dawit@example.com', grade: '9', subject: 'Physics', lessons: 24, avgScore: 55, lastActive: '1 week ago', status: 'struggling' },
  '8': { id: '8', name: 'Marta Haile', email: 'marta@example.com', grade: '10', subject: 'Biology', lessons: 21, avgScore: 48, lastActive: '2 weeks ago', status: 'struggling' },
};

const ACHIEVEMENTS = [
  { id: 'first_steps', title: 'First Steps', icon: '🌱' },
  { id: 'getting_serious', title: 'Getting Serious', icon: '📚' },
  { id: 'on_fire', title: 'On Fire', icon: '🔥' },
  { id: 'explorer', title: 'Explorer', icon: '🧭' },
];

export default function TeacherStudentDetail() {
  const { studentId } = useParams();

  const student = useMemo(() => {
    return MOCK_STUDENTS[studentId] || {
      id: studentId,
      name: 'Student ' + studentId,
      email: 'student@example.com',
      grade: '9',
      subject: 'Chemistry',
      lessons: 20,
      avgScore: 70,
      lastActive: 'Recently',
      status: 'active',
    };
  }, [studentId]);

  // Mock progress history
  const progressHistory = [
    { week: 'Week 1', lessons: 3, score: 65 },
    { week: 'Week 2', lessons: 5, score: 72 },
    { week: 'Week 3', lessons: 6, score: 78 },
    { week: 'Week 4', lessons: 8, score: 85 },
    { week: 'Week 5', lessons: 10, score: student.avgScore },
  ];

  const completedAchievements = student.lessons >= 30 ? ['first_steps', 'getting_serious', 'on_fire', 'explorer'] :
                                 student.lessons >= 10 ? ['first_steps', 'getting_serious', 'on_fire'] :
                                 student.lessons >= 5 ? ['first_steps', 'getting_serious'] :
                                 student.lessons >= 1 ? ['first_steps'] : [];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <Link to="/teacher/students" className="text-xs opacity-80 hover:opacity-100 mb-1 block">
              ← Back to Students
            </Link>
            <h1 className="text-2xl font-bold">👤 {student.name}</h1>
            <p className="text-sm opacity-80">
              Grade {student.grade} · {student.subject}
            </p>
          </div>
          <div className="w-16 h-16 bg-[#ED8936] rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {student.name.charAt(0)}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Lessons</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{student.lessons}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Avg Score</p>
            <p className="text-3xl font-bold text-[#ED8936] mt-1">{student.avgScore}%</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Last Active</p>
            <p className="text-lg font-bold text-[#1A365D] mt-1">{student.lastActive}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Status</p>
            <p className={`text-lg font-bold mt-1 capitalize ${
              student.status === 'active' ? 'text-green-600' :
              student.status === 'slipping' ? 'text-yellow-600' :
              student.status === 'struggling' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {student.status}
            </p>
          </div>
        </div>

        {/* Progress chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-[#1A365D] mb-4">📈 Progress Over Time</h2>
          <div className="flex items-end justify-between h-40 gap-3">
            {progressHistory.map((week, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-bold text-[#1A365D]">{week.score}%</span>
                <div
                  className="w-full bg-[#1A365D] rounded-t"
                  style={{ height: `${(week.score / 100) * 120}px` }}
                />
                <span className="text-xs text-gray-500">{week.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-[#1A365D] mb-4">🏆 Achievements Earned</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = completedAchievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`p-3 rounded-lg text-center border-2 ${
                    unlocked
                      ? 'bg-orange-50 border-[#ED8936]'
                      : 'bg-gray-50 border-gray-200 opacity-40'
                  }`}
                >
                  <div className="text-2xl mb-1">{unlocked ? a.icon : '🔒'}</div>
                  <p className="text-xs font-bold text-[#1A365D]">{a.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended action */}
        {student.status !== 'active' && (
          <div className={`p-6 rounded-xl border-2 ${
            student.status === 'struggling' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
          }`}>
            <h2 className={`font-bold mb-2 ${
              student.status === 'struggling' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              ⚠️ Recommended Action
            </h2>
            <p className="text-sm text-gray-700">
              {student.status === 'struggling'
                ? `${student.name} is struggling with ${student.subject}. Consider scheduling a 1-on-1 session or recommending additional practice lessons.`
                : `${student.name} hasn't logged in recently. Consider sending a reminder or checking in to see if they need help.`}
            </p>
            <button className="mt-3 bg-[#1A365D] hover:bg-blue-900 text-white px-5 py-2 rounded-lg font-bold text-sm">
              📧 Send Reminder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
