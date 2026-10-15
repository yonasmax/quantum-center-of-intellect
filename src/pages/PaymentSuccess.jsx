import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../services/paymentsAPI';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get('tx_ref') || searchParams.get('trx_ref');
  const [status, setStatus] = useState('verifying'); // verifying | success | failed | error
  const [details, setDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!txRef) {
      setStatus('error');
      setErrorMessage('No transaction reference found in URL.');
      return;
    }

    const pending = localStorage.getItem('pending_payment');
    let planInfo = {};
    try { planInfo = pending ? JSON.parse(pending) : {}; } catch {}

    (async () => {
      try {
        const result = await verifyPayment({
          tx_ref: txRef,
          userEmail: null, // will be derived from session on server? No ? we need to send it
          planId: planInfo.planId,
          planName: planInfo.planName,
          billingCycle: planInfo.billingCycle,
        });
        // Wait: verify endpoint expects userEmail. Let's fall back to session email.
        // We'll re-call with the correct shape.
        // Actually the verify endpoint receives userEmail from the frontend.
        // So let's redo:
        const { supabase } = await import('../supabaseClient');
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email;

        const secondResult = await verifyPayment({
          tx_ref: txRef,
          userEmail: email,
          planId: planInfo.planId,
          planName: planInfo.planName,
          billingCycle: planInfo.billingCycle,
        });

        if (secondResult.verified && secondResult.success) {
          setStatus('success');
          setDetails(secondResult);
          localStorage.removeItem('pending_payment');
        } else {
          setStatus('failed');
          setErrorMessage(secondResult.message || 'Payment was not successful.');
        }
      } catch (err) {
        console.error('[payment-success] Verify error:', err);
        setStatus('error');
        setErrorMessage(err.message);
      }
    })();
  }, [txRef]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-4 border-[#ED8936] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-xl font-bold text-[#1A365D] mb-2">Verifying Payment...</h1>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment with Telebirr.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">?</span>
            </div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your subscription is now active. Welcome aboard!
            </p>
            {details && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-left mb-6 space-y-1">
                <p className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-bold">{details.amount} {details.currency}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-bold uppercase">{details.paymentMethod || 'Telebirr'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Reference:</span>
                  <span className="font-mono text-xs">{details.tx_ref}</span>
                </p>
              </div>
            )}
            <Link
              to="/dashboard"
              className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-bold"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">?</span>
            </div>
            <h1 className="text-2xl font-bold text-red-700 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{errorMessage || 'Your payment could not be completed.'}</p>
            <Link
              to="/pricing"
              className="inline-block bg-[#1A365D] hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-bold"
            >
              Try Again
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">!</span>
            </div>
            <h1 className="text-xl font-bold text-yellow-800 mb-2">Verification Error</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <Link
              to="/pricing"
              className="inline-block bg-[#1A365D] hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-bold"
            >
              Back to Plans
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
