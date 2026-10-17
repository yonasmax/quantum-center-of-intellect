import React from 'react';
import { Link } from 'react-router-dom';

export default function LessonView() {
  // HARDCODED DATA - No database needed for now
  const lesson = {
    title: "Types of Chemical Reactions: Decomposition (Analysis) Reactions",
    subject: "Chemistry",
    grade: "Grade 10",
    duration: 45,
    cover_image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
    content_blocks: [
      { type: "heading", content: "Understanding Decomposition Reactions", level: 2 },
      { type: "text", content: "Decomposition reactions involve breaking down a single complex compound into two or more simpler substances or elemental components. Because chemical bonds within the reactant must be broken, these reactions are endothermic." },
      { type: "formula", content: "2HgO(s) -> 2Hg(l) + O2(g)" },
      { type: "callout", content: "Key Takeaway: Energy inputs like heat, electricity, or light are necessary to break robust chemical bonds." },
      { 
        type: "quiz", 
        question: "What symbol is placed above a reaction arrow to indicate thermal decomposition?", 
        options: ["Delta (heat)", "(aq)", "STP", "Hz"], 
        correctAnswer: 0, 
        explanation: "Delta means heat." 
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <header className="bg-[#1A365D] text-white p-8 shadow-md">
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
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-8 px-6">
        <img src={lesson.cover_image_url} alt="Cover" className="w-full h-64 object-cover rounded-2xl shadow-lg" />
      </div>

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
