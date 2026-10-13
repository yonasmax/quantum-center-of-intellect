// src/services/paymentsAPI.js
// Payments - Supabase storage
import { supabase } from '../supabaseClient';

function getUserId() {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const id = parsed.email || parsed._id || parsed.id;
      if (id) return String(id).toLowerCase().trim().replace(/\s+/g, '_');
    }
  } catch {}
  const token = localStorage.getItem('token');
  if (token) return String(token).toLowerCase().trim();
  return 'anonymous';
}

// Get all payments for current user
export const getMyPayments = async () => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    return { data: { success: true, payments: [] } };
  }

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[payments] Load error:', error);
    throw error;
  }

  return { data: { success: true, payments: data || [] } };
};

// Record a payment
export const recordPayment = async (amount, currency, planName, method, status, reference) => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      amount,
      currency: currency || 'ETB',
      plan_name: planName,
      method,
      status: status || 'pending',
      reference,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[payments] Record error:', error);
    throw error;
  }

  return { data: { success: true, payment: data } };
};

// Update payment status (e.g., pending -> completed)
export const updatePaymentStatus = async (paymentId, status) => {
  const { data, error } = await supabase
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return { data: { success: true, payment: data } };
};
