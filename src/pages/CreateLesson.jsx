import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { client } from '../sanityClient';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

const SUBJECTS = [
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

const GRADES = ['5', '6', '7', '8', '9', '10', '11', '12'];

export default function CreateLesson() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Chemistry',
    grade: '9',
    lessonNumber: 1,
    mainTopic: '',
    competence: '',
    objectives: [''],
    quiz: [{ question: '', options: ['', '', ''], correctAnswer: '' }]
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lessonId) {
      client.fetch(`*[_type == "lesson" && _id == $id][0]`, { id: lessonId })
        .then((data) => { if (data) setFormData(data); });
    }
  }, [lessonId]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleObjectiveChange = (i, v) => {
    const n = [...formData.objectives]; n[i] = v;
    handleChange('objectives', n);
  };
  const addObjective = () => handleChange('objectives', [...formData.objectives, '']);
  const removeObjective = (i) => handleChange('objectives', formData.objectives.filter((_, idx) => idx !== i));

  const handleQuizChange = (qi, field, value) => {
    const newQuiz = [...formData.quiz];
    if (field === 'question') newQuiz[qi].question = value;
    if (field === 'correctAnswer') newQuiz[qi].correctAnswer = value;
    if (field.startsWith('option-')) {
      const oi = parseInt(field.split('-')[1]);
      newQuiz[qi].options[oi] = value;
    }
    handleChange('quiz', newQuiz);
  };
  const addQuiz = () => handleChange('quiz', [...formData.quiz, { question: '', options: ['', '', ''], correctAnswer: '' }]);
  const removeQuiz = (i) => handleChange('quiz', formData.quiz.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const doc = {
        _type: 'lesson',
        title: formData.title,
        subject: formData.subject,
        grade: formData.grade,
        lessonNumber: parseInt(formData.lessonNumber),
        mainTopic: formData.mainTopic,
        competence: formData.competence,
        objectives: formData.objectives.filter(o => o.trim()),
        quiz: formData.quiz.filter(q => q.question.trim())
      };

      if (lessonId) {
        await client.patch(lessonId).set(doc).commit();
      } else {
        await client.create(doc);
      }
      navigate('/teacher');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Save failed. Check your API token permissions.');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">⚛️ {lessonId ? 'Edit' : 'Create'} Lesson</h1>
        <p className="text-sm opacity-80">Quantum Center of Intellect</p>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1A365D] mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 block mb-1">Lesson Title *</label>
              <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Introduction to the Atom" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Subject</label>
              <select value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Grade</label>
              <select value={formData.grade} onChange={(e) => handleChange('grade', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Lesson Number</label>
              <input type="number" value={formData.lessonNumber} onChange={(e) => handleChange('lessonNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Learning Competence</label>
              <input type="text" value={formData.competence} onChange={(e) => handleChange('competence', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Atomic Theory Fundamentals" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 block mb-1">Main Topic</label>
              <input type="text" value={formData.mainTopic} onChange={(e) => handleChange('mainTopic', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Introduction to the Atom" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#1A365D]">Learning Objectives</h2>
            <button onClick={addObjective} className="text-sm bg-blue-50 text-[#1A365D] px-3 py-1 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-1">
              <FiPlus /> Add
            </button>
          </div>
          {formData.objectives.map((obj, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input type="text" value={obj} onChange={(e) => handleObjectiveChange(i, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2" placeholder={`Objective ${i + 1}`} />
              {formData.objectives.length > 1 && (
                <button onClick={() => removeObjective(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#1A365D]">Quiz Questions</h2>
            <button onClick={addQuiz} className="text-sm bg-blue-50 text-[#1A365D] px-3 py-1 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-1">
              <FiPlus /> Add Question
            </button>
          </div>

          {formData.quiz.map((q, qi) => (
            <div key={qi} className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <label className="text-sm font-bold text-gray-700">Question {qi + 1}</label>
                {formData.quiz.length > 1 && (
                  <button onClick={() => removeQuiz(qi)} className="text-red-500 text-sm hover:underline">Remove</button>
                )}
              </div>
              <input type="text" value={q.question} onChange={(e) => handleQuizChange(qi, 'question', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="What is the charge of a neutron?" />
              <p className="text-xs font-bold text-gray-600 mb-2">Options (mark the correct one):</p>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex gap-2 mb-2 items-center">
                  <input type="radio" name={`correct-${qi}`}
                    checked={q.correctAnswer === opt && opt !== ''}
                    onChange={() => handleQuizChange(qi, 'correctAnswer', opt)} />
                  <input type="text" value={opt} onChange={(e) => handleQuizChange(qi, `option-${oi}`, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" placeholder={`Option ${oi + 1}`} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => navigate('/teacher')} className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !formData.title.trim()}
            className="bg-[#ED8936] hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-md disabled:opacity-50">
            <FiSave /> {saving ? 'Saving...' : 'Save Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
}