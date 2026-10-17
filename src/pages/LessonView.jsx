import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LessonView() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Fetch the specific lesson by its UUID
        const { data, error: dbError } = await supabase
          .from('lessons')
          .select('*')
          .eq('lesson_id', lessonId);

        if (dbError) throw dbError;
        
        if (data && data.length > 0) {
          setLesson(data[0]);
        } else {
          setError('Lesson not found. It may have been deleted.');
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    })();
  }, [lessonId]);

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;
  
  if (error || !lesson) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-bold mb-4">{error || 'Lesson not found'}</p>
        <Link to="/catalog" className="text-blue-600 underline">Back to Catalog</Link>
      </div>
    );
  }

  // Ensure blocks is an array
  let blocks = lesson.content_blocks || [];
  if (typeof blocks === 'string') {
    try { blocks = JSON.parse(blocks); } catch (e) { blocks = []; }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* Header */}
      <header className="bg-[#1A365D] text-white p-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase">
            {lesson.subject} • {lesson.grade}
          </span>
          <h1 className="text-3xl font-bold mt-2">{lesson.title}</h1>
        </div>
      </header>

      {/* Content Container - Changed to a simple div, no complex wrappers */}
      <div className="max-w-4xl mx-auto mt-8 px-6">
        
        {blocks.length === 0 && (
          <div className="bg-white p-8 rounded-xl text-center text-gray-500">
            No blocks found in database for this lesson.
          </div>
        )}

        {blocks.map((block, i) => {
          if (block.type === 'heading') {
            return <h2 key={i} className="text-2xl font-bold text-[#1A365D] mt-8 mb-4 border-b pb-2">{block.content}</h2>;
          }
          if (block.type === 'text') {
            return <p key={i} className="text-gray-800 mb-4 text-lg">{block.content}</p>;
          }
          if (block.type === 'formula') {
            return <div key={i} className="bg-gray-200 p-4 rounded font-mono text-center mb-4">{block.content}</div>;
          }
          if (block.type === 'callout') {
            return <div key={i} className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-4">{block.content}</div>;
          }
          if (block.type === 'quiz') {
            return (
              <div key={i} className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-6">
                <p className="font-bold text-lg mb-4">{block.question}</p>
                <ul className="space-y-2">
                  {block.options && block.options.map((opt, idx) => (
                    <li key={idx} className="bg-white p-3 rounded border">{String.fromCharCode(65 + idx)}) {opt}</li>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}