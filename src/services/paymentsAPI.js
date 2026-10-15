// src/services/paymentsAPI.js
// Frontend helpers for Chapa payments via Telebirr

// Initialize a payment session with Chapa
export const initPayment = async (paymentData) => {
  const res = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');
  return data;
};

// Verify a completed payment
export const verifyPayment = async (verifyData) => {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verifyData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to verify payment');
  return data;
};


// ???????????????????????????????????????????????????????????
// LEGACY HELPERS ? Used by Payments.jsx and PaymentHistory.jsx
// ???????????????????????????????????????????????????????????

// Record a manual payment (used by /payments form)
export const recordPayment = async (amount, currency, planName, method, status, reference) => {
  const { supabase } = await import('../supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email;
  if (!email) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: email,
      amount: Number(amount) || 0,
      currency: currency || 'ETB',
      plan_name: planName || 'Custom',
      method: method || 'manual',
      status: status || 'pending',
      reference: reference || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return { data: { success: true, payment: data } };
};

// Get all payments for current user
export const getMyPayments = async () => {
  const { supabase } = await import('../supabaseClient');
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email;
  if (!email) return { data: { success: true, payments: [] } };

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', email)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { data: { success: true, payments: data || [] } };
};

// Update payment status
export const updatePaymentStatus = async (paymentId, status) => {
  const { supabase } = await import('../supabaseClient');
  const { data, error } = await supabase
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return { data: { success: true, payment: data } };
};
