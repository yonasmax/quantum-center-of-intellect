// src/services/storageAPI.js
// Frontend helper for uploading images to Supabase Storage

import { supabase } from '../supabaseClient';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Upload an image file (from <input type="file">)
// Returns { success, url, path }
export const uploadImage = async (file) => {
  if (!file) throw new Error('No file provided');

  // Validate type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate size (5 MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image too large (max 5 MB)');
  }

  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  // Read file as base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64Part = result.split(',')[1];
      resolve(base64Part);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // POST to backend
  const res = await fetch('/api/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileBase64: base64,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');

  return { success: true, url: data.url, path: data.path };
};
