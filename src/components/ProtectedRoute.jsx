import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

export default function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { role, loading: profileLoading } = useProfile();
  const location = useLocation();

  // Wait for both auth + profile to finish loading
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <p className="text-[#1A365D] font-bold">Loading...</p>
      </div>
    );
  }

  // Not logged in ? send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role check ? if requireRole is specified and user's role doesn't match
  if (requireRole && role !== requireRole) {
    console.log(`[ProtectedRoute] Access denied. Required: ${requireRole}, Have: ${role}`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
