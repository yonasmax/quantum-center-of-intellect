import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLesson } from '../services/lessonsAPI';

export default function LessonView() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getLesson(lessonId);
        // Safely extract the lesson whether the API returns it as an array or object
        const fetchedLesson = res?.data?.lesson || (Array.isArray(res?.data) ? res.data[0] : res?.data);
        
        if (fetchedLesson) {
          setLesson(fetchedLesson);
        } else {
          setError('Lesson not found in database.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load lesson');
      }
      setLoading(false);
    })();
  }, [lessonId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]"><p className="text-[#1A365D] font-bold text-lg animate-pulse">Loading lesson...</p></div>;
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <p className="text-red-500 font-bold mb-4">{error || 'Lesson not found'}</p>
          <Link to="/catalog" className="text-[#ED8936] hover:underline font-bold">← Back to Catalog</Link>
        </div>
      </div>
    );
  }

  // Check for all possible content block names
  let blocks = lesson.content_blocks || lesson.contentBlocks || lesson.blocks || [];
  
  if (typeof blocks === 'string') {
    try { blocks = JSON.parse(blocks); } catch (e) { console.error("Parse error", e); blocks = []; }
  }

  if (!Array.isArray(blocks)) { blocks = []; }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <header className="bg-[#1A365D] text-white p-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
              {lesson.subject || 'Chemistry'} • {lesson.grade || 'Grade 10'}
            </span>
            <Link to="/catalog" className="text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
              Back to Catalog
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="text-sm opacity-80 mt-2">Duration: {lesson.duration || 45} min</p>
        </div>
      </header>

      {lesson.cover_image_url && (
        <div className="max-w-4xl mx-auto mt-8 px-6">
          <img src={lesson.cover_image_url} alt="Cover" className="w-full h-64 object-cover rounded-2xl shadow-lg" />
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6 mt-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          
          {blocks.length === 0 && (
            <p className="text-gray-500 text-center py-10">No content blocks found in the database.</p>
          )}

          {blocks.map((block, i) => {
            if (!block || !block.type) return null;

            switch (block.type) {
              case 'heading':
                return <h2 key={i} className="text-2xl font-bold text-[#1A365D] mt-8 mb-4 border-b pb-2">{block.content}</h2>;
              
              case 'text':
                return <p key={i} className="text-gray-700 mb-4 leading-relaxed text-lg">{block.content}</p>;
              
              case 'formula':
                return <div key={i} className="bg-gray-100 p-4 rounded-lg font-mono text-center mb-6 text-lg border border-gray-200 text-[#1A365D]">{block.content}</div>;
              
              case 'callout':
                return <div key={i} className="bg-orange-50 border-l-4 border-[#ED8936] p-5 rounded-r-lg mb-6 text-sm text-gray-800 font-medium">{block.content}</div>;
              
              case 'quiz':
                return (
                  <div key={i} className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-6 shadow-sm">
                    <p className="font-bold text-[#1A365D] mb-4 text-lg">{block.question}</p>
                    <ul className="space-y-2">
                      {block.options && block.options.map((opt, optIdx) => (
                        <li key={optIdx} className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                          <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)})</span> {opt}
                        </li>
                      ))}
                    </ul>
                    {block.explanation && (
                      <p className="text-xs text-blue-600 mt-4 italic bg-blue-100 p-3 rounded">Explanation: {block.explanation}</p>
                    )}
                  </div>
                );
              
              default:
                return <div key={i} className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">Unknown block type: {block.type}</div>;
            }
          })}
        </div>
      </div>
    </div>
  );
}
