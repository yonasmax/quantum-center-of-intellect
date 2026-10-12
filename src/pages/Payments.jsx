// src/pages/Payments.jsx
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPlan, REGISTRATION_FEE } from '../data/plans';
import { PAYMENT_METHODS } from '../data/paymentMethods';

export default function Payments() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'plus';
  const plan = getPlan(planId);

  const [selectedMethod, setSelectedMethod] = useState('telebirr');
  const [copied, setCopied] = useState(false);

  const method = useMemo(
    () => PAYMENT_METHODS.find((m) => m.id === selectedMethod),
    [selectedMethod]
  );

  const totalAmount = plan?.price || 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(method.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy. Please copy manually: ' + method.accountNumber);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Plan not found.</p>
          <Link to="/pricing" className="text-[#ED8936] font-bold hover:underline">
            ← Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Link to="/pricing" className="text-xs opacity-80 hover:opacity-100 mb-2 block">
            ← Back to Pricing
          </Link>
          <h1 className="text-2xl font-bold">💳 Complete Payment</h1>
          <p className="text-sm opacity-80">Choose your method and follow the instructions</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Plan Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1A365D] mb-4 flex items-center gap-2">
            📋 Payment Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">
                {plan.name} Subscription ({plan.duration})
              </span>
              <span className="font-bold text-[#1A365D]">{plan.price} ETB</span>
            </div>
            {planId !== 'free' && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{REGISTRATION_FEE.description}</span>
                <span className="font-bold text-[#1A365D]">{REGISTRATION_FEE.amount} ETB</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 bg-orange-50 rounded-lg px-3 -mx-1">
              <span className="font-bold text-[#1A365D]">Total:</span>
              <span className="font-bold text-2xl text-[#ED8936]">
                {(plan.price + (planId !== 'free' ? REGISTRATION_FEE.amount : 0))} ETB
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1A365D] mb-4 flex items-center gap-2">
            📱 Choose Payment Method
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  selectedMethod === m.id
                    ? 'border-[#ED8936] bg-orange-50 shadow-md scale-105'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-3xl mb-1">{m.icon}</div>
                <p className={`text-xs font-bold ${
                  selectedMethod === m.id ? 'text-[#ED8936]' : 'text-gray-700'
                }`}>
                  {m.name}
                </p>
              </button>
            ))}
          </div>

          {/* Selected Method Details */}
          {method && (
            <div className="bg-gradient-to-br from-[#F5F7FA] to-white p-6 rounded-xl border-2 border-[#ED8936]">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{method.icon}</div>
                <div>
                  <p className="font-bold text-[#1A365D]">{method.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {method.type === 'phone' ? 'Mobile Money' : 'Bank Transfer'}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-xl p-5 text-center mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {method.type === 'phone' ? 'Phone Number' : 'Account Number'}
                </p>
                <p className="text-2xl font-bold text-[#1A365D] font-mono mb-2">
                  {method.accountNumber}
                </p>
                <p className="text-xs text-gray-600 mb-4">{method.accountName}</p>
                <button
                  onClick={handleCopy}
                  className={`px-6 py-2.5 rounded-lg font-bold shadow-md transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-400 hover:bg-yellow-500 text-[#1A365D]'
                  }`}
                >
                  {copied ? '✅ Copied!' : '📋 Copy ' + (method.type === 'phone' ? 'Phone' : 'Account')}
                </button>
              </div>

              <div className="bg-orange-50 border-l-4 border-[#ED8936] p-3 rounded mb-4">
                <p className="font-bold text-sm text-[#1A365D]">
                  💰 Amount to send: {plan.price + REGISTRATION_FEE.amount} ETB
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ({plan.price} ETB plan + {REGISTRATION_FEE.amount} ETB registration)
                </p>
              </div>

              <details className="bg-white p-4 rounded-lg border border-gray-200">
                <summary className="font-bold text-sm text-[#1A365D] cursor-pointer">
                  ℹ️ How to pay with {method.name}
                </summary>
                <ol className="mt-3 space-y-2 text-xs text-gray-700 list-decimal list-inside">
                  {method.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </details>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-[#1A365D] to-[#2C4A7C] p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⏭️</span>
            <div>
              <h3 className="font-bold mb-2">After you send payment</h3>
              <p className="text-sm opacity-90 mb-3">
                Contact the school administrator with your transaction reference number. They will activate your account within 24 hours.
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-white/20 px-3 py-1.5 rounded-lg">📞 +251 921 639 261</span>
                <span className="bg-white/20 px-3 py-1.5 rounded-lg">💬 WhatsApp / Telegram</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="text-center text-xs text-gray-500">
          Having trouble? <Link to="/support" className="text-[#ED8936] font-bold hover:underline">Contact support</Link>
        </div>
      </div>
    </div>
  );
}
