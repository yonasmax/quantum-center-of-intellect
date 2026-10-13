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
