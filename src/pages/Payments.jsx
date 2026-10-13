import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordPayment } from '../services/paymentsAPI';

export default function Payments() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('telebirr');
  const [plan, setPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reference = 'PAY-' + Date.now();
      await recordPayment(
        Number(amount) || 0,
        'ETB',
        plan,
        method,
        'pending',
        reference
      );
      alert('Payment recorded! Reference: ' + reference);
      navigate('/payment-history');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1A365D] mb-2">Make a Payment</h1>
        <p className="text-gray-600 mb-6">Complete your subscription</p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700">Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-200 rounded-lg"
            >
              <option value="monthly">Monthly - 199 ETB</option>
              <option value="yearly">Yearly - 1990 ETB</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Amount (ETB)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="199"
              className="w-full mt-1 p-2 border border-gray-200 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-200 rounded-lg"
            >
              <option value="telebirr">Telebirr</option>
              <option value="cbe">CBE Birr</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 pt-2">
            Student: <strong>{user?.fullName || user?.email}</strong>
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-[#ED8936] hover:bg-orange-500 text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Payment'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/payment-history" className="text-sm text-[#1A365D] hover:underline">
            View Payment History
          </Link>
        </div>
      </div>
    </div>
  );
}
