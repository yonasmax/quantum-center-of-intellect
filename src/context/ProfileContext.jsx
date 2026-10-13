import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getMyProfile } from '../services/profilesAPI';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log('[ProfileContext] isAuthenticated =', isAuthenticated);  // ADD THIS
  if (!isAuthenticated) {  
useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getMyProfile();
        if (!cancelled) setProfile(res.data.profile);
      } catch (err) {
        console.error('[profile] Load failed:', err);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

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
