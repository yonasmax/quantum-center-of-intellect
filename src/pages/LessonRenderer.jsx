import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { client, urlFor } from '../sanityClient';
import ImageFigure from '../components/figures/ImageFigure';
import TableFigure from '../components/figures/TableFigure';
import BarChartFigure from '../components/figures/BarChartFigure';
import LineChartFigure from '../components/figures/LineChartFigure';
import FormulaFigure from '../components/figures/FormulaFigure';

// Icons (inline SVG for zero deps)
const IconHome = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const IconAtom = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth={2} /><ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth={2} /><ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth={2} transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" strokeWidth={2} transform="rotate(120 12 12)" /></svg>
);
const IconLab = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
);
const IconMicroscope = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v-2m6 2v-2M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" /></svg>
);
const IconBook = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
);
const IconQuiz = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

// Render a single content block
const renderBlock = (block, index) => {
  switch (block._type) {
    case 'block':
      return (
        <p key={block._key || index} className="my-3 text-gray-700 leading-relaxed">
          {block.children?.map((c) => c.text).join('')}
        </p>
      );
    case 'calloutBlock':
      const calloutColors = {
        info: 'bg-blue-50 border-blue-500 text-blue-900',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
        success: 'bg-green-50 border-green-500 text-green-900',
        tip: 'bg-purple-50 border-purple-500 text-purple-900',
      };
      return (
        <div
          key={block._key || index}
          className={`p-4 my-4 rounded-lg border-l-4 ${
            calloutColors[block.type] || calloutColors.info
          }`}
        >
          <p className="text-sm font-medium">
            <span className="font-bold uppercase text-xs mr-2">
              {block.type === 'info' ? 'ℹ️' : block.type === 'warning' ? '⚠️' : block.type === 'success' ? '✅' : '💡'}
            </span>
            {block.text}
          </p>
        </div>
      );
    case 'imageFigure':
      return <ImageFigure key={block._key || index} block={block} index={index + 1} />;
    case 'tableFigure':
      return <TableFigure key={block._key || index} block={block} index={index + 1} />;
    case 'barChart':
      return <BarChartFigure key={block._key || index} block={block} index={index + 1} />;
    case 'lineChart':
      return <LineChartFigure key={block._key || index} block={block} index={index + 1} />;
    case 'formulaFigure':
      return <FormulaFigure key={block._key || index} block={block} index={index + 1} />;
    default:
      return null;
  }
};

