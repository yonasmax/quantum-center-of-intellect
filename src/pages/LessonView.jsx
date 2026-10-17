import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLesson } from '../services/lessonsAPI';
import { useAuth } from '../context/AuthContext';

export default function LessonView() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getLesson(lessonId);
        if (res.data && res.data.lesson) {
          setLesson(res.data.lesson);
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    })();
  }, [lessonId]);

  // Helper function to render content blocks safely
  const renderBlock = (block, index) => {
    if (!block || !block.type) return null;
    
    switch (block.type) {
      case 'heading':
        return <h2 key={index} className="text-2xl font-bold text-[#1A365D] mt-8 mb-4">{block.content}</h2>;
      case 'text':
        return <p key={index} className="text-gray-700 mb-4 leading-relaxed">{block.content}</p>;
      case 'formula':
        return <div key={index} className="bg-gray-100 p-4 rounded-lg font-mono text-center mb-6 text-lg border border-gray-200">{block.content}</div>;
      case 'callout':
        return <div key={index} className="bg-orange-50 border-l-4 border-[#ED8936] p-5 rounded-r-lg mb-6 text-sm text-gray-800 font-medium">{block.content}</div>;
      case 'quiz':
        return (
          <div key={index} className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-6 shadow-sm">
            <p className="font-bold text-[#1A365D] mb-4">{block.question}</p>
            <ul className="space-y-2">
              {block.options && block.options.map((opt, i) => (
                <li key={i} className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200">{String.fromCharCode(65 + i)}) {opt}</li>
              ))}
            </ul>
            {block.explanation && <p className="text-xs text-blue-500 mt-4 italic bg-blue-100 p-2 rounded">Explanation: {block.explanation}</p>}
          </div>
        );
      case 'image':
        return <img key={index} src={block.url} alt="Lesson visual" className="w-full rounded-xl shadow-md my-6" />;
      case 'list':
        return (
          <ul key={index} className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            {block.items && block.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]"><p className="text-[#1A365D] font-bold">Loading lesson...</p></div>;
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

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-[#1A365D] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
              {lesson.subject} • {lesson.grade}
            </span>
            <Link to="/catalog" className="text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
              Back to Catalog
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="text-sm opacity-80 mt-2">By {user?.fullName || 'Teacher'} • {lesson.duration || 45} min</p>
        </div>
      </header>

      {/* Cover Image */}
      {lesson.cover_image_url && (
        <div className="max-w-4xl mx-auto mt-8 px-6">
          <img src={lesson.cover_image_url} alt="Cover" className="w-full h-64 object-cover rounded-2xl shadow-lg" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6 pt-8">
        {lesson.content_blocks && lesson.content_blocks.length > 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {lesson.content_blocks.map((block, i) => renderBlock(block, i))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500">No content blocks available for this lesson.</p>
          </div>
        )}

        {/* Video */}
        {lesson.video_url && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#1A365D] mb-4">Lesson Video</h3>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                src={lesson.video_url.replace('watch?v=', 'embed/')} 
                title="Lesson video" 
                frameBorder="0" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
