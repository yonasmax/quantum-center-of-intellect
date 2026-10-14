import React, { useState } from 'react';
import { enrollStudent, unenrollStudent } from '../services/profilesAPI';

const SUBJECTS = ['Chemistry', 'Physics', 'Biology', 'Math', 'English', 'History', 'Geography'];
const GRADES = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

export default function EnrollStudentModal({ student, existingEnrollments, onClose, onChanged }) {
  const [enrollments, setEnrollments] = useState(existingEnrollments || []);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[4]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await enrollStudent(student.email, subject, grade);
      setEnrollments((prev) => {
        const exists = prev.some((e) => e.subject === subject && e.grade === grade);
        if (exists) return prev;
        return [...prev, res.data.enrollment];
      });
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message || 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (subj, gr) => {
    setError('');
    setLoading(true);
    try {
      await unenrollStudent(student.email, subj, gr);
      setEnrollments((prev) => prev.filter((e) => !(e.subject === subj && e.grade === gr)));
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message || 'Failed to remove');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1A365D]">Enroll in Classes</h2>
            <p className="text-sm text-gray-500 mt-1">{student.full_name} ({student.email})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-5">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">Current Enrollments</h3>
          {enrollments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Not enrolled in any class yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {enrollments.map((e, i) => (
                <div key={i} className="bg-green-100 border border-green-200 text-green-800 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                  {e.subject} - {e.grade}
                  <button
                    onClick={() => handleRemove(e.subject, e.grade)}
                    disabled={loading}
                    className="text-green-600 hover:text-red-600 font-bold"
                    title="Remove"
                  >
                    ?
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">Enroll in New Class</h3>
          <div className="flex gap-2">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
            >
              {loading ? '...' : 'Enroll'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
