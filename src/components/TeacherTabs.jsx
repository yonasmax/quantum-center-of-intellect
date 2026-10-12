// src/components/TeacherTabs.jsx
// Shared tab navigation for teacher pages
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/teacher', label: 'Overview', icon: '📋' },
  { path: '/teacher/analytics', label: 'Analytics', icon: '📊' },
  { path: '/teacher/students', label: 'Students', icon: '👥' },
  { path: '/teacher/import', label: 'Import', icon: '📥' },
];

export default function TeacherTabs() {
  const location = useLocation();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex gap-1 px-4 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/teacher'
              ? location.pathname === '/teacher'
              : location.pathname.startsWith(tab.path);

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-[#ED8936] text-[#1A365D]'
                  : 'border-transparent text-gray-500 hover:text-[#1A365D]'
              }`}
            >
              {tab.icon} {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
