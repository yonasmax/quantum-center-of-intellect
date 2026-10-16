import React from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] py-10 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-[#1A365D] mb-4">
          Payments Coming Soon
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Quantum Center of Intellect is currently in free public beta.
        </p>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="text-6xl mb-4">??</div>
          <h2 className="text-2xl font-bold text-[#1A365D] mb-3">
            All Lessons FREE During Beta
          </h2>
          <p className="text-gray-600 mb-6">
            Every feature ? lessons, quizzes, certificates, leaderboard ?
            is completely free while we finish our payment integration.
          </p>
          <Link
            to="/catalog"
            className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg"
          >
            Start Learning Free ?
          </Link>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-left">
          <h3 className="font-bold text-[#ED8936] mb-2">Coming Soon</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>? Premium monthly subscription (1,500 ETB/month)</li>
            <li>? Yearly plan with 2 months free (15,000 ETB/year)</li>
            <li>? Telebirr payment via Chapa</li>
          </ul>
        </div>

        <div className="mt-8">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-[#1A365D]">
            ? Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
