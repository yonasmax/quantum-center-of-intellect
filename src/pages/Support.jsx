import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initPayment } from '../services/paymentsAPI';
import { recordDonation } from '../services/donationsAPI';
// import SponsorCarousel from '../components/SponsorCarousel';
import Footer from '../components/Footer';

const TIERS = [
  { amount: 50, label: 'Supporter', description: 'Covers one lesson for one student' },
  { amount: 200, label: 'Friend', description: 'Covers one week of learning' },
  { amount: 500, label: 'Champion', description: 'Covers one month for a student' },
  { amount: 1000, label: 'Hero', description: 'Sponsors 2 students for a month' },
];

export default function Support() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDonate = async () => {
    setError('');
    const amount = selectedAmount || Number(customAmount);
    if (!amount || amount < 10) {
      return setError('Enter an amount of at least 10 Birr');
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      return setError('Enter a valid Telebirr phone number');
    }

    let normalized = cleanPhone;
    if (normalized.startsWith('0')) normalized = '251' + normalized.slice(1);
    else if (!normalized.startsWith('251')) normalized = '251' + normalized;

    setLoading(true);
    try {
      const result = await initPayment({
        amount,
        currency: 'ETB',
        email: user?.email || 'donor@quantumcenter.et',
        firstName: (donorName || user?.fullName || 'Friend').split(' ')[0],
        lastName: (donorName || user?.fullName || 'Supporter').split(' ').slice(1).join(' ') || 'Donor',
        phone: normalized,
        planName: 'Support Donation',
      });

      try {
        await recordDonation({
          amount,
          donorName: donorName || user?.fullName,
          isAnonymous,
          message,
          reference: result.tx_ref,
          status: 'pending',
        });
      } catch (err) {
        console.warn('[support] Donation record failed:', err.message);
      }

      localStorage.setItem('pending_payment', JSON.stringify({
        tx_ref: result.tx_ref,
        planId: 'donation',
        planName: 'Donation',
        billingCycle: 'one-time',
        amount,
        isDonation: true,
      }));

      if (result.checkout_url) window.location.href = result.checkout_url;
      else throw new Error('No checkout URL returned');
    } catch (err) {
      setError(err.message || 'Failed to start payment');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <header className="bg-gradient-to-br from-[#1A365D] to-[#2C4A7C] text-white p-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">Support Our Mission</h1>
          <p className="text-lg opacity-90">
            Help us bring free, quality education to every Ethiopian student.
          </p>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Impact Story */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1A365D] text-lg mb-3">Why We Exist</h2>
          <p className="text-gray-700 leading-relaxed text-sm">
            Quantum Center of Intellect was built with one goal: to make premium
            chemistry, physics, biology, and math education available to every
            Ethiopian student - regardless of location or income. Every lesson,
            quiz, and certificate is designed to build real understanding, not
            just memorization.
          </p>
          <p className="text-gray-700 leading-relaxed text-sm mt-3">
            Your donation directly funds server costs, content creation, and
            free access for students in need.
          </p>
        </div>

        {/* Sponsor block */}
        {/* SponsorCarousel disabled for now */}

        {/* Donation tiers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1A365D] text-lg mb-4">Choose an amount</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TIERS.map((t) => (
              <button
                key={t.amount}
                onClick={() => { setSelectedAmount(t.amount); setCustomAmount(''); }}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  selectedAmount === t.amount
                    ? 'border-[#ED8936] bg-orange-50'
                    : 'border-gray-200 hover:border-[#1A365D]'
                }`}
              >
                <p className="font-bold text-[#1A365D] text-lg">{t.amount} ETB</p>
                <p className="text-xs text-gray-500 mt-1">{t.label}</p>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-sm font-bold text-gray-700 block mb-2">Or enter custom amount (ETB)</label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              placeholder="e.g. 300"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#ED8936]"
            />
          </div>
        </div>

        {/* Donor info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-[#1A365D] text-lg">Your Details</h2>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Your Name</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder={user?.fullName || 'Anonymous'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Telebirr Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-lg"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Add a note with your donation"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-sm"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            Donate anonymously
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleDonate}
          disabled={loading || (!selectedAmount && !customAmount)}
          className="w-full bg-[#ED8936] hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
        >
          {loading ? 'Redirecting...' : `Donate ${selectedAmount || customAmount || '-'} ETB with Telebirr`}
        </button>

        {/* Investor CTA */}
        <div className="bg-gradient-to-br from-[#0F1E3A] to-[#1A365D] text-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-3">Interested in Partnering?</h2>
          <p className="text-sm opacity-90 mb-5">
            We're looking for investors, schools, and organizations who share our
            vision of accessible education for every Ethiopian student.
          </p>
          <a
            href="mailto:yonasmolla3@gmail.com?subject=Partnership%20with%20Quantum%20Center"
            className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            Contact Us
          </a>
        </div>

        <div className="text-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1A365D]">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
