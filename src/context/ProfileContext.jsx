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
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        });

        const text = await res.text();
        console.log('[profile] Status:', res.status, 'Raw response:', text);

        let rows;
        try {
          rows = JSON.parse(text);
        } catch (e) {
          console.error('[profile] JSON parse error:', e.message);
          setLoading(false);
          return;
        }

        console.log('[profile] Parsed rows:', rows);

        if (Array.isArray(rows) && rows.length > 0) {
          console.log('[profile] LOADED:', rows[0]);
          setProfile(rows[0]);
        } else {
          console.warn('[profile] No rows found. Array?', Array.isArray(rows), 'Length:', rows?.length);
        }
      } catch (err) {
        console.error('[profile] Fetch error:', err.message);
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
