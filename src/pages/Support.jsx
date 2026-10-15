import React from 'react';
import { Link } from 'react-router-dom';

export default function Support() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] p-10">
      <h1 className="text-3xl font-bold text-[#1A365D]">Support Our Mission</h1>
      <p className="text-gray-700 mt-4">
        Test render - if you see this, the route works.
      </p>
      <Link to="/dashboard" className="text-[#ED8936] mt-6 inline-block">
        ? Back to Dashboard
      </Link>
    </div>
  );
}
