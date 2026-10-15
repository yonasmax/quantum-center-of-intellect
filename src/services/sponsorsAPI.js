// src/services/sponsorsAPI.js
import { supabase } from '../supabaseClient';

export const getActiveSponsors = async () => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_active', true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { data: { success: true, sponsors: data || [] } };
};

export const getAllSponsors = async () => {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { data: { success: true, sponsors: data || [] } };
};

export const createSponsor = async ({ companyName, logoUrl, message, targetUrl, contactEmail, monthlyPrice, endsAt }) => {
  const { data, error } = await supabase
    .from('sponsors')
    .insert({
      company_name: companyName,
      logo_url: logoUrl || null,
      message: message || null,
      target_url: targetUrl || null,
      contact_email: contactEmail || null,
      monthly_price: Number(monthlyPrice) || 0,
      is_active: true,
      ends_at: endsAt || null,
    })
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, sponsor: data } };
};

export const updateSponsor = async (id, patch) => {
  const { data, error } = await supabase
    .from('sponsors')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, sponsor: data } };
};

export const deleteSponsor = async (id) => {
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) throw error;
  return { data: { success: true } };
};

// Fire-and-forget tracking
export const trackImpression = async (id) => {
  try { await supabase.rpc('increment_sponsor_impression', { sponsor_id: id }); } catch {}
};

export const trackClick = async (id) => {
  try { await supabase.rpc('increment_sponsor_click', { sponsor_id: id }); } catch {}
};
