import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../sanityClient';
import { FiPlus, FiEdit3, FiEye, FiTrendingUp, FiBook, FiUsers, FiUpload } from 'react-icons/fi';

export default function TeacherDashboard() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentTeacher = {
    name: 'Mr. Yonas',
    email: 'yonasmolla3@gmail.com',
  };

  useEffect(() => {
    client
      .fetch(
        `*[_type == "lesson"] | order(_createdAt desc) {
      _id, title, subject, grade, lessonNumber, mainTopic, _createdAt
    }`
      )
      .then((data) => {
        setLessons(data);
        setLoading(false);
      })
      .catch((err) => {
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
      {/* Header */}
      <header className="bg-[#1A365D] text-white p-6 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">⚛️ Quantum Center of Intellect</h1>
          <p className="text-sm opacity-80">Teacher Dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">Welcome back,</p>
          <p className="font-bold">{currentTeacher.name}</p>
        </div>
      </header>

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
                <p className="text-3xl font-bold text-[#1A365D]">0</p>
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
                <p className="text-3xl font-bold text-[#1A365D]">—</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <FiTrendingUp className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Action bar with Bulk Import + Create */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-[#1A365D]">Your Lessons</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/teacher/import"
              className="bg-white border-2 border-[#1A365D] text-[#1A365D] hover:bg-blue-50 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              <FiUpload /> Bulk Import
            </Link>
            <Link
              to="/teacher/create"
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <FiPlus /> Create New Lesson
            </Link>
          </div>
        </div>

        {/* Lessons list */}
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
                  <span className="text-xs font-bold text-gray-500">
                    Grade {lesson.grade}
                  </span>
                  <span className="text-xs text-gray-400">
                    Lesson {lesson.lessonNumber}
                  </span>
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
              <p className="text-gray-500 mb-4">
                You haven't created any lessons yet.
              </p>
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