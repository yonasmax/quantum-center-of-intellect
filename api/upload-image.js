// api/upload-image.js
// Receives an image file, stores it in Supabase Storage,
// returns the public URL.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lookscjdmgoumfxjzzpy.supabase.co';
const BUCKET = 'lesson-images';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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
    const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Verify the user
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: 'Invalid session' });

    const { fileName, fileType, fileBase64 } = req.body;

    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'Missing fileName or fileBase64' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (fileType && !allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Only JPG, PNG, WEBP, GIF images allowed' });
    }

    // Decode base64
    const buffer = Buffer.from(fileBase64, 'base64');

    // Max 5 MB
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large (max 5 MB)' });
    }

    // Unique filename with user email prefix
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const ext = (fileName.split('.').pop() || 'jpg').toLowerCase();
    const safeEmail = user.email.replace(/[^a-z0-9]/gi, '_');
    const path = `${safeEmail}/${timestamp}-${random}.${ext}`;

    // Upload
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: fileType || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('[upload-image] Storage error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    console.log('[upload-image] Uploaded:', path, 'by', user.email);

    return res.status(200).json({
      success: true,
      url: urlData.publicUrl,
      path,
    });
  } catch (err) {
    console.error('[upload-image] Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
