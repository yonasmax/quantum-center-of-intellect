import React, { useState } from 'react';
import Lottie from 'lottie-react';

const CALLOUT_STYLES = {
  info: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-900', icon: 'i' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-900', icon: '!' },
  success: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-900', icon: 'OK' },
  tip: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-900', icon: '*' },
};

function HeadingBlock({ block }) {
  const Tag = `h${block.level || 2}`;
  const sizes = { 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg' };
  return (
    <Tag className={`font-bold text-[#1A365D] mt-6 mb-3 ${sizes[block.level] || 'text-xl'}`}>
      {block.text}
    </Tag>
  );
}

function ParagraphBlock({ block }) {
  return <p className="text-gray-700 leading-relaxed my-3">{block.text}</p>;
}

function CalloutBlock({ block }) {
  const s = CALLOUT_STYLES[block.variant] || CALLOUT_STYLES.info;
  return (
    <div className={`${s.bg} ${s.text} border-l-4 ${s.border} p-4 my-4 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <span className="text-lg font-bold">{s.icon}</span>
        <p className="text-sm leading-relaxed">{block.text}</p>
      </div>
    </div>
  );
}

function ImageBlock({ block }) {
  if (!block.url) return null;
  return (
    <figure className="my-6">
      <img
        src={block.url}
        alt={block.caption || 'Lesson image'}
        className="w-full rounded-lg border border-gray-200"
        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
      />
      {block.caption && (
        <figcaption className="text-center text-xs text-gray-500 mt-2 italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function AnimationBlock({ block }) {
  const [animationData, setAnimationData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!block.animationUrl) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetch(block.animationUrl)
      .then((r) => {
        if (!r.ok) throw new Error('Animation not found');
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [block.animationUrl]);

  return (
    <figure className="my-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex items-center justify-center min-h-[200px]">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-5 h-5 border-2 border-[#ED8936] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading animation...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : animationData ? (
          <div className="w-full max-w-md">
            <Lottie
              animationData={animationData}
              loop={block.loop !== false}
              autoplay={block.autoplay !== false}
              style={{ height: 220 }}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">No animation set</p>
        )}
      </div>
      {block.caption && (
        <figcaption className="text-center text-xs text-gray-500 mt-2 italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function FormulaBlock({ block }) {
  return (
    <div className="bg-[#1A365D] text-white p-5 my-4 rounded-xl text-center">
      <p className="font-mono text-3xl tracking-wider">{block.expression}</p>
      {block.description && (
        <p className="text-sm opacity-80 mt-2">{block.description}</p>
      )}
    </div>
  );
}

function QuizBlock({ block }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  const isCorrect = submitted && selected === block.correctIndex;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 my-6">
      <p className="text-xs font-bold text-[#ED8936] uppercase mb-2">Quiz Question</p>
      <p className="font-bold text-gray-800 mb-4">{block.question}</p>
      <div className="space-y-2">
        {block.options.map((opt, i) => {
          if (!opt.trim()) return null;
          const isThisSelected = selected === i;
          let itemClass = 'border-gray-200 bg-white hover:border-[#1A365D]';
          if (submitted) {
            if (i === block.correctIndex) itemClass = 'border-green-500 bg-green-50';
            else if (isThisSelected) itemClass = 'border-red-500 bg-red-50';
            else itemClass = 'border-gray-200 bg-white opacity-60';
          } else if (isThisSelected) {
            itemClass = 'border-[#1A365D] bg-blue-50';
          }
          return (
            <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${itemClass}`}>
              <input type="radio" name={`quiz-${block._id}`} checked={isThisSelected} onChange={() => setSelected(i)} disabled={submitted} className="w-4 h-4" />
              <span className="text-sm">{opt}</span>
            </label>
          );
        })}
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} disabled={selected === null} className="mt-4 bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
          Check Answer
        </button>
      ) : (
        <div className={`mt-4 p-3 rounded-lg font-bold text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${block.options[block.correctIndex]}`}
        </div>
      )}
    </div>
  );
}

export default function LessonBlockRenderer({ blocks }) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-gray-400 italic text-sm text-center py-6">This lesson has no content blocks yet.</p>;
  }

  return (
    <div className="space-y-1">
      {blocks.map((block, i) => {
        const key = block._id || i;
        switch (block._type) {
          case 'heading':   return <HeadingBlock   key={key} block={block} />;
          case 'paragraph': return <ParagraphBlock key={key} block={block} />;
          case 'callout':   return <CalloutBlock   key={key} block={block} />;
          case 'image':     return <ImageBlock     key={key} block={block} />;
          case 'animation': return <AnimationBlock key={key} block={block} />;
          case 'formula':   return <FormulaBlock   key={key} block={block} />;
          case 'quiz':      return <QuizBlock      key={key} block={block} />;
          default:          return null;
        }
      })}
    </div>
  );
}



