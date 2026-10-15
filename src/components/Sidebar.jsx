import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const Icon = ({ path }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const ICONS = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  award: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  trophy: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  plus: 'M12 4v16m8-8H4',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  pricing: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  card: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  support: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  chevron: 'M19 9l-7 7-7-7',
};

// ???????????????????????????????????????????????????????????
// Role-based color config
// ???????????????????????????????????????????????????????????
const ROLE_STYLES = {
  student: {
    accent: '#3182CE',
    accentHover: '#2C5282',
    accentBg: 'rgba(49, 130, 206, 0.15)',
    label: 'Student',
    icon: '??',
  },
  teacher: {
    accent: '#38A169',
    accentHover: '#276749',
    accentBg: 'rgba(56, 161, 105, 0.15)',
    label: 'Teacher',
    icon: '??',
  },
  admin: {
    accent: '#ED8936',
    accentHover: '#C05621',
    accentBg: 'rgba(237, 137, 54, 0.15)',
    label: 'Admin',
    icon: '??',
  },
  guest: {
    accent: '#718096',
    accentHover: '#4A5568',
    accentBg: 'rgba(113, 128, 150, 0.15)',
    label: 'Guest',
    icon: '??',
  },
};

function NavLink({ to, icon, label, isActive, accent }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
        isActive
          ? 'text-white shadow-sm'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
      style={isActive ? { backgroundColor: accent } : {}}
    >
      <Icon path={icon} />
      <span>{label}</span>
    </Link>
  );
}

function CollapsibleSection({ title, children, defaultOpen = true, accent }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="pt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1 mb-1 group"
      >
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">
          {title}
        </p>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${open ? '' : '-rotate-90'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={ICONS.chevron} />
        </svg>
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { role } = useProfile();

  if (!isAuthenticated) return null;

  const roleStyle = ROLE_STYLES[role] || ROLE_STYLES.guest;
  const accent = roleStyle.accent;
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';

  const path = location.pathname;
  const is = (p) => path === p || (p !== '/dashboard' && path.startsWith(p));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.fullName || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 bg-[#0F1E3A] min-h-screen flex flex-col flex-shrink-0 hidden md:flex">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: accent }}
          >
            Q
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Quantum Center</p>
            <p className="text-xs" style={{ color: accent }}>of Intellect</p>
          </div>
        </Link>
      </div>

      {/* User info ? role-colored */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative"
            style={{ backgroundColor: accent }}
          >
            {initial}
            <span className="absolute -bottom-1 -right-1 text-xs">{roleStyle.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-bold truncate">{displayName}</p>
            <span
              className="inline-block text-xs font-bold uppercase px-2 py-0.5 rounded-full mt-0.5"
              style={{ backgroundColor: roleStyle.accentBg, color: accent }}
            >
              {roleStyle.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <NavLink to="/dashboard" icon={ICONS.home} label="Home" isActive={is('/dashboard')} accent={accent} />
        <NavLink to="/catalog" icon={ICONS.book} label="Browse Lessons" isActive={is('/catalog')} accent={accent} />
        <NavLink to="/progress" icon={ICONS.chart} label="My Progress" isActive={is('/progress')} accent={accent} />
        <NavLink to="/certificates" icon={ICONS.award} label="Certificates" isActive={is('/certificates')} accent={accent} />
        <NavLink to="/leaderboard" icon={ICONS.trophy} label="Leaderboard" isActive={is('/leaderboard')} accent={accent} />
        <NavLink to="/pricing" icon={ICONS.pricing} label="Upgrade" isActive={is('/pricing')} accent={accent} />
        <NavLink to="/subscriptions" icon={ICONS.card} label="My Subscription" isActive={is('/subscriptions')} accent={accent} />
        <NavLink to="/support" icon={ICONS.support} label="Support Us" isActive={is('/support')} accent={accent} />

        {(isTeacher || isAdmin) && (
          <CollapsibleSection title="Teaching" accent={accent}>
            <NavLink to="/teacher" icon={ICONS.chart} label="Teacher Dashboard" isActive={path === '/teacher'} accent={accent} />
            <NavLink to="/teacher/create" icon={ICONS.plus} label="Create Lesson" isActive={is('/teacher/create')} accent={accent} />
            <NavLink to="/teacher/students" icon={ICONS.users} label="My Students" isActive={is('/teacher/students')} accent={accent} />
          </CollapsibleSection>
        )}

        {isAdmin && (
          <CollapsibleSection title="Admin" accent={accent}>
            <NavLink to="/admin" icon={ICONS.cog} label="Admin Panel" isActive={is('/admin')} accent={accent} />
          </CollapsibleSection>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
        >
          <Icon path={ICONS.logout} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
