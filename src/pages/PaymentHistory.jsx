import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPayments } from '../services/paymentsAPI';

export default function PaymentHistory() {
  const { isAuthenticated } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await getMyPayments();
        setPayments(res.data.payments || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A365D]">Payment History</h1>
          <Link to="/payments" className="text-sm bg-[#ED8936] text-white px-4 py-2 rounded-lg font-bold">
            Make Payment
          </Link>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-500">
            Loading...
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center">
            <p className="text-gray-600">No payments yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#1A365D] text-white">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Method</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-3">{p.plan_name}</td>
                    <td className="p-3 font-bold">
                      {p.amount} {p.currency}
                    </td>
                    <td className="p-3 uppercase text-xs">{p.method}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          p.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : p.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">{p.reference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
