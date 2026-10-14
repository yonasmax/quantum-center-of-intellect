// src/services/profilesAPI.js
import { supabase } from '../supabaseClient';

function getCurrentUserEmail() {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const id = parsed.email || parsed._id || parsed.id;
      if (id) return String(id).toLowerCase().trim();
    }
  } catch {}
  return null;
}

// Get my own profile (with role)
export const getMyProfile = async () => {
  const email = getCurrentUserEmail();
  if (!email) return { data: { success: false, profile: null } };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('[profiles] getMyProfile error:', error);
    return { data: { success: false, profile: null } };
  }

  return { data: { success: true, profile: data } };
};

// Get ALL profiles (admin only)
export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('role', { ascending: true });

  if (error) throw error;
  return { data: { success: true, profiles: data || [] } };
};

// Get all teacher assignments
export const getAllTeacherAssignments = async () => {
  const { data, error } = await supabase
    .from('teacher_assignments')
    .select('*');

  if (error) throw error;
  return { data: { success: true, assignments: data || [] } };
};

// Get assignments for a specific teacher
export const getTeacherAssignments = async (teacherId) => {
  const { data, error } = await supabase
    .from('teacher_assignments')
    .select('*')
    .eq('teacher_id', teacherId);

  if (error) throw error;
  return { data: { success: true, assignments: data || [] } };
};

// Get students enrolled in given (subject, grade) pairs
export const getStudentsForTeacher = async (assignments) => {
  if (!assignments || assignments.length === 0) {
    return { data: { success: true, students: [] } };
  }

  // Build OR filter
  const orFilter = assignments
    .map((a) => `and(subject.eq.${a.subject},grade.eq.${a.grade})`)
    .join(',');

  const { data, error } = await supabase
    .from('student_enrollments')
    .select('*')
    .or(orFilter);

  if (error) throw error;
  return { data: { success: true, enrollments: data || [] } };
};

// Get all student enrollments
export const getAllStudentEnrollments = async () => {
  const { data, error } = await supabase
    .from('student_enrollments')
    .select('*');

  if (error) throw error;
  return { data: { success: true, enrollments: data || [] } };
};

// Get progress for a specific student
export const getStudentProgress = async (studentEmail) => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', studentEmail);

  if (error) throw error;
  return { data: { success: true, progress: data || [] } };
};


// ???????????????????????????????????????????????????????????
// ADMIN ? WRITE FUNCTIONS
// ???????????????????????????????????????????????????????????

// NOTE: Creating auth users requires the service role key on the backend.
// We use a Vercel serverless function to handle that securely.

// Create a new user (student or teacher) via backend
export const createUserByAdmin = async (userData) => {
  const res = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create user');
  return { data: { success: true, user: data.user } };
};

// Update a profile's role
export const updateProfileRole = async (email, role) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('email', email)
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, profile: data } };
};

// Deactivate / reactivate a user
export const setUserActive = async (email, isActive) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('email', email)
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, profile: data } };
};

// Assign a teacher to a (subject, grade)
export const assignTeacher = async (teacherEmail, subject, grade) => {
  const { data, error } = await supabase
    .from('teacher_assignments')
    .upsert(
      { teacher_id: teacherEmail, subject, grade },
      { onConflict: 'teacher_id,subject,grade' }
    )
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, assignment: data } };
};

// Remove a teacher assignment
export const unassignTeacher = async (teacherEmail, subject, grade) => {
  const { error } = await supabase
    .from('teacher_assignments')
    .delete()
    .eq('teacher_id', teacherEmail)
    .eq('subject', subject)
    .eq('grade', grade);
  if (error) throw error;
  return { data: { success: true } };
};

// Enroll a student in a (subject, grade)
export const enrollStudent = async (studentEmail, subject, grade) => {
  const { data, error } = await supabase
    .from('student_enrollments')
    .upsert(
      { student_id: studentEmail, subject, grade },
      { onConflict: 'student_id,subject,grade' }
    )
    .select()
    .single();
  if (error) throw error;
  return { data: { success: true, enrollment: data } };
};

// Remove a student enrollment
export const unenrollStudent = async (studentEmail, subject, grade) => {
  const { error } = await supabase
    .from('student_enrollments')
    .delete()
    .eq('student_id', studentEmail)
    .eq('subject', subject)
    .eq('grade', grade);
  if (error) throw error;
  return { data: { success: true } };
};


// Toggle user active status via admin API
export const toggleUserActive = async (email, isActive) => {
  const res = await fetch('/api/admin/set-user-active', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, isActive }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update user');
  return { data: { success: true, profile: data.profile } };
};
