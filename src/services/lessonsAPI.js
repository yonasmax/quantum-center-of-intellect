import { supabase } from '../supabaseClient';

export const saveLesson = async (lessonData) => {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  if (!user) throw new Error('You must be logged in to save lessons');

  const payload = {
    title: lessonData.title,
    subject: lessonData.subject,
    grade: lessonData.grade,
    lesson_number: lessonData.lesson_number || null,
    duration: lessonData.duration || 45,
    objectives: lessonData.objectives || [],
    competence: lessonData.competence || '',
    content_blocks: lessonData.content_blocks || [], // Make sure blocks are passed
    cover_image_url: lessonData.cover_image_url || null,
    video_url: lessonData.video_url || null,
    takeaways: lessonData.takeaways || [],
    is_published: lessonData.is_published !== undefined ? lessonData.is_published : true,
    teacher_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (lessonData.lesson_id) {
    // Update existing
    const { data, error } = await supabase
      .from('lessons')
      .update(payload)
      .eq('lesson_id', lessonData.lesson_id)
      .select()
      .single();
    if (error) throw error;
    return { data: { lesson: data } };
  } else {
    // Insert new
    delete payload.lesson_id; // ensure id is auto-generated
    const { data, error } = await supabase.from('lessons').insert([payload])
      .select()
      .single();
    if (error) throw error;
    return { data: { lesson: data } };
  }
};

export const getLesson = async (id) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('lesson_id', id)
    .single();
  
  if (error) throw error;
  return { data: { lesson: data } };
};

export const getLessons = async () => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return { data: { lessons: data } };
};

export const deleteLesson = async (id) => {
  const { error } = await supabase.from('lessons').delete().eq('lesson_id', id);
  if (error) throw error;
  return { success: true };
};

export const getMyLessons = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  if (!user) return { data: { lessons: [] } };

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return { data: { lessons: data || [] } };
};



