import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setSubscription } from '../services/subscriptionsAPI';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    cycle: 'forever',
    features: ['Access to 5 lessons', 'Basic quizzes', 'Progress tracking'],
    highlight: false,
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 199,
    cycle: 'monthly',
    features: ['All lessons', 'All quizzes', 'Certificates', 'Cross-device sync'],
    highlight: true,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 1990,
    cycle: 'yearly',
    features: ['Everything in Monthly', '2 months free', 'Priority support'],
    highlight: false,
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleChoose = async (plan) => {
    setLoading(plan.id);
    try {
      if (plan.id === 'free') {
        await setSubscription('free', 'Free', 0, 'forever');
        navigate('/dashboard');
      } else {
        await setSubscription(plan.id, plan.name, plan.price, plan.cycle);
        navigate('/payments');
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#1A365D]">Choose Your Plan</h1>
          <p className="text-gray-600 mt-2">Unlock your full potential</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all ${
                plan.highlight ? 'border-[#ED8936] scale-105' : 'border-gray-100'
              }`}
            >
              {plan.highlight && (
                <span className="text-xs font-bold bg-[#ED8936] text-white px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <h3 className="font-bold text-xl text-[#1A365D] mt-3">{plan.name}</h3>
              <div className="my-4">
                <span className="text-3xl font-bold text-[#1A365D]">{plan.price}</span>
                <span className="text-gray-500 ml-1">ETB / {plan.cycle}</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <span className="text-green-500">[OK]</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleChoose(plan)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  plan.highlight
                    ? 'bg-[#ED8936] hover:bg-orange-500 text-white'
                    : 'bg-[#1A365D] hover:bg-blue-900 text-white'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? 'Processing...' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-[#1A365D]">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
