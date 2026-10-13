import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

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
      setProfile(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (error) {
          console.error('[profile] Supabase error:', error);
          setProfile(null);
        } else {
          console.log('[profile] Loaded:', data);
          setProfile(data);
        }
      } catch (err) {
        console.error('[profile] Fetch failed:', err);
        setProfile(null);
      }
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
