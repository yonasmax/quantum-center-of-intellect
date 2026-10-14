// api/send-email.js
// Vercel Serverless Function ? sends emails via Resend
// Uses CommonJS-style export for maximum compatibility with Vercel

const { Resend } = require('resend');

// From address
const FROM_EMAIL = 'Quantum Center <onboarding@resend.dev>';

function welcomeEmailHtml(name) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A365D;color:white;padding:24px;text-align:center;">
        <h1 style="margin:0;">Welcome to Quantum Center of Intellect</h1>
      </div>
      <div style="padding:32px;background:#F5F7FA;">
        <h2 style="color:#1A365D;">Hi ${name},</h2>
        <p style="color:#4A5568;line-height:1.6;">Thanks for joining! Your learning journey starts now.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://quantum-center-of-intellect-y25t.vercel.app/catalog"
             style="background:#ED8936;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Start Learning
          </a>
        </div>
      </div>
      <div style="background:#1E293B;color:#A0AEC0;padding:16px;text-align:center;font-size:12px;">
        Quantum Center of Intellect
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
        <h2 style="color:#1A365D;">Congrats, ${name}!</h2>
        <p style="color:#4A5568;line-height:1.6;">You earned a Certificate in <strong style="color:#ED8936;">${subject}</strong> for completing ${lessonsCompleted} lessons!</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://quantum-center-of-intellect-y25t.vercel.app/certificates"
             style="background:#ED8936;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
            View Certificate
          </a>
        </div>
      </div>
    </div>
  `;
}

function achievementEmailHtml(name, title, description) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A365D;color:white;padding:24px;text-align:center;">
        <h1 style="margin:0;">Achievement Unlocked!</h1>
      </div>
      <div style="padding:32px;background:#F5F7FA;">
        <h2 style="color:#1A365D;">Nice work, ${name}!</h2>
        <div style="background:white;border-left:4px solid #ED8936;padding:16px;margin:16px 0;">
          <h3 style="color:#1A365D;margin:0;">${title}</h3>
          <p style="color:#4A5568;margin:8px 0 0;">${description}</p>
        </div>
      </div>
    </div>
  `;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  try {
    const resend = new Resend(apiKey);
    const { type, to, data } = req.body;

    if (!type || !to) return res.status(400).json({ error: 'Missing type or to' });

    let subject, html;
    switch (type) {
      case 'welcome':
        subject = 'Welcome to Quantum Center of Intellect';
        html = welcomeEmailHtml(data?.name || 'Student');
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
        return res.status(400).json({ error: 'Unknown email type: ' + type });
    }

    const result = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });

    if (result.error) {
      console.error('[send-email] Resend error:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    console.log('[send-email] Sent:', result.data);
    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (err) {
    console.error('[send-email] Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
