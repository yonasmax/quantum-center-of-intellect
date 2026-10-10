import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../sanityClient';

export default function CourseCatalog() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');

  useEffect(() => {
    // Fetch all published lessons
    client.fetch(`*[_type == "lesson"] | order(subject asc, grade asc, lessonNumber asc) {
      _id,
      title,
      subject,
      grade,
      lessonNumber,
      mainTopic,
      competence
    }`).then((data) => {
      setLessons(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const subjects = [
    'All',
    'Mathematics',
    'Environmental Science',
    'General Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Social Studies',
    'Geography',
    'History',
    'Geez',
  ];
  const grades = ['All', '5', '6', '7', '8', '9', '10', '11', '12'];

  const filtered = lessons.filter(l =>
    (filterSubject === 'All' || l.subject === filterSubject) &&
    (filterGrade === 'All' || l.grade === filterGrade)
  );

  if (loading) return <div className="p-10 text-[#1A365D] font-bold text-center">Loading Catalog...</div>;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">⚛️ Quantum Center of Intellect</h1>
        <p className="text-sm opacity-80">Course Catalog — Learn Anything, Anywhere</p>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Subject</label>
            <select 
              value={filterSubject} 
              onChange={(e) => setFilterSubject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Grade</label>
            <select 
              value={filterGrade} 
              onChange={(e) => setFilterGrade(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-gray-500 font-medium">{filtered.length} lesson(s) found</p>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(lesson => (
            <Link 
              key={lesson._id} 
              to={`/lesson/${lesson._id}`}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#ED8936] hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-[#ED8936] bg-orange-50 px-2 py-1 rounded">
                  {lesson.subject}
                </span>
                <span className="text-xs font-bold text-gray-500">Grade {lesson.grade}</span>
              </div>
              <h3 className="font-bold text-[#1A365D] text-lg mb-2 line-clamp-2">
                {lesson.mainTopic || lesson.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {lesson.competence}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
                <span>Lesson {lesson.lessonNumber}</span>
                <span className="text-[#1A365D] font-bold">Start →</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center p-12 bg-white rounded-xl shadow-sm border">
            <p className="text-gray-500">No lessons found. Try changing your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}