// src/utils/emailClient.js
// Frontend helper to call the send-email API endpoint

async function sendEmail(type, to, data = {}) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, data }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.warn('[email] Send failed:', result.error);
      return { success: false, error: result.error };
    }

    console.log('[email] Sent:', type, 'to', to);
    return { success: true, id: result.id };
  } catch (err) {
    console.error('[email] Network error:', err.message);
    return { success: false, error: err.message };
  }
}

export const sendWelcomeEmail = (to, name) => sendEmail('welcome', to, { name });
export const sendCertificateEmail = (to, name, subject, lessonsCompleted) =>
  sendEmail('certificate', to, { name, subject, lessonsCompleted });
export const sendAchievementEmail = (to, name, title, description) =>
  sendEmail('achievement', to, { name, title, description });
