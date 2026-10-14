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
    const email = parsed.email || parsed._id || parsed.id;
    if (!email) return null;
    return String(email).toLowerCase().trim();
  } catch (e) {
    return null;
  }
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = getEmailFromStorage();
    console.log('[profile] Email:', email);

    if (!email) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const url = `${SUPABASE_URL}/rest/v1/profiles?select=*&email=eq.${encodeURIComponent(email)}`;
        console.log('[profile] Fetching:', url);

        const res = await fetch(url, {
          cache: 'no-store',  // browser cache bypass
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Cache-Control': 'no-cache',       // CDN bypass
            'Pragma': 'no-cache',
          },
        });

        const text = await res.text();
        console.log('[profile] Status:', res.status, 'Raw:', text);

        let rows;
        try { rows = JSON.parse(text); }
        catch { setLoading(false); return; }

        if (Array.isArray(rows) && rows.length > 0) {
          console.log('[profile] LOADED:', rows[0]);
          setProfile(rows[0]);
        } else {
          console.warn('[profile] No rows');
        }
      } catch (err) {
        console.error('[profile] Error:', err.message);
      }
      setLoading(false);
    })();
  }, []);

  const value = {
    profile,
    loading,
    role: profile?.role || 'guest',
    isAdmin: profile?.role === 'admin',
    isTeacher: profile?.role === 'teacher',
    isStudent: profile?.role === 'student',
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
