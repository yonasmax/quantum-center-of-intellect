import React from 'react';
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
};

function NavLink({ to, icon, label, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
        isActive
          ? 'bg-[#ED8936] text-white'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon path={icon} />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { role, isAdmin, isTeacher } = useProfile();

  if (!isAuthenticated) return null;

  const path = location.pathname;
  const is = (p) => path === p || (p !== '/dashboard' && path.startsWith(p));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.fullName || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const roleBadge = role === 'admin' ? 'Admin' : role === 'teacher' ? 'Teacher' : 'Student';

  return (
    <aside className="w-64 bg-[#0F1E3A] min-h-screen border-r-4 border-red-500 flex flex-col flex-shrink-0 flex">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ED8936] rounded-lg flex items-center justify-center text-white text-xl font-bold">
            Q
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Quantum Center</p>
            <p className="text-[#ED8936] text-xs">of Intellect</p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1A365D] rounded-full flex items-center justify-center text-white font-bold">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate">{displayName}</p>
            <p className="text-[#ED8936] text-xs font-bold uppercase">{roleBadge}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <NavLink to="/dashboard" icon={ICONS.home} label="Home" isActive={is('/dashboard')} />
        <NavLink to="/catalog" icon={ICONS.book} label="Browse Lessons" isActive={is('/catalog')} />
        <NavLink to="/progress" icon={ICONS.chart} label="My Progress" isActive={is('/progress')} />
        <NavLink to="/certificates" icon={ICONS.award} label="Certificates" isActive={is('/certificates')} />
        <NavLink to="/leaderboard" icon={ICONS.trophy} label="Leaderboard" isActive={is('/leaderboard')} />

        {(isTeacher || isAdmin) && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teaching</p>
            </div>
            <NavLink to="/teacher" icon={ICONS.chart} label="Teacher Dashboard" isActive={path === '/teacher'} />
            <NavLink to="/teacher/create" icon={ICONS.plus} label="Create Lesson" isActive={is('/teacher/create')} />
            <NavLink to="/teacher/students" icon={ICONS.users} label="My Students" isActive={is('/teacher/students')} />
          </>
        )}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admin</p>
            </div>
            <NavLink to="/admin" icon={ICONS.cog} label="Admin Panel" isActive={is('/admin')} />
          </>
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


