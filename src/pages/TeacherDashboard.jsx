import React, { useEffect, useState } from 'react';
import { seedDecompositionLesson } from '../utils/seedLesson';
import { Link, Navigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import {
  getTeacherAssignments,
  getStudentsForTeacher,
  getStudentProgress,
  getAllProfiles,
} from '../services/profilesAPI';
import { getMyLessons, deleteLesson } from '../services/lessonsAPI';

export default function TeacherDashboard() {
  const { profile, isTeacher, loading: profileLoading } = useProfile();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyLessonId, setBusyLessonId] = useState(null);

  const loadLessons = async () => {
    try {
      const res = await getMyLessons();
      setLessons(res.data.lessons);
    } catch (err) {
      console.error('[teacher] Lessons load failed:', err);
    }
  };

  useEffect(() => {
    if (!isTeacher || !profile) return;
    (async () => {
      try {
        const aRes = await getTeacherAssignments(profile.email);
        const aList = aRes.data.assignments;
        setAssignments(aList);

        const sRes = await getStudentsForTeacher(aList);
        const enrollments = sRes.data.enrollments;
        const studentEmails = [...new Set(enrollments.map((e) => e.student_id))];

        const pRes = await getAllProfiles();
        const studentProfiles = pRes.data.profiles.filter((p) =>
          studentEmails.includes(p.email)
        );
        setStudents(studentProfiles);

        const progMap = {};
        for (const email of studentEmails) {
          try {
            const progRes = await getStudentProgress(email);
            progMap[email] = progRes.data.progress;
          } catch {
            progMap[email] = [];
          }
        }
        setProgressMap(progMap);

        await loadLessons();
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [isTeacher, profile]);

  if (profileLoading) return <div className="p-10">Loading profile...</div>;
  if (!isTeacher) return <Navigate to="/dashboard" replace />;

  const completedCount = (email) =>
    (progressMap[email] || []).filter((p) => p.completed).length;

  const timeSpent = (email) =>
    (progressMap[email] || []).reduce((s, p) => s + (p.time_spent_seconds || 0), 0);

  const handleDelete = async (lessonId, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusyLessonId(lessonId);
    try {
      await deleteLesson(lessonId);
      setLessons((prev) => prev.filter((l) => l.lesson_id !== lessonId));
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setBusyLessonId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-sm opacity-80 mt-1">
              Welcome, {profile?.full_name || profile?.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/teacher/create"
              className="text-sm bg-[#ED8936] hover:bg-orange-500 px-4 py-2 rounded-lg font-bold"
            >
              + Create Lesson
            </Link>
            <Link
              to="/dashboard"
              className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold"
            >
              Main Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* My Teaching Assignments */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1A365D] mb-3">My Teaching Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-sm">No assignments yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignments.map((a) => (
                <span
                  key={a.id}
                  className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full text-sm font-bold"
                >
                  {a.subject} - {a.grade}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* My Lessons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <button 
  onClick={async () => {
    try {
      await seedDecompositionLesson();
      alert('✅ Lesson inserted successfully! Refreshing...');
      window.location.reload();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  }}
  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm mb-4"
>
  🚀 Inject Test Lesson
</button>
<h2 className="font-bold text-[#1A365D]">My Lessons ({lessons.length})</h2>
              <p className="text-xs text-gray-500 mt-1">
                Lessons you've authored. Publish to make them visible to students.
              </p>
            </div>
          </div>

          {lessons.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-3">No lessons yet.</p>
              <Link
                to="/teacher/create"
                className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2 rounded-lg font-bold text-sm"
              >
                Create Your First Lesson
              </Link>
            </div>
          ) : (
            <div>
              {lessons.map((lesson) => (
                <div
                  key={lesson.lesson_id}
                  className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[#1A365D] truncate">
                          {lesson.title}
                        </h3>
                        {lesson.is_published ? (
                          <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded">
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded">
                            DRAFT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {lesson.subject} ? {lesson.grade}
                        {lesson.lesson_number ? ` ? Lesson ${lesson.lesson_number}` : ''}
                        {lesson.duration ? ` ? ${lesson.duration} min` : ''}
                        {' ? '}
                        {lesson.content_blocks?.length || 0} blocks
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        to={`/lesson-view/${lesson.lesson_id}`}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold"
                      >
                        Preview
                      </Link>
                      <Link
                        to={`/teacher/edit/${lesson.lesson_id}`}
                        className="text-xs bg-[#1A365D] hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg font-bold"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(lesson.lesson_id, lesson.title)}
                        disabled={busyLessonId === lesson.lesson_id}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-bold disabled:opacity-50"
                      >
                        {busyLessonId === lesson.lesson_id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-[#1A365D]">My Students ({students.length})</h2>
            <p className="text-xs text-gray-500 mt-1">
              Only students enrolled in my subjects/grades
            </p>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500 text-sm">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">No students enrolled yet.</p>
          ) : (
            students.map((s) => (
              <div key={s.id} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-[#1A365D]">{s.full_name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700 uppercase font-bold">Lessons Completed</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{completedCount(s.email)}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-700 uppercase font-bold">Time Spent</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {Math.round(timeSpent(s.email) / 60)} min
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

