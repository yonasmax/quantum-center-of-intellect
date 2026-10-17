// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Helper: Password Validation
export const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Load session + listen for changes
  useEffect(() => {
    let cancelled = false;

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

  // 2. Session Timeout (Auto-logout after 1 hour of inactivity)
  useEffect(() => {
    if (!user) return;
    
    let timeoutId;
    const TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        alert('Session expired due to inactivity. Please log in again.');
      }, TIMEOUT_MS);
    };

    // Events that count as activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    resetTimer(); // start timer on mount

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [user]);


  // 3. LOGIN with Rate Limiting
  const login = async (email, password) => {
    // Check if locked out
    const lockoutStr = localStorage.getItem('auth_lockout_until');
    if (lockoutStr) {
      const lockoutUntil = parseInt(lockoutStr, 10);
      if (Date.now() < lockoutUntil) {
        const minsLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
        throw new Error(`Too many failed attempts. Try again in ${minsLeft} minutes.`);
      } else {
        localStorage.removeItem('auth_lockout_until');
        localStorage.removeItem('auth_fail_count');
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Increment failed attempts
      const failCount = parseInt(localStorage.getItem('auth_fail_count') || '0', 10) + 1;
      localStorage.setItem('auth_fail_count', failCount.toString());
      
      if (failCount >= 5) {
        // Lock out for 5 minutes
        localStorage.setItem('auth_lockout_until', (Date.now() + 5 * 60000).toString());
        throw new Error('Too many failed attempts. Account locked for 5 minutes.');
      }
      throw new Error(error.message);
    }

    // Success: reset failed attempts
    localStorage.removeItem('auth_fail_count');
    localStorage.removeItem('auth_lockout_until');
    return data;
  };

  // 4. REGISTER with Password Validation
  const register = async ({ fullName, email, password, role, grade, phone }) => {
    if (!isStrongPassword(password)) {
      throw new Error('Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          role: role || 'student',
          grade: grade || null,
          phone: phone || null,
        },
      },
    });

    if (error) throw new Error(error.message);
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
