// api/admin/set-user-active.js
// Deactivate / reactivate a user account (admin only)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lookscjdmgoumfxjzzpy.supabase.co';

function adminClient() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const { email, isActive } = req.body;

    if (!email || typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'Missing email or isActive' });
    }

    const supabase = adminClient();

    // Update profiles
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('[set-user-active] Profile update error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Also ban/unban from Supabase Auth (prevents login)
    if (isActive === false) {
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const found = usersList?.users?.find((u) => u.email === email);
      if (found) {
        await supabase.auth.admin.updateUserById(found.id, {
          ban_duration: '876000h', // 100 years
        });
      }
    } else {
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const found = usersList?.users?.find((u) => u.email === email);
      if (found) {
        await supabase.auth.admin.updateUserById(found.id, {
          ban_duration: 'none',
        });
      }
    }

    console.log('[set-user-active]', email, '?', isActive);
    return res.status(200).json({ success: true, profile: data });
  } catch (err) {
    console.error('[set-user-active] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
