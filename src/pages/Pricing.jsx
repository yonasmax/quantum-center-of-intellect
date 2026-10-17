import React from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] py-10 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-[#1A365D] mb-4">
          Pricing Plans
        </h1>
        <p className="text-gray-600 mb-10 text-lg">
          Quantum Center of Intellect is currently in free public beta. Paid plans will launch soon.
        </p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          
          {/* Grades 5-11 Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-[#1A365D] mb-2">Grades 5 - 11</h2>
            <p className="text-sm text-gray-500 mb-6">Perfect for foundational learning.</p>
            
            <div className="mb-6 space-y-2">
              <p className="text-lg text-gray-700">Registration: <strong>200 ETB</strong> (One-time)</p>
              <p className="text-3xl font-bold text-[#ED8936]">1,500 ETB <span className="text-base text-gray-500 font-normal">/ month</span></p>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-gray-700">
              <li className="flex gap-2"><span className="text-green-500">✓</span> Access to all lessons for your grade</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Interactive quizzes and formulas</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Progress tracking and certificates</li>
            </ul>
            
            <button disabled className="w-full bg-gray-200 text-gray-500 py-3 rounded-lg font-bold cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          {/* Grade 12 Card */}
          <div className="bg-[#1A365D] p-8 rounded-2xl shadow-lg border-2 border-[#ED8936] text-white relative">
            <div className="absolute top-0 right-0 bg-[#ED8936] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
            <h2 className="text-2xl font-bold mb-2">Grade 12</h2>
            <p className="text-sm text-blue-200 mb-6">Intensive preparation for National Exams.</p>
            
            <div className="mb-6 space-y-2">
              <p className="text-lg text-blue-100">Registration: <strong>200 ETB</strong> (One-time)</p>
              <p className="text-3xl font-bold text-[#ED8936]">2,000 ETB <span className="text-base text-blue-200 font-normal">/ month</span></p>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-blue-100">
              <li className="flex gap-2"><span className="text-[#ED8936]">✓</span> Access to all Grade 12 lessons</li>
              <li className="flex gap-2"><span className="text-[#ED8936]">✓</span> Advanced exam-style quizzes</li>
              <li className="flex gap-2"><span className="text-[#ED8936]">✓</span> Exclusive exam preparation materials</li>
            </ul>
            
            <button disabled className="w-full bg-[#ED8936] text-white py-3 rounded-lg font-bold opacity-80 cursor-not-allowed">
              Coming Soon
            </button>
          </div>

        </div>

        {/* Free Beta Banner */}
        <div className="mt-12 bg-white p-6 rounded-xl border border-gray-200 max-w-2xl mx-auto">
          <h3 className="font-bold text-[#1A365D] mb-2">Enjoy Free Access During Beta!</h3>
          <p className="text-sm text-gray-600 mb-4">
            While we finish our payment integration, every feature is 100% free. No registration fee required right now.
          </p>
          <Link to="/catalog" className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-bold text-sm">
            Start Learning Free →
          </Link>
        </div>

        <div className="mt-8">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-[#1A365D]">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
