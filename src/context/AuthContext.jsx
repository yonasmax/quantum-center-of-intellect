// src/context/AuthContext.jsx
// Auth using Supabase Auth (replaces custom backend)
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ??? Load session on mount + listen for changes ???
  useEffect(() => {
    let cancelled = false;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        const u = {
          ...session.user.user_metadata,
          id: session.user.id,
          email: session.user.email,
        };
        setUser(u);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return;
        if (session?.user) {
          const u = {
            ...session.user.user_metadata,
            id: session.user.id,
            email: session.user.email,
          };
          setUser(u);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // ??? LOGIN ???
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw { response: { data: { error: error.message } } };
    }

    const u = {
      ...data.user.user_metadata,
      id: data.user.id,
      email: data.user.email,
    };
    setUser(u);
    return { success: true, user: u };
  };

  // ??? REGISTER ???
  const register = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          fullName: userData.fullName,
          role: userData.role || 'student',
          grade: userData.grade,
          phone: userData.phone,
        },
      },
    });

    if (error) {
      throw { response: { data: { error: error.message } } };
    }

    const u = {
      ...data.user?.user_metadata,
      id: data.user?.id,
      email: data.user?.email,
    };

    // Supabase sends a confirmation email by default.
    // If confirmation is required, user has no session yet.
    if (!data.session) {
      return {
        success: true,
        requiresApproval: true,
        message: 'Please check your email to confirm your account.',
        user: u,
      };
    }

    setUser(u);
    return { success: true, user: u };
  };

  // ??? LOGOUT ???
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isTeacher: user?.role === 'teacher' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
