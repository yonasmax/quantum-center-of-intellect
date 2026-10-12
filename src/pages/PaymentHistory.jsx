// src/pages/PaymentHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlan } from '../data/plans';

const PAYMENTS_KEY = 'qci_payments_v1';

export default function PaymentHistory() {
  const { isAuthenticated } = useAuth();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(PAYMENTS_KEY);
    if (saved) {
      try {
        setPayments(JSON.parse(saved));
      } catch {}
    }
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Link to="/subscriptions" className="text-xs opacity-80 hover:opacity-100 mb-2 block">
            ← Back to Subscription
          </Link>
          <h1 className="text-2xl font-bold">📜 Payment History</h1>
          <p className="text-sm opacity-80 mt-1">All your past transactions</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Total Payments</p>
            <p className="text-3xl font-bold text-[#1A365D] mt-1">{payments.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase">Total Paid</p>
            <p className="text-3xl font-bold text-[#ED8936] mt-1">{totalPaid} ETB</p>
          </div>
        </div>

        {/* Payments list */}
        {payments.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="font-bold text-[#1A365D] text-xl mb-2">No Payments Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Once you make a payment, it will appear here.
            </p>
            <Link
              to="/pricing"
              className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
            >
              View Plans →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {payments.map((payment, i) => {
              const plan = getPlan(payment.planId);
              return (
                <div
                  key={i}
                  className={`p-5 flex items-center gap-4 ${
                    i !== payments.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1A365D]">
                      {plan?.name || 'Subscription'} Payment
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {payment.method || 'Telebirr'} ·{' '}
                      {new Date(payment.date).toLocaleDateString('en-GB')}
                    </p>
                    {payment.reference && (
                      <p className="text-xs text-gray-400 mt-1">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1A365D]">{payment.amount} ETB</p>
                    <p className="text-xs text-green-600 font-bold">Completed</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
