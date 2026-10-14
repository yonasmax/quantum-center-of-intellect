import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import {
  getAllProfiles,
  getAllTeacherAssignments,
  getAllStudentEnrollments,
} from '../services/profilesAPI';
import CreateUserModal from '../components/CreateUserModal';
import AssignTeacherModal from '../components/AssignTeacherModal';
import EnrollStudentModal from '../components/EnrollStudentModal';

export default function AdminDashboard() {
  const { isAdmin, loading: profileLoading } = useProfile();
  const [profiles, setProfiles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('teachers');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState(null);
  const [enrollingStudent, setEnrollingStudent] = useState(null);

  const loadData = async () => {
    try {
      const [p, a, e] = await Promise.all([
        getAllProfiles(),
        getAllTeacherAssignments(),
        getAllStudentEnrollments(),
      ]);
      setProfiles(p.data.profiles);
      setAssignments(a.data.assignments);
      setEnrollments(e.data.enrollments);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  if (profileLoading) return <div className="p-10">Loading profile...</div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const teachers = profiles.filter((p) => p.role === 'teacher');
  const students = profiles.filter((p) => p.role === 'student');

  const teacherAssignments = (email) =>
    assignments.filter((a) => a.teacher_id === email);

  const studentEnrollments = (email) =>
    enrollments.filter((e) => e.student_id === email);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm opacity-80 mt-1">Manage teachers, students, and assignments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-sm bg-[#ED8936] hover:bg-orange-500 px-4 py-2 rounded-lg font-bold"
            >
              + Create User
            </button>
            <Link to="/dashboard" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold">
              Main Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold">Teachers</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{teachers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold">Students</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{students.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold">Assignments</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{assignments.length}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {['teachers', 'students', 'assignments'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-bold text-sm capitalize ${
                tab === t ? 'bg-[#1A365D] text-white' : 'bg-white text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-500">Loading...</div>
        ) : tab === 'teachers' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {teachers.length === 0 ? (
              <p className="p-6 text-gray-500">No teachers yet. Click "+ Create User" to add one.</p>
            ) : (
              teachers.map((t) => (
                <div key={t.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#1A365D]">{t.full_name}</p>
                      <p className="text-xs text-gray-500">{t.email}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded">
                      teacher
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {teacherAssignments(t.email).map((a, i) => (
                      <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {a.subject} - {a.grade}
                      </span>
                    ))}
                    <button
                      onClick={() => setAssigningTeacher(t)}
                      className="text-xs bg-[#1A365D] hover:bg-blue-900 text-white px-3 py-1 rounded font-bold"
                    >
                      + Assign Class
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : tab === 'students' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {students.length === 0 ? (
              <p className="p-6 text-gray-500">No students yet. Click "+ Create User" to add one.</p>
            ) : (
              students.map((s) => (
                <div key={s.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#1A365D]">{s.full_name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded">
                      student
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {studentEnrollments(s.email).map((e, i) => (
                      <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {e.subject} - {e.grade}
                      </span>
                    ))}
                    <button
                      onClick={() => setEnrollingStudent(s)}
                      className="text-xs bg-[#1A365D] hover:bg-blue-900 text-white px-3 py-1 rounded font-bold"
                    >
                      + Enroll Class
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {assignments.length === 0 ? (
              <p className="p-6 text-gray-500">No assignments yet.</p>
            ) : (
              assignments.map((a) => (
                <div key={a.id} className="p-4 border-b border-gray-100 last:border-b-0 flex justify-between">
                  <span className="font-bold text-[#1A365D]">{a.teacher_id}</span>
                  <span className="text-sm">
                    {a.subject} - {a.grade}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            loadData();
          }}
        />
      )}

      {assigningTeacher && (
        <AssignTeacherModal
          teacher={assigningTeacher}
          existingAssignments={teacherAssignments(assigningTeacher.email)}
          onClose={() => setAssigningTeacher(null)}
          onChanged={() => loadData()}
        />
      )}

      {enrollingStudent && (
        <EnrollStudentModal
          student={enrollingStudent}
          existingEnrollments={studentEnrollments(enrollingStudent.email)}
          onClose={() => setEnrollingStudent(null)}
          onChanged={() => loadData()}
        />
      )}
    </div>
  );
}
