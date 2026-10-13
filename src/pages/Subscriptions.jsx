import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMySubscription, cancelSubscription } from '../services/subscriptionsAPI';

export default function Subscriptions() {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await getMySubscription();
        setSubscription(res.data.subscription);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [isAuthenticated]);

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription?')) return;
    try {
      await cancelSubscription();
      setSubscription((s) => ({ ...s, status: 'cancelled' }));
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1A365D] mb-6">My Subscription</h1>

        {loading ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-500">
            Loading...
          </div>
        ) : !subscription ? (
          <div className="bg-white p-8 rounded-xl text-center">
            <p className="text-gray-600 mb-4">You have no active subscription.</p>
            <Link to="/pricing" className="inline-block bg-[#ED8936] text-white px-6 py-2 rounded-lg font-bold">
              View Plans
            </Link>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#1A365D]">{subscription.plan_name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {subscription.price} ETB / {subscription.billing_cycle}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {subscription.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-6 pt-6 border-t border-gray-100">
              <div>
                <p className="text-gray-500">Started</p>
                <p className="font-bold text-[#1A365D]">
                  {new Date(subscription.started_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Expires</p>
                <p className="font-bold text-[#1A365D]">
                  {subscription.expires_at
                    ? new Date(subscription.expires_at).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>

            {subscription.status === 'active' && subscription.plan_id !== 'free' && (
              <button
                onClick={handleCancel}
                className="mt-6 text-sm text-red-600 hover:underline"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-[#1A365D]">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
