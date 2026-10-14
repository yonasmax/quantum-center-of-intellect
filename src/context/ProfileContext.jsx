import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ProfileContext = createContext();
export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      // Get Supabase Auth session
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;

      console.log('[profile] Session email:', email);

      if (!email) {
        if (!cancelled) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (error) {
          console.error('[profile] Supabase error:', error);
          if (!cancelled) setProfile(null);
        } else {
          console.log('[profile] LOADED:', data);
          if (!cancelled) setProfile(data);
        }
      } catch (err) {
        console.error('[profile] Fetch failed:', err);
        if (!cancelled) setProfile(null);
      }
      if (!cancelled) setLoading(false);
    }

    loadProfile();

    // Watch for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const email = session?.user?.email;
        console.log('[profile] Auth changed. Email:', email);

        if (!email) {
          setProfile(null);
          return;
        }

        supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle()
          .then(({ data }) => {
            console.log('[profile] Reloaded:', data);
            setProfile(data);
          });
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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
