// src/services/lessonsAPI.js
// Teacher lesson management API
import { supabase } from '../supabaseClient';

// Get current session token
async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Save (create or update) a lesson
export const saveLesson = async (lessonData) => {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch('/api/teacher/save-lesson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(lessonData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save lesson');
  return { data: { success: true, lesson: data.lesson } };
};

// Delete a lesson
export const deleteLesson = async (lessonId) => {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch('/api/teacher/delete-lesson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ lesson_id: lessonId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete lesson');
  return { data: { success: true } };
};

// Get lessons created by the current teacher
export const getMyLessons = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email;
  if (!email) return { data: { success: true, lessons: [] } };

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('teacher_id', email)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return { data: { success: true, lessons: data || [] } };
};

// Get a single lesson
export const getLesson = async (lessonId) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) throw error;
  return { data: { success: true, lesson: data } };
};

// Get all published lessons (for students/catalog)
export const getPublishedLessons = async (subject, grade) => {
  let query = supabase
    .from('lessons')
    .select('*')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  if (subject) query = query.eq('subject', subject);
  if (grade) query = query.eq('grade', grade);

  const { data, error } = await query;
  if (error) throw error;
  return { data: { success: true, lessons: data || [] } };
};
