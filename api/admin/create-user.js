// api/admin/create-user.js
// Creates a new auth user + profile row (admin only)
// Uses service_role key so must run on server

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
    return res.status(500).json({ error: 'Server not configured (missing service key)' });
  }

  try {
    const { email, password, fullName, role, grade, phone } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Missing required fields: email, password, fullName, role' });
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be student, teacher, or admin.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const supabase = adminClient();

    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm since admin is creating
      user_metadata: { fullName, role, grade, phone },
    });

    if (authError) {
      console.error('[create-user] Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // 2. Create the profile row
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: email,
        email,
        full_name: fullName,
        role,
        is_active: true,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('[create-user] Profile error:', profileError);
      // Attempt to clean up the auth user (best-effort)
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch {}
      return res.status(500).json({ error: 'Profile creation failed: ' + profileError.message });
    }

    console.log('[create-user] Created:', email, 'as', role);
    return res.status(200).json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        fullName,
        role,
      },
    });
  } catch (err) {
    console.error('[create-user] Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
