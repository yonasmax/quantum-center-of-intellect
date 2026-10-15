// api/teacher/delete-lesson.js
// Delete a lesson (only the owner can delete)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lookscjdmgoumfxjzzpy.supabase.co';
const SUPABASE_ANON = 'sb_publishable_ahqlznWQ4URCLL5zXmc6Kg_yJKi8WHE';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: 'Invalid session' });

    const { lesson_id } = req.body;
    if (!lesson_id) return res.status(400).json({ error: 'Missing lesson_id' });

    // Delete only if owned by this teacher
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('lesson_id', lesson_id)
      .eq('teacher_id', user.email);

    if (error) throw error;

    console.log('[delete-lesson] Deleted:', lesson_id, 'by', user.email);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[delete-lesson] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
