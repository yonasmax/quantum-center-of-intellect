import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LessonBlockRenderer from '../components/LessonBlockRenderer';

export default function StudentLessonViewer() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) console.error('[lesson-viewer] Error:', error);
      setLesson(data);
      setLoading(false);
    })();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <p className="text-[#1A365D] font-bold">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-4">Lesson not found.</p>
          <Link to="/catalog" className="text-[#ED8936] hover:underline">? Back to Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs uppercase text-[#ED8936] font-bold tracking-wider">
              {lesson.subject} ? {lesson.grade}
            </p>
            <h1 className="text-2xl font-bold mt-1">{lesson.title}</h1>
            <p className="text-xs opacity-80 mt-1">
              By {lesson.teacher_name || 'Teacher'}
              {lesson.duration ? ` ? ${lesson.duration} min` : ''}
            </p>
          </div>
          <Link to="/catalog" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold">
            Catalog
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#1A365D] mb-3">Learning Objectives</h2>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {lesson.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">?</span>
                  {obj}
                </li>
              ))}
            </ul>
            {lesson.competence && (
              <p className="text-xs text-gray-500 mt-3 italic">Competence: {lesson.competence}</p>
            )}
          </div>
        )}

        {/* Cover Image */}
        {lesson.cover_image_url && (
          <img
            src={lesson.cover_image_url}
            alt={lesson.title}
            className="w-full rounded-xl shadow-sm border border-gray-100"
          />
        )}

        {/* Content Blocks */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <LessonBlockRenderer blocks={lesson.content_blocks || []} />
        </div>

        {/* Takeaways */}
        {lesson.takeaways && lesson.takeaways.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h2 className="font-bold text-[#ED8936] mb-3">Key Takeaways</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {lesson.takeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#ED8936] mt-0.5">?</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
