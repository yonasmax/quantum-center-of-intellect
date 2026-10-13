import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import {
  getTeacherAssignments,
  getStudentsForTeacher,
  getStudentProgress,
  getAllProfiles,
} from '../services/profilesAPI';

export default function TeacherDashboard() {
  const { profile, isTeacher, loading: profileLoading } = useProfile();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isTeacher || !profile) return;
    (async () => {
      try {
        const aRes = await getTeacherAssignments(profile.email);
        const aList = aRes.data.assignments;
        setAssignments(aList);

        const sRes = await getStudentsForTeacher(aList);
        const enrollments = sRes.data.enrollments;

        // Get unique student emails
        const studentEmails = [...new Set(enrollments.map((e) => e.student_id))];

        // Get profiles for those students
        const pRes = await getAllProfiles();
        const studentProfiles = pRes.data.profiles.filter((p) =>
          studentEmails.includes(p.email)
        );
        setAllProfiles(pRes.data.profiles);
        setStudents(studentProfiles);

        // Get progress for each student
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
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [isTeacher, profile]);

  if (profileLoading) return <div className="p-10">Loading profile...</div>;
  if (!isTeacher) return <Navigate to="/dashboard" replace />;

  const studentEnrollments = (email) => {
    return assignments
      .filter((a) => {
        // Only count if the student is enrolled in this teacher's subject/grade
        return true;
      })
      .map((a) => a);
  };

  const completedCount = (email) =>
    (progressMap[email] || []).filter((p) => p.completed).length;

  const timeSpent = (email) =>
    (progressMap[email] || []).reduce((s, p) => s + (p.time_spent_seconds || 0), 0);

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
          <Link to="/dashboard" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold">
            Main Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* My assignments */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-[#1A365D] mb-3">My Teaching Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-sm">No assignments yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignments.map((a) => (
                <span key={a.id} className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full text-sm font-bold">
                  {a.subject} - {a.grade}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Student roster */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-[#1A365D]">My Students ({students.length})</h2>
            <p className="text-xs text-gray-500 mt-1">Only students enrolled in my subjects/grades</p>
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
