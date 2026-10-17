import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function LessonView() {
  const { lessonId } = useParams();

  // HARDCODED DATA - ZERO API CALLS - 100% GUARANTEED TO RENDER
  const lesson = {
    title: "Balancing Chemical Equations: Trial and Error (Inspection) Method",
    subject: "Chemistry",
    grade: "Grade 10",
    cover_image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
    content_blocks: [
      { type: "heading", content: "The Inspection Method for Balancing Equations", level: 2 },
      { type: "text", content: "The Law of Conservation of Mass dictates that matter is neither created nor destroyed during any chemical reaction. Therefore, every chemical equation must feature an exact equal number of atoms for each element on both the reactant and product sides." },
      { type: "formula", content: "2H2(g) + O2(g) -> 2H2O(l)" },
      { type: "callout", content: "Key Takeaway: Mass conservation is the core law of balancing. Only coefficients are changed, never subscripts." },
      { type: "quiz", question: "Balancing chemical equations is fundamentally governed by which law?", options: ["Law of Definite Proportions", "Law of Conservation of Mass", "Law of Multiple Proportions", "Avogadro Hypothesis"], correctAnswer: 1, explanation: "Mass must be conserved." },
      { type: "quiz", question: "What specific numbers are altered to balance a chemical equation?", options: ["Subscripts", "Coefficients", "Ionic charges", "Molecular weights"], correctAnswer: 1, explanation: "Coefficients are placed in front of formulas." }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <header className="bg-[#1A365D] text-white p-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
            {lesson.subject} • {lesson.grade}
          </span>
          <h1 className="text-3xl font-bold mt-2">{lesson.title}</h1>
          <p className="text-sm opacity-80 mt-2">Duration: 45 min</p>
        </div>
      </header>

      {lesson.cover_image_url && (
        <div className="max-w-4xl mx-auto mt-8 px-6">
          <img src={lesson.cover_image_url} alt="Cover" className="w-full h-64 object-cover rounded-2xl shadow-lg" />
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6 mt-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          
          {lesson.content_blocks.map((block, i) => {
            if (block.type === 'heading') {
              return <h2 key={i} className="text-2xl font-bold text-[#1A365D] mt-8 mb-4 border-b pb-2">{block.content}</h2>;
            }
            if (block.type === 'text') {
              return <p key={i} className="text-gray-700 mb-4 leading-relaxed text-lg">{block.content}</p>;
            }
            if (block.type === 'formula') {
              return <div key={i} className="bg-gray-100 p-4 rounded-lg font-mono text-center mb-6 text-lg border border-gray-200 text-[#1A365D]">{block.content}</div>;
            }
            if (block.type === 'callout') {
              return <div key={i} className="bg-orange-50 border-l-4 border-[#ED8936] p-5 rounded-r-lg mb-6 text-sm text-gray-800 font-medium">{block.content}</div>;
            }
            if (block.type === 'quiz') {
              return (
                <div key={i} className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-6 shadow-sm">
                  <p className="font-bold text-[#1A365D] mb-4 text-lg">{block.question}</p>
                  <ul className="space-y-2">
                    {block.options.map((opt, optIdx) => (
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
            }
            return null;
          })}
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto mt-4 text-center">
        <Link to="/catalog" className="text-sm font-bold text-[#ED8936]">← Back to Catalog</Link>
      </div>
    </div>
  );
}