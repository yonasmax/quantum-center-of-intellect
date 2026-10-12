// src/pages/Pricing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { PLANS, FAMILY_PLAN, REGISTRATION_FEE } from '../data/plans';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-8 shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-2">💰 Choose Your Plan</h1>
        <p className="text-sm opacity-80">Learn at your own pace. Cancel anytime.</p>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Registration Fee Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-6 flex items-start gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-bold text-yellow-900">One-Time Registration Fee</p>
            <p className="text-sm text-yellow-800">
              A registration fee of <strong>{REGISTRATION_FEE.amount} ETB</strong> applies for new students.
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {PLANS.map((plan) => {
            const colors = {
              gray: 'border-gray-300',
              blue: 'border-blue-400',
              orange: 'border-[#ED8936]',
              purple: 'border-purple-400',
            };
            const bgColors = {
              gray: 'bg-gray-500',
              blue: 'bg-blue-500',
              orange: 'bg-[#ED8936]',
              purple: 'bg-purple-500',
            };

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-sm border-2 ${colors[plan.color]} p-5 relative flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ED8936] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                    ⭐ POPULAR
                  </div>
                )}

                <h3 className="font-bold text-lg text-[#1A365D] mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#1A365D]">{plan.price}</span>
                  <span className="text-sm text-gray-500 ml-1">ETB</span>
                  <p className="text-xs text-gray-500 mt-1">{plan.duration}</p>
                </div>

                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/payments?plan=${plan.id}`}
                  className={`block text-center ${bgColors[plan.color]} hover:opacity-90 text-white py-2.5 rounded-lg font-bold text-sm transition-all`}
                >
                  {plan.price === 0 ? 'Start Free' : 'Choose Plan'}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Family Plan */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-2xl mb-2">👨‍👩‍👧‍👦 {FAMILY_PLAN.name}</h3>
              <p className="text-sm opacity-90 mb-3">
                Perfect for families with multiple children. Save up to 60%!
              </p>
              <ul className="grid grid-cols-2 gap-2 text-xs">
                {FAMILY_PLAN.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center md:text-right flex-shrink-0">
              <p className="text-sm opacity-80 mb-1">Only</p>
              <p className="text-4xl font-bold mb-3">
                {FAMILY_PLAN.price} <span className="text-lg">ETB</span>
              </p>
              <Link
                to={`/payments?plan=${FAMILY_PLAN.id}`}
                className="inline-block bg-white text-green-700 px-6 py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Choose Family →
              </Link>
            </div>
          </div>
        </div>

        {/* Why upgrade */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#1A365D] text-lg mb-4 text-center">
            Why upgrade?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📚</div>
              <p className="font-bold text-sm text-[#1A365D]">Unlimited Lessons</p>
              <p className="text-xs text-gray-500 mt-1">All subjects, all grades</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎓</div>
              <p className="font-bold text-sm text-[#1A365D]">Certificates</p>
              <p className="text-xs text-gray-500 mt-1">Prove your mastery</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <p className="font-bold text-sm text-[#1A365D]">AI Tutor</p>
              <p className="text-xs text-gray-500 mt-1">24/7 personal help</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚫</div>
              <p className="font-bold text-sm text-[#1A365D]">No Ads</p>
              <p className="text-xs text-gray-500 mt-1">Focus on learning</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Questions? Contact us at{' '}
            <span className="text-[#1A365D] font-bold">support@quantumcenter.et</span>
          </p>
        </div>
      </div>
    </div>
  );
}
