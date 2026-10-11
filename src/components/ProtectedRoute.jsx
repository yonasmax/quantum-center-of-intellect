import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1A365D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1A365D] font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user?.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="text-xl font-bold text-[#1A365D] mb-2">Access Denied</h1>
            <p className="text-gray-600">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
}