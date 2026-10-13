// src/services/certificatesAPI.js
// Certificates - Supabase storage
import { supabase } from '../supabaseClient';

function getUserId() {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const id = parsed.email || parsed._id || parsed.id;
      if (id) return String(id).toLowerCase().trim().replace(/\s+/g, '_');
    }
  } catch {}
  const token = localStorage.getItem('token');
  if (token) return String(token).toLowerCase().trim();
  return 'anonymous';
}

// Get all certificates for current user
export const getMyCertificates = async () => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    return { data: { success: true, certificates: [] } };
  }

  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  if (error) {
    console.error('[certificates] Load error:', error);
    throw error;
  }

  return { data: { success: true, certificates: data || [] } };
};

// Issue a new certificate
export const issueCertificate = async (subject, lessonsCompleted, studentName) => {
  const userId = getUserId();
  if (!userId || userId === 'anonymous') {
    throw new Error('Not authenticated');
  }

  const certId = `${subject.toLowerCase()}-${userId.slice(-6)}-${Date.now()}`;

  const { data, error } = await supabase
    .from('certificates')
    .upsert(
      {
        user_id: userId,
        certificate_id: certId,
        subject,
        student_name: studentName || 'Student',
        lessons_completed: lessonsCompleted,
        issued_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,subject' }
    )
    .select()
    .single();

  if (error) {
    console.error('[certificates] Issue error:', error);
    throw error;
  }

  return { data: { success: true, certificate: data } };
};

// Get a single certificate by ID
export const getCertificateById = async (certificateId) => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_id', certificateId)
    .single();

  if (error) throw error;
  return { data: { success: true, certificate: data } };
};
