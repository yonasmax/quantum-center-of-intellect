import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveLesson } from '../services/lessonsAPI';
import ContentBlockEditor from '../components/ContentBlockEditor';

const SUBJECTS = ['Chemistry', 'Physics', 'Biology', 'Math', 'English', 'History', 'Geography'];
const GRADES = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

export default function CreateLesson() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Chemistry',
    grade: 'Grade 9',
    lesson_number: '',
    duration: 45,
    objectivesText: '',
    competence: '',
    cover_image_url: '',
    video_url: '',
    takeawaysText: '',
    is_published: false,
  });

  const [contentBlocks, setContentBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      return setError('Title is required');
    }

    setSaving(true);
    try {
      const objectives = formData.objectivesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const takeaways = formData.takeawaysText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await saveLesson({
        title: formData.title.trim(),
        subject: formData.subject,
        grade: formData.grade,
        lesson_number: formData.lesson_number ? Number(formData.lesson_number) : null,
        duration: Number(formData.duration) || 45,
        objectives,
        competence: formData.competence.trim(),
        content_blocks: contentBlocks,
        cover_image_url: formData.cover_image_url.trim() || null,
        video_url: formData.video_url.trim() || null,
        takeaways,
        is_published: formData.is_published,
      });

      setSuccess(formData.is_published ? 'Lesson published!' : 'Lesson saved as draft!');
      setTimeout(() => {
        navigate('/teacher');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Create New Lesson</h1>
            <p className="text-sm opacity-80 mt-1">Author content for your students</p>
          </div>
          <Link to="/teacher" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold">
            Back to Teacher Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* BASIC INFO */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-[#1A365D] text-lg">Basic Information</h2>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Lesson Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                placeholder="Introduction to the Atom & Electron Configuration"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Grade *</label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Lesson Number</label>
                <input
                  type="number"
                  value={formData.lesson_number}
                  onChange={(e) => handleChange('lesson_number', e.target.value)}
                  placeholder="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="45"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* OBJECTIVES */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-[#1A365D] text-lg">Learning Objectives</h2>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Objectives (one per line)
              </label>
              <textarea
                value={formData.objectivesText}
                onChange={(e) => handleChange('objectivesText', e.target.value)}
                rows={4}
                placeholder="Understand the Bohr Model&#10;Identify subatomic particles&#10;Calculate atomic mass"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Learning Competence</label>
              <input
                type="text"
                value={formData.competence}
                onChange={(e) => handleChange('competence', e.target.value)}
                placeholder="Atomic Theory Fundamentals"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* CONTENT BLOCKS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div>
              <h2 className="font-bold text-[#1A365D] text-lg">Lesson Content</h2>
              <p className="text-sm text-gray-500 mt-1">
                Build your lesson from blocks ? headings, paragraphs, callouts, images, formulas, and quizzes.
              </p>
            </div>
            <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
          </div>

          {/* MEDIA */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-[#1A365D] text-lg">Media (optional)</h2>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Cover Image URL</label>
              <input
                type="url"
                value={formData.cover_image_url}
                onChange={(e) => handleChange('cover_image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Video URL</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => handleChange('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* TAKEAWAYS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-[#1A365D] text-lg">Key Takeaways</h2>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Takeaways (one per line)
              </label>
              <textarea
                value={formData.takeawaysText}
                onChange={(e) => handleChange('takeawaysText', e.target.value)}
                rows={4}
                placeholder="Atoms consist of a nucleus surrounded by electrons&#10;The Bohr model visualizes electrons in fixed orbits"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none font-mono text-sm"
              />
            </div>
          </div>

          {/* PUBLISH */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#1A365D] text-lg mb-4">Publish</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => handleChange('is_published', e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm text-gray-700">
                Publish immediately (visible to students in the catalog)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              If unchecked, the lesson is saved as a draft and only you can see it.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {saving ? 'Saving...' : (formData.is_published ? 'Publish Lesson' : 'Save Draft')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
