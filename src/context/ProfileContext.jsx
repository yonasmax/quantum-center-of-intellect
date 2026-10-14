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
    return parsed.email || parsed._id || parsed.id || null;
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
    console.log('[profile] Loading profile for:', email);

    if (!email) {
      console.log('[profile] No email in localStorage');
      setLoading(false);
      return;
    }

    (async () => {
      // Retry up to 3 times if network fails
      let lastError = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const url = `${SUPABASE_URL}/rest/v1/profiles?select=*&email=eq.${encodeURIComponent(email)}&limit=1`;
          console.log(`[profile] Attempt ${attempt}: ${url}`);

          const res = await fetch(url, {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Accept: 'application/json',
            },
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const rows = await res.json();
          console.log(`[profile] Attempt ${attempt} got:`, rows);

          if (rows.length > 0) {
            console.log('[profile] Loaded:', rows[0]);
            setProfile(rows[0]);
            setLoading(false);
            return;
          }

          // rows is empty ? retry
          lastError = 'No matching profile row';
        } catch (err) {
          console.warn(`[profile] Attempt ${attempt} failed:`, err.message);
          lastError = err.message;
        }

        // Wait 1 second before retry
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      console.error('[profile] All attempts failed:', lastError);
      setProfile(null);
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
