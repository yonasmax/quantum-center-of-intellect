// src/components/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#1A365D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#1A365D] font-bold">{text}</p>
      </div>
    </div>
  );
}

export function InlineSpinner({ size = 'md', color = '#1A365D' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };
  return (
    <div
      className={`${sizes[size]} rounded-full animate-spin inline-block`}
      style={{
        borderColor: color,
        borderTopColor: 'transparent',
      }}
    />
  );
}
