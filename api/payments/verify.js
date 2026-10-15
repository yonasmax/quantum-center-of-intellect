// api/payments/verify.js
// Verifies a Chapa payment and saves the subscription to Supabase

import { createClient } from '@supabase/supabase-js';

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_API_URL = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';
const SUPABASE_URL = 'https://lookscjdmgoumfxjzzpy.supabase.co';

function adminClient() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!CHAPA_SECRET_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const { tx_ref, userEmail, planId, planName, billingCycle } = req.body;

    if (!tx_ref) return res.status(400).json({ error: 'Missing tx_ref' });

    // Verify the transaction with Chapa
    const url = CHAPA_API_URL + '/transaction/verify/' + encodeURIComponent(tx_ref);

    console.log('[chapa] Verifying:', tx_ref);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + CHAPA_SECRET_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error('[chapa] Verify failed:', data);
      return res.status(400).json({
        error: data.message || 'Verification failed',
        verified: false,
      });
    }

    const txData = data.data || {};
    const isSuccessful = txData.status === 'success';

    if (!isSuccessful) {
      console.log('[chapa] Payment not successful:', txData.status);
      return res.status(200).json({
        success: false,
        verified: false,
        status: txData.status,
        message: 'Payment was not successful',
      });
    }

    // Payment successful - save subscription in Supabase
    if (userEmail) {
      try {
        const supabase = adminClient();

        // Calculate expiry
        const now = new Date();
        const expires = new Date();
        if (billingCycle === 'yearly') {
          expires.setFullYear(expires.getFullYear() + 1);
        } else if (billingCycle === 'lifetime') {
          expires.setFullYear(expires.getFullYear() + 100);
        } else {
          expires.setMonth(expires.getMonth() + 1);
        }

        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userEmail,
              plan_id: planId || 'monthly',
              plan_name: planName || 'Monthly',
              price: Number(txData.amount) || 0,
              billing_cycle: billingCycle || 'monthly',
              status: 'active',
              started_at: now.toISOString(),
              expires_at: expires.toISOString(),
              updated_at: now.toISOString(),
            },
            { onConflict: 'user_id' }
          );

        if (subError) {
          console.error('[chapa] Subscription save error:', subError);
        } else {
          console.log('[chapa] Subscription saved for:', userEmail);
        }

        // Also record the payment
        const { error: payError } = await supabase
          .from('payments')
          .insert({
            user_id: userEmail,
            amount: Number(txData.amount) || 0,
            currency: txData.currency || 'ETB',
            plan_name: planName || 'Monthly',
            method: 'telebirr',
            status: 'completed',
            reference: tx_ref,
            created_at: now.toISOString(),
          });

        if (payError) console.error('[chapa] Payment record error:', payError);
      } catch (dbErr) {
        console.error('[chapa] DB error:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      amount: txData.amount,
      currency: txData.currency,
      status: txData.status,
      tx_ref: tx_ref,
      paymentMethod: txData.payment_method,
      message: 'Payment verified successfully',
    });
  } catch (err) {
    console.error('[chapa] Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
