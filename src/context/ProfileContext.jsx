import React, { createContext, useContext, useEffect, useState } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

const SUPABASE_URL = 'https://lookscjdmgoumfxjzzpy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ahqlznWQ4URCLL5zXmc6Kg_yJKi8WHE';

function getEmailFromStorage() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const email = parsed.email || parsed._id || parsed.id || null;
    if (!email) return null;
    // Sanitize: lowercase, trim whitespace, remove newlines
    const cleaned = String(email).toLowerCase().trim().replace(/\s+/g, '');
    console.log('[profile] Raw email:', JSON.stringify(email));
    console.log('[profile] Clean email:', JSON.stringify(cleaned));
    return cleaned;
  } catch (e) {
    console.warn('[profile] localStorage parse error:', e.message);
    return null;
  }
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = getEmailFromStorage();
    console.log('[profile] Final email:', email);

    if (!email) {
      console.log('[profile] No email');
      setLoading(false);
      return;
    }

    (async () => {
      let lastError = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Manually build query string (don't rely on encodeURIComponent twice)
          const url = `${SUPABASE_URL}/rest/v1/profiles?select=*&email=eq.${encodeURIComponent(email)}`;
          console.log(`[profile] Attempt ${attempt} URL:`, url);

          const res = await fetch(url, {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Accept: 'application/json',
            },
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

          const rows = await res.json();
          console.log(`[profile] Attempt ${attempt} rows:`, rows.length, 'data:', rows);

          if (rows.length > 0) {
            console.log('[profile] LOADED:', rows[0]);
            setProfile(rows[0]);
            setLoading(false);
            return;
          }

          lastError = 'Empty result';
        } catch (err) {
          console.warn(`[profile] Attempt ${attempt} error:`, err.message);
          lastError = err.message;
        }

        if (attempt < 3) await new Promise((r) => setTimeout(r, 1000));
      }

      console.error('[profile] All attempts failed:', lastError);
      setLoading(false);
    })();
  }, []);

  const isAdmin = profile?.role === 'admin';
  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';

  const value = {
    profile,
    loading,
    role: profile?.role || 'guest',
    isAdmin,
    isTeacher,
    isStudent,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
