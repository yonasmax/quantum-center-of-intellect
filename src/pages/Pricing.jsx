import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setSubscription } from '../services/subscriptionsAPI';
import { initPayment } from '../services/paymentsAPI';

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
    price: 1500,
    cycle: 'monthly',
    features: ['All lessons', 'All quizzes', 'Certificates', 'Cross-device sync'],
    highlight: true,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 15000,
    cycle: 'yearly',
    features: ['Everything in Monthly', '2 months free', 'Priority support'],
    highlight: false,
  },
];

export default function Pricing() {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const [loadingBtn, setLoadingBtn] = useState(null);
  const [showPhoneModal, setShowPhoneModal] = useState(null);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  // WAIT for auth to finish loading before deciding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <p className="text-[#1A365D] font-bold">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleFree = async () => {
    setLoadingBtn('free');
    try {
      await setSubscription('free', 'Free', 0, 'forever');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
    setLoadingBtn(null);
  };

  const handleChoosePaidPlan = (plan) => {
    setError('');
    setPhone('');
    setShowPhoneModal(plan);
  };

  const handleStartPayment = async () => {
    setError('');

    const cleanPhone = phone.replace(/\s+/g, '').replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      return setError('Enter a valid Telebirr phone number (e.g., 0912345678)');
    }

    let normalized = cleanPhone;
    if (normalized.startsWith('0')) normalized = '251' + normalized.slice(1);
    else if (!normalized.startsWith('251')) normalized = '251' + normalized;

    const plan = showPhoneModal;
    setLoadingBtn(plan.id);

    try {
      const result = await initPayment({
        amount: plan.price,
        currency: 'ETB',
        email: user?.email,
        firstName: user?.fullName?.split(' ')[0] || 'Student',
        lastName: user?.fullName?.split(' ').slice(1).join(' ') || 'User',
        phone: normalized,
        planName: plan.name + ' Plan',
      });

      localStorage.setItem('pending_payment', JSON.stringify({
        tx_ref: result.tx_ref,
        planId: plan.id,
        planName: plan.name,
        billingCycle: plan.cycle,
        amount: plan.price,
      }));

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        throw new Error('No checkout URL returned from Chapa');
      }
    } catch (err) {
      console.error('[pricing] Payment init failed:', err);
      setError(err.message || 'Failed to start payment. Try again.');
      setLoadingBtn(null);
    }
  };

  const handleChoose = (plan) => {
    if (plan.id === 'free') handleFree();
    else handleChoosePaidPlan(plan);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#1A365D]">Choose Your Plan</h1>
          <p className="text-gray-600 mt-2">Unlock your full potential with Telebirr payment</p>
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
                <span className="text-3xl font-bold text-[#1A365D]">{plan.price.toLocaleString()}</span>
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
                disabled={loadingBtn === plan.id}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  plan.highlight
                    ? 'bg-[#ED8936] hover:bg-orange-500 text-white'
                    : 'bg-[#1A365D] hover:bg-blue-900 text-white'
                } disabled:opacity-50`}
              >
                {loadingBtn === plan.id
                  ? 'Processing...'
                  : plan.id === 'free'
                  ? 'Start Free'
                  : 'Pay with Telebirr'}
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

      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#1A365D]">Pay with Telebirr</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {showPhoneModal.name} Plan ? {showPhoneModal.price.toLocaleString()} ETB
                </p>
              </div>
              <button
                onClick={() => setShowPhoneModal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={loadingBtn === showPhoneModal.id}
              >?</button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">
                  Your Telebirr Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678 or 251912345678"
                  disabled={loadingBtn === showPhoneModal.id}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED8936] outline-none text-lg"
                  autoFocus
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
                <p className="font-bold mb-1">How it works:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click "Continue" ? redirected to Chapa</li>
                  <li>Enter your Telebirr PIN to approve</li>
                  <li>You'll be redirected back once payment succeeds</li>
                </ol>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPhoneModal(null)}
                  disabled={loadingBtn === showPhoneModal.id}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartPayment}
                  disabled={loadingBtn === showPhoneModal.id || !phone.trim()}
                  className="flex-1 bg-[#ED8936] hover:bg-orange-500 text-white py-3 rounded-lg font-bold disabled:opacity-50"
                >
                  {loadingBtn === showPhoneModal.id ? 'Redirecting...' : 'Continue to Pay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
