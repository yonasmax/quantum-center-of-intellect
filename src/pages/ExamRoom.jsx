import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExamRoom() {
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [answers, setAnswers] = useState({});

  // 1. The Laptop Lock (Fullscreen API & Focus detection)
  useEffect(() => {
    const handleViolation = () => {
      setIsLocked(true);
      // Optionally save violation to database here
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    const handleBlur = () => {
      handleViolation();
    };

    // Request full screen on mount
    const enterFullScreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request failed", err);
      }
    };
    enterFullScreen();

    // Add listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  // 2. The Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Time is up! Your exam has been submitted automatically.");
      navigate('/dashboard');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 3. The LOCKED Screen
  if (isLocked) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center text-white p-6 text-center z-50 fixed inset-0">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-4">⚠️ EXAM LOCKED</h1>
          <p className="text-lg mb-8">
            You navigated away from the exam window. Your exam has been paused. 
            This violation has been recorded and will be sent to your teacher.
          </p>
          <button 
            onClick={() => setIsLocked(false)}
            className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100"
          >
            Resume Exam (Final Warning)
          </button>
        </div>
      </div>
    );
  }

  // 4. The Exam UI
  return (
    <div className="min-h-screen bg-gray-100 p-6 select-none">
      {/* Header */}
      <div className="max-w-3xl mx-auto bg-[#1A365D] text-white p-4 rounded-t-xl flex justify-between items-center shadow-md">
        <div>
          <h1 className="font-bold text-lg">Chemistry Model Exam</h1>
          <p className="text-xs opacity-80">Grade 12 • Invigilated Session</p>
        </div>
        <div className="bg-red-500 px-4 py-2 rounded-lg font-mono text-xl font-bold animate-pulse">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Body */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-b-xl shadow-lg">
        <div className="mb-8">
          <p className="text-sm text-gray-500 font-bold mb-2">Question 1 of 10</p>
          <p className="text-xl font-bold text-[#1A365D] mb-4">
            Which of the following is classified as a physical change?
          </p>
          <div className="space-y-3">
            {['Burning of wood', 'Melting of ice cream', 'Rusting of iron', 'Souring of milk'].map((opt, i) => (
              <label key={i} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="q1" className="w-5 h-5" />
                <span className="text-gray-800">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
          <p className="text-sm text-red-500 font-bold flex items-center gap-2">
            <span>🔒</span> Do not exit full screen or switch tabs.
          </p>
          <button className="bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold">
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}
