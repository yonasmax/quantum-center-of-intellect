// src/services/subscriptionsAPI.js
// Subscriptions - Supabase storage
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

// Get current user subscription
export const getMySubscription = async () => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    return { data: { success: true, subscription: null } };
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[subscriptions] Load error:', error);
    throw error;
  }

  return { data: { success: true, subscription: data } };
};

// Create or update subscription
export const setSubscription = async (planId, planName, price, billingCycle) => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    throw new Error('Not authenticated');
  }

  const expiresAt = new Date();
  if (billingCycle === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else if (billingCycle === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 100); // lifetime
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_id: planId,
        plan_name: planName,
        price,
        billing_cycle: billingCycle,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('[subscriptions] Set error:', error);
    throw error;
  }

  return { data: { success: true, subscription: data } };
};

// Cancel subscription
export const cancelSubscription = async () => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') return;

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw error;
  return { data: { success: true } };
};
