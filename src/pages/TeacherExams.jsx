import React, { useState } from 'react';
import mammoth from 'mammoth';
import { Link } from 'react-router-dom';

export default function TeacherExams() {
  const [exams, setExams] = useState([
    { id: 1, title: 'Grade 12 Chemistry Mock Exam', date: '2026-10-17', students: 45, avgScore: '82%' },
    { id: 2, title: 'Grade 8 General Science Midterm', date: '2026-10-15', students: 60, avgScore: '75%' },
    { id: 3, title: 'Grade 6 Maths Assessment', date: '2026-10-10', students: 38, avgScore: '88%' },
  ]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleExamUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      const titleMatch = text.match(/Subject:\s*(.*?)\n/);
      const gradeMatch = text.match(/Grade:\s*(.*?)\n/);
      
      const newExam = {
        id: Date.now(),
        title: `${gradeMatch ? gradeMatch[1].trim() : 'Unknown'} ${titleMatch ? titleMatch[1].trim() : 'Exam'}`,
        date: new Date().toISOString().split('T')[0],
        students: 0,
        avgScore: 'N/A'
      };

      alert(`✅ Exam "${newExam.title}" parsed successfully!`);
      setExams(prev => [newExam, ...prev]);
      
    } catch (err) {
      setError('Failed to parse document: ' + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1A365D]">Manage Exams</h1>
            <p className="text-gray-500">Upload and invigilate online model exams for schools.</p>
          </div>
          <Link to="/teacher" className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg font-bold text-gray-700 hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-[#ED8936]">
          <h2 className="font-bold text-[#1A365D] text-lg mb-2">Upload New Exam</h2>
          <p className="text-sm text-gray-500 mb-4">Upload a Word document containing questions in the standard format.</p>
          
          {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
          
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".docx"
              onChange={handleExamUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#1A365D] file:text-white hover:file:bg-blue-900 cursor-pointer"
            />
          </div>
          {uploading && <p className="text-sm text-blue-600 mt-2 animate-pulse">Parsing exam...</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-[#1A365D] text-lg">Recent Exams</h2>
            <button className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200">
              Export All Results (CSV)
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Exam Name</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Students</th>
                <th className="p-4 font-bold">Avg Score</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-bold text-[#1A365D]">{exam.title}</td>
                  <td className="p-4 text-sm text-gray-600">{exam.date}</td>
                  <td className="p-4 text-sm text-gray-600">{exam.students}</td>
                  <td className="p-4 text-sm text-gray-600 font-bold text-green-600">{exam.avgScore}</td>
                  <td className="p-4 text-right space-x-2">
                    <button className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-bold">Results CSV</button>
                    <button className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
