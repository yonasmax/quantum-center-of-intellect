// src/services/donationsAPI.js
import { supabase } from '../supabaseClient';

async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return {
    email: session.user.email,
    name: session.user.user_metadata?.fullName || session.user.email,
  };
}

export const recordDonation = async ({ amount, donorName, isAnonymous, message, reference, status }) => {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('donations')
    .insert({
      donor_email: user?.email || null,
      donor_name: isAnonymous ? 'Anonymous' : (donorName || user?.name || 'Anonymous'),
      amount: Number(amount) || 0,
      currency: 'ETB',
      method: 'telebirr',
      status: status || 'pending',
      reference: reference || null,
      is_anonymous: !!isAnonymous,
      message: message || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, donation: data } };
};

export const updateDonationStatus = async (donationId, status) => {
  const { data, error } = await supabase
    .from('donations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', donationId)
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, donation: data } };
};

export const getMyDonations = async () => {
  const user = await getCurrentUser();
  if (!user) return { data: { success: true, donations: [] } };
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('donor_email', user.email)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { data: { success: true, donations: data || [] } };
};

export const getAllDonations = async () => {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { data: { success: true, donations: data || [] } };
};

export const getDonationStats = async () => {
  const { data, error } = await supabase
    .from('donations')
    .select('amount, status');
  if (error) throw error;
  const rows = data || [];
  const completed = rows.filter((d) => d.status === 'completed');
  const total = completed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  return {
    data: {
      success: true,
      stats: {
        totalRaised: total,
        donationCount: completed.length,
        donorCount: new Set(completed.map((d) => d.donor_email).filter(Boolean)).size,
      },
    },
  };
};
