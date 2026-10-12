// src/pages/Subscriptions.jsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlan, getAllPlans } from '../data/plans';

const SUB_KEY = 'qci_subscription_v1';

export default function Subscriptions() {
  const { user, isAuthenticated } = useAuth();
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(SUB_KEY);
    if (saved) {
      try {
        setCurrentPlan(JSON.parse(saved));
      } catch {}
    } else {
      setCurrentPlan({
        planId: 'free',
        startedAt: new Date().toISOString(),
        expiresAt: null,
        active: true,
      });
    }
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const plan = currentPlan ? getPlan(currentPlan.planId) : null;
  const allPlans = getAllPlans();

  const daysLeft = currentPlan?.expiresAt
    ? Math.max(0, Math.ceil((new Date(currentPlan.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">💎 My Subscription</h1>
          <p className="text-sm opacity-80 mt-1">Manage your plan and billing</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* Current plan card */}
        {plan && (
          <div className="bg-gradient-to-r from-[#1A365D] to-[#2C4A7C] p-8 rounded-xl shadow-lg text-white mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">
                  Current Plan
                </p>
                <h2 className="text-3xl font-bold mb-1">{plan.name}</h2>
                <p className="text-sm opacity-90">
                  {plan.price === 0 ? 'Free forever' : `${plan.price} ETB / ${plan.duration}`}
                </p>
                {daysLeft !== null && (
                  <p className="text-xs opacity-80 mt-2">
                    ⏰ {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/pricing"
                  className="bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm"
                >
                  ⬆️ Upgrade
                </Link>
                <Link
                  to="/payments"
                  className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-lg font-bold text-sm"
                >
                  💳 Make Payment
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Plan features */}
        {plan && plan.features?.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-[#1A365D] mb-4">
              ✅ What's included in {plan.name}:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other plans */}
        <h3 className="font-bold text-[#1A365D] text-lg mb-4">
          📊 Available Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {allPlans
            .filter((p) => p.id !== plan?.id)
            .map((p) => (
              <Link
                key={p.id}
                to={`/payments?plan=${p.id}`}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-[#ED8936] hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-[#1A365D]">{p.name}</h4>
                  <span className="text-sm font-bold text-[#ED8936]">
                    {p.price === 0 ? 'Free' : `${p.price} ETB`}
                  </span>
                </div>
                <ul className="space-y-1 mb-3">
                  {p.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-green-500">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-[#ED8936] font-bold">Choose this plan →</p>
              </Link>
            ))}
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/payments/history"
            className="bg-white border border-gray-200 hover:border-[#1A365D] text-[#1A365D] px-5 py-2.5 rounded-lg font-bold text-sm"
          >
            📜 Payment History
          </Link>
          <Link
            to="/pricing"
            className="bg-white border border-gray-200 hover:border-[#1A365D] text-[#1A365D] px-5 py-2.5 rounded-lg font-bold text-sm"
          >
            💰 View All Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
