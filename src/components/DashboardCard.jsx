// src/components/DashboardCard.jsx
// Reusable dashboard card component
import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardCard({
  title,
  subtitle,
  icon,
  color = 'blue',
  value,
  action,
  link,
  badge,
  children,
  onClick,
}) {
  const colorStyles = {
    blue: 'from-[#1A365D] to-[#2C4A7C]',
    orange: 'from-[#ED8936] to-orange-400',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  const colorBorder = {
    blue: 'border-[#1A365D]',
    orange: 'border-[#ED8936]',
    green: 'border-green-500',
    purple: 'border-purple-500',
    yellow: 'border-yellow-500',
    red: 'border-red-500',
  };

  const Card = link ? Link : 'div';
  const cardProps = link ? { to: link } : { onClick };

  // Big gradient card style
  if (!value && !children) {
    return (
      <Card
        {...cardProps}
        className={`bg-gradient-to-br ${colorStyles[color]} p-5 rounded-xl shadow-md text-white hover:scale-105 transition-transform cursor-pointer block`}
      >
        <p className="text-3xl mb-2">{icon}</p>
        <p className="font-bold">{title}</p>
        {subtitle && <p className="text-xs opacity-80 mt-1">{subtitle}</p>}
        {badge && (
          <span className="inline-block mt-2 bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
            {badge}
          </span>
        )}
      </Card>
    );
  }

  // Value / stat card style
  return (
    <Card
      {...cardProps}
      className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-all`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {title}
        </p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      {value !== undefined && (
        <p className={`text-3xl font-bold text-[#1A365D]`}>{value}</p>
      )}
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      {badge && (
        <span className={`inline-block mt-2 text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-700`}>
          {badge}
        </span>
      )}
      {children}
      {action && <div className="mt-3">{action}</div>}
    </Card>
  );
}
