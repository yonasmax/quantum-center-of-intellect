import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendWelcomeEmail } from '../utils/emailClient';

const GRADES = ['5', '6', '7', '8', '9', '10', '11', '12'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    grade: '9',
    phone: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        grade: formData.role === 'student' ? formData.grade : undefined,
        phone: formData.phone,
      });

      // Send welcome email (fire-and-forget)
      if (result && !result.error) {
        sendWelcomeEmail(formData.email, formData.fullName)
          .then(() => console.log('[register] Welcome email sent'))
          .catch((emailErr) =>
            console.warn('[register] Welcome email failed:', emailErr.message)
          );
      }

      if (result.requiresApproval) {
        setSuccess(result.message);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-[#1A365D] mb-3">Registration Successful!</h1>
          <p className="text-gray-600 mb-6">{success}</p>
          <Link
            to="/login"
            className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1A365D] rounded-2xl mb-4">
            <span className="text-3xl">⚛️</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A365D] mb-1">
            Create Account
          </h1>
          <p className="text-sm text-gray-500">Join thousands of Ethiopian students</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
                placeholder="Abebe Kebede"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Phone (optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+251 9XX XXX XXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">I am a...</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none bg-white"
              >
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Teachers are added by school administrators
              </p>
            </div>

            {formData.role === 'student' && (
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Grade</label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none bg-white"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ED8936] hover:bg-orange-500 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-[#ED8936] hover:underline font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}