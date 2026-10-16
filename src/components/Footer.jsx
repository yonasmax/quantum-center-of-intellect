import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0F1E3A] text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#ED8936] rounded-lg flex items-center justify-center text-white text-xl font-bold">
                Q
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Quantum Center</p>
                <p className="text-[#ED8936] text-xs">of Intellect</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Free, quality education for every Ethiopian student.
            </p>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Learn</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/catalog" className="hover:text-[#ED8936]">Browse Lessons</Link></li>
              <li><Link to="/leaderboard" className="hover:text-[#ED8936]">Leaderboard</Link></li>
              <li><Link to="/certificates" className="hover:text-[#ED8936]">Certificates</Link></li>
              <li><Link to="/pricing" className="hover:text-[#ED8936]">Plans</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/support" className="hover:text-[#ED8936]">Support Us</Link></li>
              <li><Link to="/support" className="hover:text-[#ED8936]">Partner With Us</Link></li>
              <li>
                <a href="mailto:yonasmolla3@gmail.com" className="hover:text-[#ED8936]">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/terms" className="hover:text-[#ED8936]">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-[#ED8936]">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-[#ED8936]">Refund Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-[#ED8936]">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Quantum Center of Intellect &middot; Made with &#10084; for Ethiopian Students
          </p>
        </div>
      </div>
    </footer>
  );
}
