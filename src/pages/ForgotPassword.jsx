import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage('If an account exists with that email, a reset link has been sent. Check your inbox.');
    } catch (err) {
      setMessage('If an account exists with that email, a reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">??</div>
          <h1 className="text-2xl font-bold text-[#1A365D] mb-1">Forgot Password?</h1>
          <p className="text-sm text-gray-500">Enter your email and we'll send a reset link</p>
        </div>

        {message ? (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-lg mb-4">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A365D] hover:bg-blue-900 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <Link to="/login" className="text-sm text-[#ED8936] hover:underline font-bold">
            ? Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
