// api/payments/initialize.js
// Creates a Chapa payment session for Telebirr
// Called from the frontend when a student clicks "Subscribe"

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_API_URL = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!CHAPA_SECRET_KEY) {
    console.error('[chapa] Missing CHAPA_SECRET_KEY');
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const { amount, currency, email, firstName, lastName, phone, planName } = req.body;

    if (!amount || !email) {
      return res.status(400).json({ error: 'Missing amount or email' });
    }

    // Generate a unique transaction reference
    const txRef = 'QCI-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

    // Build the callback URL (where Chapa redirects after payment)
    const origin = req.headers.origin || 'https://quantum-center-of-intellect-y25t.vercel.app';
    const returnUrl = origin + '/payment-success?tx_ref=' + txRef;

    const body = {
      amount: String(amount),
      currency: currency || 'ETB',
      email,
      first_name: firstName || 'Student',
      last_name: lastName || 'User',
      phone_number: phone || '',
      tx_ref: txRef,
      callback_url: returnUrl,
      return_url: returnUrl,
      customization: {
        title: 'Quantum Center',
        description: planName || 'Monthly Subscription',
      },
    };

    console.log('[chapa] Initializing payment:', txRef, amount, 'ETB');

    const response = await fetch(CHAPA_API_URL + '/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + CHAPA_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error('[chapa] Init failed:', data);
      return res.status(400).json({
        error: data.message || 'Payment initialization failed',
        details: data,
      });
    }

    console.log('[chapa] Checkout URL:', data.data?.checkout_url);

    return res.status(200).json({
      success: true,
      tx_ref: txRef,
      checkout_url: data.data?.checkout_url,
      message: data.message,
    });
  } catch (err) {
    console.error('[chapa] Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
