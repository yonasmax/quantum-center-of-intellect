// api/teacher/save-lesson.js
// Create or update a lesson (teacher only)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lookscjdmgoumfxjzzpy.supabase.co';
const SUPABASE_ANON = 'sb_publishable_ahqlznWQ4URCLL5zXmc6Kg_yJKi8WHE';

function anonClient(authToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: `Bearer ${authToken}` } },
    auth: { persistSession: false },
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Get auth token from header
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const supabase = anonClient(token);

    // Verify user via Supabase auth
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const teacherEmail = user.email;
    const teacherName = user.user_metadata?.fullName || user.email;

    // Check role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', teacherEmail)
      .maybeSingle();

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
      return res.status(403).json({ error: 'Only teachers can create lessons' });
    }

    const {
      lesson_id,       // optional: if provided, update; else create new
      title,
      subject,
      grade,
      lesson_number,
      duration,
      objectives,
      competence,
      content_blocks,
      cover_image_url,
      video_url,
      takeaways,
      is_published,
    } = req.body;

    if (!title || !subject || !grade) {
      return res.status(400).json({ error: 'Missing required fields: title, subject, grade' });
    }

    const payload = {
      teacher_id: teacherEmail,
      teacher_name: teacherName,
      title: title.trim(),
      subject,
      grade,
      lesson_number: lesson_number || null,
      duration: duration || 45,
      objectives: objectives || [],
      competence: competence || '',
      content_blocks: content_blocks || [],
      cover_image_url: cover_image_url || null,
      video_url: video_url || null,
      takeaways: takeaways || [],
      is_published: !!is_published,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (lesson_id) {
      // Update existing lesson
      const { data, error } = await supabase
        .from('lessons')
        .update(payload)
        .eq('lesson_id', lesson_id)
        .eq('teacher_id', teacherEmail)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Create new lesson
      const newLessonId = 'lesson-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      const { data, error } = await supabase
        .from('lessons')
        .insert({ ...payload, lesson_id: newLessonId })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    console.log('[save-lesson] Saved:', result.lesson_id, 'by', teacherEmail);
    return res.status(200).json({ success: true, lesson: result });
  } catch (err) {
    console.error('[save-lesson] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
