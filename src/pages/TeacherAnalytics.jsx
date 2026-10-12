// src/pages/TeacherAnalytics.jsx
// Teacher analytics dashboard — real (local) + mock data
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TeacherTabs from '../components/TeacherTabs';

// Mock student data — will be replaced by backend later
const MOCK_STUDENTS = [
  { id: '1', name: 'Abebe Kebede', grade: '9', subject: 'Chemistry', lessons: 47, avgScore: 92, lastActive: 'Today', status: 'active' },
  { id: '2', name: 'Sara Tesfaye', grade: '9', subject: 'Chemistry', lessons: 42, avgScore: 88, lastActive: 'Today', status: 'active' },
  { id: '3', name: 'Mikael Wolde', grade: '9', subject: 'Chemistry', lessons: 38, avgScore: 81, lastActive: 'Yesterday', status: 'active' },
  { id: '4', name: 'Hanna Bekele', grade: '9', subject: 'Chemistry', lessons: 35, avgScore: 75, lastActive: '2 days ago', status: 'active' },
  { id: '5', name: 'Yonas Molla', grade: '10', subject: 'Biology', lessons: 31, avgScore: 68, lastActive: '3 days ago', status: 'slipping' },
  { id: '6', name: 'Lily Alemu', grade: '10', subject: 'Biology', lessons: 28, avgScore: 62, lastActive: '5 days ago', status: 'slipping' },
  { id: '7', name: 'Dawit Girma', grade: '9', subject: 'Physics', lessons: 24, avgScore: 55, lastActive: '1 week ago', status: 'struggling' },
  { id: '8', name: 'Marta Haile', grade: '10', subject: 'Biology', lessons: 21, avgScore: 48, lastActive: '2 weeks ago', status: 'struggling' },
  { id: '9', name: 'Biniam Desta', grade: '9', subject: 'Chemistry', lessons: 18, avgScore: 45, lastActive: '3 weeks ago', status: 'struggling' },
  { id: '10', name: 'Eden Tadesse', grade: '10', subject: 'Physics', lessons: 15, avgScore: 40, lastActive: '1 month ago', status: 'inactive' },
];

export default function TeacherAnalytics() {
  const [students] = useState(MOCK_STUDENTS);

  // Compute aggregate stats
  const stats = useMemo(() => {
    const total = students.length;
    const avgScore = Math.round(students.reduce((s, x) => s + x.avgScore, 0) / total);
    const totalLessons = students.reduce((s, x) => s + x.lessons, 0);
    const activeToday = students.filter((s) => s.lastActive === 'Today').length;
    return { total, avgScore, totalLessons, activeToday };
  }, [students]);

  // Subject breakdown
  const subjects = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      if (!map[s.subject]) map[s.subject] = { students: 0, avgScore: 0, totalScore: 0 };
      map[s.subject].students += 1;
      map[s.subject].totalScore += s.avgScore;
    });
    Object.values(map).forEach((x) => {
      x.avgScore = Math.round(x.totalScore / x.students);
    });
    return Object.entries(map).sort((a, b) => b[1].avgScore - a[1].avgScore);
  }, [students]);

  // Top performers
  const topPerformers = [...students].sort((a, b) => b.lessons - a.lessons).slice(0, 5);

  // Needs help (struggling or inactive)
  const needsHelp = students
    .filter((s) => s.status === 'struggling' || s.status === 'inactive')
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">⚛️ Quantum Center of Intellect</h1>
            <p className="text-sm opacity-80">Teacher Analytics</p>
          </div>
          <Link
            to="/teacher/students"
            className="bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm"
          >
            👥 View All Students
          </Link>
        </div>
      </header>

      <TeacherTabs />

      <div className="max-w-6xl mx-auto p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Total Students</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Avg Score</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{stats.avgScore}%</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Total Lessons</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{stats.totalLessons}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Active Today</p>
            <p className="text-3xl font-bold text-[#ED8936] mt-1">{stats.activeToday}</p>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Subject Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#1A365D] mb-4">📈 Class Performance by Subject</h2>
            <div className="space-y-4">
              {subjects.map(([subject, data]) => (
                <div key={subject}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800">{subject}</span>
                    <span className="text-sm text-gray-500">
                      {data.students} students · {data.avgScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        data.avgScore >= 70
                          ? 'bg-green-500'
                          : data.avgScore >= 50
                          ? 'bg-[#ED8936]'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${data.avgScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#1A365D] mb-4">🏆 Top Performers</h2>
            <div className="space-y-3">
              {topPerformers.map((student, i) => (
                <Link
                  key={student.id}
                  to={`/teacher/students/${student.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      i === 0
                        ? 'bg-yellow-400 text-white'
                        : i === 1
                        ? 'bg-gray-300 text-gray-700'
                        : i === 2
                        ? 'bg-orange-300 text-white'
                        : 'bg-blue-100 text-[#1A365D]'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1A365D] truncate">{student.name}</p>
                    <p className="text-xs text-gray-500">
                      Grade {student.grade} · {student.lessons} lessons
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#ED8936]">{student.avgScore}%</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Needs Help */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-red-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-red-700">⚠️ Students Needing Help</h2>
            <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded">
              {needsHelp.length} students
            </span>
          </div>
          <div className="space-y-3">
            {needsHelp.map((student) => (
              <Link
                key={student.id}
                to={`/teacher/students/${student.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
              >
                <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A365D] truncate">{student.name}</p>
                  <p className="text-xs text-gray-600">
                    Grade {student.grade} · Last active: {student.lastActive}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-600 font-bold">{student.avgScore}%</p>
                  <p className="text-xs text-gray-500">avg score</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
