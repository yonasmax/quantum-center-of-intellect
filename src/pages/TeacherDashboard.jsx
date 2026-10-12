import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../sanityClient';
import { useAuth } from '../context/AuthContext';
import TeacherTabs from '../components/TeacherTabs';
import { FiPlus, FiEdit3, FiEye, FiTrendingUp, FiBook, FiUsers, FiUpload } from 'react-icons/fi';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .fetch(`*[_type == "lesson"] | order(_createdAt desc) {
        _id, title, subject, grade, lessonNumber, mainTopic, _createdAt
      }`)
      .then((data) => {
        setLessons(data);
        setLoading(false);
      })
      .catch((err) =>{
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="p-10 text-[#1A365D] font-bold text-center">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">⚛️ Quantum Center of Intellect</h1>
          <p className="text-sm opacity-80">Teacher Dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">Welcome back,</p>
          <p className="font-bold">{user?.fullName || 'Teacher'}</p>
        </div>
      </header>

      <TeacherTabs />

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Lessons</p>
                <p className="text-3xl font-bold text-[#1A365D]">{lessons.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <FiBook className="text-[#1A365D] text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Students</p>
                <p className="text-3xl font-bold text-[#1A365D]">12</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <FiUsers className="text-[#ED8936] text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg Quiz Score</p>
                <p className="text-3xl font-bold text-[#1A365D]">76%</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <FiTrendingUp className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/teacher/analytics"
            className="bg-gradient-to-br from-[#1A365D] to-[#2C4A7C] p-5 rounded-xl shadow-md text-white hover:scale-105 transition-transform"
          >
            <p className="text-3xl mb-2">📊</p>
            <p className="font-bold">Analytics</p>
            <p className="text-xs opacity-80 mt-1">See class insights</p>
          </Link>
          <Link
            to="/teacher/students"
            className="bg-gradient-to-br from-[#ED8936] to-orange-400 p-5 rounded-xl shadow-md text-white hover:scale-105 transition-transform"
          >
            <p className="text-3xl mb-2">👥</p>
            <p className="font-bold">Students</p>
            <p className="text-xs opacity-80 mt-1">View all 12</p>
          </Link>
          <Link
            to="/teacher/import"
            className="bg-white border-2 border-[#1A365D] p-5 rounded-xl shadow-md hover:scale-105 transition-transform"
          >
            <p className="text-3xl mb-2">📥</p>
            <p className="font-bold text-[#1A365D]">Import</p>
            <p className="text-xs text-gray-500 mt-1">Bulk Excel</p>
          </Link>
          <Link
            to="/teacher/create"
            className="bg-white border-2 border-[#ED8936] p-5 rounded-xl shadow-md hover:scale-105 transition-transform"
          >
            <p className="text-3xl mb-2">➕</p>
            <p className="font-bold text-[#ED8936]">New Lesson</p>
            <p className="text-xs text-gray-500 mt-1">Create content</p>
          </Link>
        </div>

        {/* Lessons list */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1A365D]">Your Lessons</h2>
          <div className="flex gap-3">
            <Link
              to="/teacher/import"
              className="bg-white border-2 border-[#1A365D] text-[#1A365D] hover:bg-blue-50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
            >
              <FiUpload /> Import
            </Link>
            <Link
              to="/teacher/create"
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md"
            >
              <FiPlus /> Create
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {lessons.map((lesson, i) => (
            <div
              key={lesson._id}
              className={`flex items-center justify-between p-5 ${
                i !== lessons.length - 1 ? 'border-b border-gray-100' : ''
              } hover:bg-gray-50 transition-colors`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold uppercase text-[#ED8936] bg-orange-50 px-2 py-1 rounded">
                    {lesson.subject}
                  </span>
                  <span className="text-xs font-bold text-gray-500">Grade {lesson.grade}</span>
                  <span className="text-xs text-gray-400">Lesson {lesson.lessonNumber}</span>
                </div>
                <h3 className="font-bold text-[#1A365D]">
                  {lesson.mainTopic || lesson.title}
                </h3>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/lesson/${lesson._id}`}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Preview"
                >
                  <FiEye className="text-gray-600" />
                </Link>
                <Link
                  to={`/teacher/edit/${lesson._id}`}
                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  title="Edit"
                >
                  <FiEdit3 className="text-[#1A365D]" />
                </Link>
              </div>
            </div>
          ))}

          {lessons.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">You haven't created any lessons yet.</p>
              <Link
                to="/teacher/create"
                className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold"
              >
                Create Your First Lesson
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
