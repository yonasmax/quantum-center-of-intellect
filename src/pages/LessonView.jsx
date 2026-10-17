import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LessonView() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('lessons').select('*').eq('lesson_id', lessonId);
        if (error) throw error;
        if (data && data.length > 0) setLesson(data[0]);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [lessonId]);

  if (loading) return <div className="p-10 text-center font-bold">Loading lesson...</div>;
  if (!lesson) return <div className="p-10 text-center text-red-500">Lesson not found.</div>;

  // Parse blocks safely
  let blocks = lesson.content_blocks || [];
  if (typeof blocks === 'string') {
    try { blocks = JSON.parse(blocks); } catch (e) { blocks = []; }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-[#1A365D] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="text-sm mt-2">{lesson.subject} • {lesson.grade}</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 mt-6">
        <div className="bg-white p-8 rounded-xl shadow-md">
          
          {blocks.length === 0 && (
            <p className="text-gray-500 text-center">No content blocks found in database.</p>
          )}

          {blocks.map((block, i) => {
            if (block.type === 'heading') {
              return <h2 key={i} className="text-2xl font-bold text-[#1A365D] mt-6 mb-3 border-b pb-2">{block.content}</h2>;
            }
            if (block.type === 'text') {
              return <p key={i} className="text-gray-700 mb-4 leading-relaxed text-lg">{block.content}</p>;
            }
            if (block.type === 'formula') {
              return <div key={i} className="bg-gray-100 p-4 rounded-lg font-mono text-center mb-4 text-lg">{block.content}</div>;
            }
            if (block.type === 'callout') {
              return <div key={i} className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4 text-gray-800">{block.content}</div>;
            }
            if (block.type === 'quiz') {
              return (
                <div key={i} className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-6">
                  <p className="font-bold text-[#1A365D] mb-4 text-lg">{block.question}</p>
                  <ul className="space-y-2">
                    {block.options && block.options.map((opt, idx) => (
                      <li key={idx} className="bg-white p-3 rounded border border-gray-200">
                        <span className="font-bold mr-2">{String.fromCharCode(65 + idx)})</span> {opt}
                      </li>
                    ))}
                  </ul>
                  {block.explanation && <p className="text-sm text-blue-600 mt-4 italic">{block.explanation}</p>}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}