export default function LessonRenderer() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [selectedPractice, setSelectedPractice] = useState({});
  const [practiceSubmitted, setPracticeSubmitted] = useState({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    client
      .fetch(`*[_type == "lesson" && _id == $id][0]`, { id: lessonId })
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [lessonId]);

  const handlePracticeSubmit = (qIndex, correct) => {
    setPracticeSubmitted((prev) => ({ ...prev, [qIndex]: true }));
  };

  const handleQuizSubmit = () => {
    if (!selectedQuizAnswer) return;
    setQuizSubmitted(true);
    if (selectedQuizAnswer === lesson.quiz[currentQuizIndex].correctAnswer) {
      setQuizScore((s) => s + 1);
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < lesson.quiz.length - 1) {
      setCurrentQuizIndex((i) => i + 1);
      setSelectedQuizAnswer(null);
      setQuizSubmitted(false);
    }
  };

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
        <p className="text-red-500 font-bold">Lesson not found.</p>
      </div>
    );
  }

  const quizProgress = lesson.quiz ? ((currentQuizIndex + 1) / lesson.quiz.length) * 100 : 0;
  const currentQuiz = lesson.quiz?.[currentQuizIndex];

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">

      {/* ===================== TOP HEADER ===================== */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A365D] rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">⚛️</span>
            </div>
            <div>
              <h1 className="font-bold text-[#1A365D] leading-tight">
                Quantum Center of Intellect
              </h1>
              <p className="text-xs text-gray-500">Chemistry Explorer</p>
            </div>
          </div>

          {/* Metadata Pills */}
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-medium">
              Lesson No: {lesson.lessonNumber || '3'}
            </span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium">
              Date: {lesson.publishDate || '18/10/2023'}
            </span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium">
              Time: {lesson.timeSlot || '11:00 AM'} {lesson.duration ? `(${lesson.duration} min)` : '(45 min)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Student</p>
              <p className="text-sm font-bold text-[#1A365D]">Sarah, 14</p>
            </div>
            <div className="w-9 h-9 bg-[#1A365D] text-white rounded-full flex items-center justify-center font-bold text-sm">
              S
            </div>
          </div>
        </div>
      </header>

      {/* ===================== MAIN 3-COLUMN LAYOUT ===================== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ==== LEFT SIDEBAR ==== */}
        <aside className="w-16 bg-[#1E293B] flex-col items-center py-6 gap-6 text-gray-400 hidden md:flex">
          <button className="hover:text-white transition-colors"><IconHome /></button>
          <button className="text-[#ED8936]"><IconAtom /></button>
          <button className="hover:text-white transition-colors"><IconLab /></button>
          <button className="hover:text-white transition-colors"><IconMicroscope /></button>
          <button className="hover:text-white transition-colors"><IconBook /></button>
          <button className="hover:text-white transition-colors"><IconQuiz /></button>
        </aside>

        {/* ==== CENTER + RIGHT CONTENT ==== */}
        <main className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 p-5">

            {/* ---------- CENTER COLUMN ---------- */}
            <div className="space-y-5">

              {/* Main Topic Card */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-lg text-[#1A365D] mb-3">
                  {lesson.mainTopic || lesson.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <div>
                      <p className="font-bold text-gray-700">Objectives:</p>
                      <ul className="text-gray-600 text-xs mt-1 space-y-0.5">
                        {lesson.objectives?.map((obj, i) => (
                          <li key={i}>• {obj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#ED8936] mt-0.5">🎯</span>
                    <div>
                      <p className="font-bold text-gray-700">Learning Competence:</p>
                      <p className="text-gray-600 text-xs mt-1">{lesson.competence}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bohr Model Card */}
              {lesson.bohrModel && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#1A365D] mb-3">
                    {lesson.bohrModel.title || 'The Bohr Model'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Particles + Calculation */}
                    <div>
                      {lesson.bohrModel.subtitle && (
                        <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
                          {lesson.bohrModel.subtitle}
                        </p>
                      )}
                      <ul className="text-xs space-y-1 text-gray-700 mb-4">
                        {lesson.bohrModel.particleList?.map((p, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#ED8936] rounded-full"></span>
                            {p}
                          </li>
                        ))}
                      </ul>
                      {lesson.bohrModel.calculationValue && (
                        <div className="bg-[#1A365D] text-white p-3 rounded-lg">
                          <p className="text-xs font-bold mb-1">
                            {lesson.bohrModel.calculationLabel || 'Calculating Atomic Mass:'}
                          </p>
                          <p className="text-sm font-mono">{lesson.bohrModel.calculationValue}</p>
                        </div>
                      )}
                    </div>
                    {/* Right: Diagram */}
                    {lesson.bohrModel.diagram && (
                      <div className="bg-[#0F1E3A] rounded-lg p-3 flex items-center justify-center">
                        <img
                          src={urlFor(lesson.bohrModel.diagram).width(600).url()}
                          alt="Bohr Model Diagram"
                          className="max-h-48 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content Blocks */}
              {lesson.contentBlocks && lesson.contentBlocks.length > 0 && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#1A365D] mb-3">Full Brief Note</h3>
                  <div className="text-sm">
                    {lesson.contentBlocks.map((block, i) => renderBlock(block, i))}
                  </div>
                </div>
              )}

              {/* Practice Questions */}
              {lesson.practiceQuestions && lesson.practiceQuestions.length > 0 && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#1A365D] mb-4">Practice Questions</h3>
                  <div className="space-y-5">
                    {lesson.practiceQuestions.map((q, qi) => {
                      const options = [
                        { key: 'A', text: q.optionA },
                        { key: 'B', text: q.optionB },
                        { key: 'C', text: q.optionC },
                      ];
                      const submitted = practiceSubmitted[qi];
                      const selected = selectedPractice[qi];
                      const isCorrect = selected === q.correctAnswer;

                      return (
                        <div key={qi} className="border-b border-gray-100 pb-4 last:border-b-0">
                          <p className="text-sm font-bold text-gray-800 mb-3">
                            {qi + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {options.map((opt) => (
                              <label
                                key={opt.key}
                                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                                  selected === opt.key
                                    ? 'border-[#1A365D] bg-blue-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                } ${submitted ? 'cursor-not-allowed opacity-90' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`pq-${qi}`}
                                  value={opt.key}
                                  checked={selected === opt.key}
                                  onChange={() =>
                                    setSelectedPractice((p) => ({ ...p, [qi]: opt.key }))
                                  }
                                  disabled={submitted}
                                  className="w-4 h-4"
                                />
                                <span>
                                  <strong>{opt.key})</strong> {opt.text}
                                </span>
                              </label>
                            ))}
                          </div>
                          {!submitted && selected && (
                            <button
                              onClick={() => handlePracticeSubmit(qi, isCorrect)}
                              className="mt-3 text-xs bg-[#1A365D] hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg font-bold"
                            >
                              Check Answer
                            </button>
                          )}
                          {submitted && (
                            <p
                              className={`mt-3 text-xs font-bold p-2 rounded ${
                                isCorrect
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {isCorrect
                                ? '✅ Correct!'
                                : `❌ Incorrect. Correct answer: ${q.correctAnswer}`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* ---------- RIGHT COLUMN ---------- */}
            <div className="space-y-5">

              {/* Video Panel */}
              {lesson.video?.url && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#1A365D] mb-2 text-sm">
                    {lesson.video.title || 'Atomic Structure Animation'}
                  </h3>
                  <div className="aspect-video bg-[#1E293B] rounded-lg overflow-hidden relative group cursor-pointer">
                    {lesson.video.thumbnail ? (
                      <img
                        src={urlFor(lesson.video.thumbnail).width(600).url()}
                        alt={lesson.video.title}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {lesson.video.duration && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                        {lesson.video.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {lesson.video.title} {lesson.video.duration && `(${lesson.video.duration})`}
                  </p>
                </div>
              )}

              {/* Key Takeaways */}
              {lesson.takeaways && lesson.takeaways.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                  <h3 className="font-bold text-[#ED8936] text-sm mb-3 flex items-center gap-2">
                    💡 Key Takeaways
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-700">
                    {lesson.takeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#ED8936] mt-0.5">▸</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Figures Behind Theories */}
              {lesson.figures && lesson.figures.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#1A365D] text-sm mb-3">
                    Figures Behind Theories
                  </h3>
                  {lesson.figures.map((fig, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <p className="text-xs font-bold text-gray-700 mb-1">{fig.title}</p>
                      {fig.image && (
                        <div className="bg-gray-50 rounded-lg p-2">
                          <img
                            src={urlFor(fig.image).width(500).url()}
                            alt={fig.title}
                            className="w-full h-auto rounded"
                          />
                        </div>
                      )}
                      {fig.caption && (
                        <p className="text-xs text-gray-500 mt-1 italic">{fig.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Auto-Quiz Progress */}
              {currentQuiz && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#1A365D] text-sm mb-3">Auto-Quiz</h3>

                  <div className="flex text-xs mb-3 border-b border-gray-200">
                    <button className="pb-1 mr-3 font-bold text-[#1A365D] border-b-2 border-[#1A365D]">
                      Fill in the blanks
                    </button>
                    <button className="pb-1 text-gray-400">Match columns</button>
                  </div>

                  <p className="text-xs text-gray-700 mb-2">
                    <strong>Q{currentQuizIndex + 1}:</strong> {currentQuiz.question}
                  </p>
                  <div className="space-y-1.5 mb-3">
                    {currentQuiz.options.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 text-xs p-2 rounded-lg border cursor-pointer ${
                          selectedQuizAnswer === opt
                            ? 'border-[#1A365D] bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="autquiz"
                          value={opt}
                          checked={selectedQuizAnswer === opt}
                          onChange={(e) => setSelectedQuizAnswer(e.target.value)}
                          disabled={quizSubmitted}
                          className="w-3.5 h-3.5"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>

                  {quizSubmitted && (
                    <p
                      className={`text-xs font-bold p-2 rounded mb-2 ${
                        selectedQuizAnswer === currentQuiz.correctAnswer
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {selectedQuizAnswer === currentQuiz.correctAnswer
                        ? '✅ Correct!'
                        : `❌ Answer: ${currentQuiz.correctAnswer}`}
                    </p>
                  )}

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {currentQuizIndex + 1}/{lesson.quiz.length} questions
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${quizProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={!selectedQuizAnswer}
                        className="flex-1 bg-[#ED8936] hover:bg-orange-500 text-white text-xs py-2 rounded-lg font-bold disabled:opacity-50"
                      >
                        Check Answers
                      </button>
                    ) : currentQuizIndex < lesson.quiz.length - 1 ? (
                      <button
                        onClick={handleNextQuiz}
                        className="flex-1 bg-[#1A365D] hover:bg-blue-900 text-white text-xs py-2 rounded-lg font-bold"
                      >
                        Next Question →
                      </button>
                    ) : (
                      <div className="flex-1 bg-green-100 text-green-800 text-xs py-2 rounded-lg font-bold text-center">
                        🎉 Quiz Complete! Score: {quizScore}/{lesson.quiz.length}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}