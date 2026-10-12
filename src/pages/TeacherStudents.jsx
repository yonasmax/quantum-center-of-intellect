// src/pages/TeacherStudents.jsx
// List of all students with search and filter
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TeacherTabs from '../components/TeacherTabs';

const MOCK_STUDENTS = [
  { id: '1', name: 'Abebe Kebede', email: 'abebe@example.com', grade: '9', subject: 'Chemistry', lessons: 47, avgScore: 92, lastActive: 'Today', status: 'active' },
  { id: '2', name: 'Sara Tesfaye', email: 'sara@example.com', grade: '9', subject: 'Chemistry', lessons: 42, avgScore: 88, lastActive: 'Today', status: 'active' },
  { id: '3', name: 'Mikael Wolde', email: 'mikael@example.com', grade: '9', subject: 'Chemistry', lessons: 38, avgScore: 81, lastActive: 'Yesterday', status: 'active' },
  { id: '4', name: 'Hanna Bekele', email: 'hanna@example.com', grade: '9', subject: 'Chemistry', lessons: 35, avgScore: 75, lastActive: '2 days ago', status: 'active' },
  { id: '5', name: 'Yonas Molla', email: 'yonas@example.com', grade: '10', subject: 'Biology', lessons: 31, avgScore: 68, lastActive: '3 days ago', status: 'slipping' },
  { id: '6', name: 'Lily Alemu', email: 'lily@example.com', grade: '10', subject: 'Biology', lessons: 28, avgScore: 62, lastActive: '5 days ago', status: 'slipping' },
  { id: '7', name: 'Dawit Girma', email: 'dawit@example.com', grade: '9', subject: 'Physics', lessons: 24, avgScore: 55, lastActive: '1 week ago', status: 'struggling' },
  { id: '8', name: 'Marta Haile', email: 'marta@example.com', grade: '10', subject: 'Biology', lessons: 21, avgScore: 48, lastActive: '2 weeks ago', status: 'struggling' },
  { id: '9', name: 'Biniam Desta', email: 'biniam@example.com', grade: '9', subject: 'Chemistry', lessons: 18, avgScore: 45, lastActive: '3 weeks ago', status: 'struggling' },
  { id: '10', name: 'Eden Tadesse', email: 'eden@example.com', grade: '10', subject: 'Physics', lessons: 15, avgScore: 40, lastActive: '1 month ago', status: 'inactive' },
  { id: '11', name: 'Selam Gebre', email: 'selam@example.com', grade: '9', subject: 'Math', lessons: 40, avgScore: 85, lastActive: 'Today', status: 'active' },
  { id: '12', name: 'Kidist Alemu', email: 'kidist@example.com', grade: '10', subject: 'Physics', lessons: 33, avgScore: 72, lastActive: 'Yesterday', status: 'active' },
];

const getStatusStyle = (status) => {
  switch (status) {
    case 'active':
      return { dot: 'bg-green-500', label: 'Active', badge: 'bg-green-100 text-green-700' };
    case 'slipping':
      return { dot: 'bg-yellow-500', label: 'Slipping', badge: 'bg-yellow-100 text-yellow-700' };
    case 'struggling':
      return { dot: 'bg-red-500', label: 'Struggling', badge: 'bg-red-100 text-red-700' };
    case 'inactive':
      return { dot: 'bg-gray-400', label: 'Inactive', badge: 'bg-gray-100 text-gray-700' };
    default:
      return { dot: 'bg-gray-400', label: 'Unknown', badge: 'bg-gray-100 text-gray-700' };
  }
};

export default function TeacherStudents() {
  const [students] = useState(MOCK_STUDENTS);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const grades = ['All', ...Array.from(new Set(students.map((s) => s.grade))).sort()];
  const subjects = ['All', ...Array.from(new Set(students.map((s) => s.subject))).sort()];

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesGrade = gradeFilter === 'All' || s.grade === gradeFilter;
      const matchesSubject = subjectFilter === 'All' || s.subject === subjectFilter;
      return matchesSearch && matchesGrade && matchesSubject;
    });
  }, [students, search, gradeFilter, subjectFilter]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">⚛️ Quantum Center of Intellect</h1>
          <p className="text-sm opacity-80">My Students</p>
        </div>
      </header>

      <TeacherTabs />

      <div className="max-w-6xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none"
          />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white font-medium"
          >
            {grades.map((g) => (
              <option key={g} value={g}>
                {g === 'All' ? 'All Grades' : `Grade ${g}`}
              </option>
            ))}
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white font-medium"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>
          <div className="flex items-center px-4 text-sm text-gray-500 font-medium">
            {filtered.length} / {students.length} students
          </div>
        </div>

        {/* Students table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Student</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Grade</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subject</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase">Lessons</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase">Avg Score</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Last Active</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => {
                  const style = getStatusStyle(student.status);
                  return (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#1A365D] text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#1A365D]">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{student.grade}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-bold uppercase text-[#ED8936] bg-orange-50 px-2 py-1 rounded">
                          {student.subject}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-[#1A365D]">{student.lessons}</td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`font-bold ${
                            student.avgScore >= 70
                              ? 'text-green-600'
                              : student.avgScore >= 50
                              ? 'text-[#ED8936]'
                              : 'text-red-600'
                          }`}
                        >
                          {student.avgScore}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-gray-500">{student.lastActive}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${style.badge}`}>
                          ● {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/teacher/students/${student.id}`}
                          className="text-[#1A365D] hover:text-[#ED8936] font-bold text-sm"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No students match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
