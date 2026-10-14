// api/send-email.js
// Vercel Serverless Function ? sends emails via Resend
// Called from the frontend as: POST /api/send-email

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// From address ? must be verified in Resend (or use onboarding@resend.dev for testing)
const FROM_EMAIL = 'Quantum Center <onboarding@resend.dev>';

// Email templates (inline for simplicity)
function welcomeEmailHtml(name) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A365D;color:white;padding:24px;text-align:center;">
        <h1 style="margin:0;">Welcome to Quantum Center of Intellect</h1>
      </div>
      <div style="padding:32px;background:#F5F7FA;">
        <h2 style="color:#1A365D;">Hi ${name},</h2>
        <p style="color:#4A5568;line-height:1.6;">
          Thanks for joining Quantum Center of Intellect! We're thrilled to have you on board.
        </p>
        <p style="color:#4A5568;line-height:1.6;">
          Your journey to mastering Chemistry, Physics, Biology, and more starts now.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://quantum-center-of-intellect-y25t.vercel.app/catalog"
             style="background:#ED8936;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Start Learning
          </a>
        </div>
        <p style="color:#718096;font-size:14px;">
          If you have any questions, reply to this email. We're here to help.
        </p>
      </div>
      <div style="background:#1E293B;color:#A0AEC0;padding:16px;text-align:center;font-size:12px;">
        Quantum Center of Intellect ? Made for Ethiopian Students
      </div>
    </div>
  `;
}

function certificateEmailHtml(name, subject, lessonsCompleted) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A365D;color:white;padding:24px;text-align:center;">
        <h1 style="margin:0;">Certificate Unlocked!</h1>
      </div>
      <div style="padding:32px;background:#F5F7FA;">
        <h2 style="color:#1A365D;">Congratulations, ${name}!</h2>
        <p style="color:#4A5568;line-height:1.6;">
          You've earned a <strong>Certificate of Achievement</strong> in
          <strong style="color:#ED8936;">${subject}</strong>.
        </p>
        <p style="color:#4A5568;line-height:1.6;">
          You completed <strong>${lessonsCompleted} lessons</strong> ? that's a huge accomplishment!
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://quantum-center-of-intellect-y25t.vercel.app/certificates"
             style="background:#ED8936;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
            View Your Certificate
          </a>
        </div>
      </div>
      <div style="background:#1E293B;color:#A0AEC0;padding:16px;text-align:center;font-size:12px;">
        Quantum Center of Intellect ? Made for Ethiopian Students
      </div>
    </div>
  `;
}

function achievementEmailHtml(name, achievementTitle, description) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A365D;color:white;padding:24px;text-align:center;">
        <h1 style="margin:0;">Achievement Unlocked!</h1>
      </div>
      <div style="padding:32px;background:#F5F7FA;">
        <h2 style="color:#1A365D;">Nice work, ${name}!</h2>
        <p style="color:#4A5568;line-height:1.6;">
          You've unlocked a new achievement:
        </p>
        <div style="background:white;border-left:4px solid #ED8936;padding:16px;margin:16px 0;">
          <h3 style="color:#1A365D;margin:0;">${achievementTitle}</h3>
          <p style="color:#4A5568;margin:8px 0 0;">${description}</p>
        </div>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://quantum-center-of-intellect-y25t.vercel.app/dashboard"
             style="background:#ED8936;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
            View All Achievements
          </a>
        </div>
      </div>
      <div style="background:#1E293B;color:#A0AEC0;padding:16px;text-align:center;font-size:12px;">
        Quantum Center of Intellect ? Made for Ethiopian Students
      </div>
    </div>
  `;
}

// Main handler
export default async function handler(req, res) {
  // CORS ? allow frontend to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, to, data } = req.body;

    if (!type || !to) {
      return res.status(400).json({ error: 'Missing type or to' });
    }

    let subject, html;

    switch (type) {
      case 'welcome':
        subject = 'Welcome to Quantum Center of Intellect';
        html = welcomeEmailHtml(data.name || 'Student');
        break;
      case 'certificate':
        subject = `Certificate Unlocked: ${data.subject}`;
        html = certificateEmailHtml(data.name, data.subject, data.lessonsCompleted);
        break;
      case 'achievement':
        subject = `Achievement Unlocked: ${data.title}`;
        html = achievementEmailHtml(data.name, data.title, data.description);
        break;
      default:
        return res.status(400).json({ error: 'Unknown email type' });
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error('[send-email] Resend error:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    console.log('[send-email] Sent:', result.data);
    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (err) {
    console.error('[send-email] Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
