import React, { useMemo, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { issueCertificate, getMyCertificates } from '../services/certificatesAPI';
import { sendCertificateEmail } from '../utils/emailClient';

export default function Certificates() {
  const { user, isAuthenticated } = useAuth();
  const { progressMap } = useProgress();
  const [savedCerts, setSavedCerts] = useState([]);
  const [syncing, setSyncing] = useState(false);

  // Group completed lessons by subject
  const computed = useMemo(() => {
    const groups = {};
    Object.values(progressMap).forEach((p) => {
      if (!p.completed || !p.lesson?.subject) return;
      const subject = p.lesson.subject;
      if (!groups[subject]) groups[subject] = 0;
      groups[subject] += 1;
    });

    return Object.entries(groups)
      .filter(([_, count]) => count >= 3)
      .map(([subject, count]) => ({
        id: `cert-${subject.toLowerCase()}-${user?._id?.slice(-6) || 'anon'}`,
        subject,
        lessonsCompleted: count,
      }));
  }, [progressMap, user]);

  // Persist certificates to Supabase when they change + email on new ones
  useEffect(() => {
    if (!isAuthenticated || computed.length === 0) return;

    let cancelled = false;
    (async () => {
      setSyncing(true);

      // Load what's already saved so we can detect NEW ones
      let existingSubjects = new Set();
      try {
        const existing = await getMyCertificates();
        existingSubjects = new Set(
          (existing.data.certificates || []).map((c) => c.subject)
        );
      } catch {}

      for (const cert of computed) {
        try {
          await issueCertificate(
            cert.subject,
            cert.lessonsCompleted,
            user?.fullName || user?.email || 'Student'
          );

          // Only send email if this subject was NOT in the existing list
          if (!existingSubjects.has(cert.subject) && user?.email) {
            try {
              await sendCertificateEmail(
                user.email,
                user.fullName || user.email,
                cert.subject,
                cert.lessonsCompleted
              );
              console.log('[certificates] Email sent for:', cert.subject);
            } catch (emailErr) {
              console.warn('[certificates] Email failed:', emailErr.message);
            }
          }
        } catch (err) {
          console.warn('[certificates] Issue failed:', err.message);
        }
      }

      try {
        const res = await getMyCertificates();
        if (!cancelled) setSavedCerts(res.data.certificates || []);
      } catch (err) {
        console.warn('[certificates] Load failed:', err.message);
      }
      if (!cancelled) setSyncing(false);
    })();

    return () => { cancelled = true; };
  }, [computed, isAuthenticated, user]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const list = savedCerts.length > 0 ? savedCerts : computed;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Certificates</h1>
            <p className="text-sm opacity-80 mt-1">Celebrate your achievements</p>
          </div>
          <Link to="/progress" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold">
            Progress
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {syncing && (
          <p className="text-xs text-gray-500 mb-3">Syncing certificates...</p>
        )}

        {list.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="text-6xl mb-4">[Cert]</div>
            <h2 className="font-bold text-[#1A365D] text-xl mb-2">No Certificates Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Complete at least 3 lessons in any subject to unlock your first certificate!
            </p>
            <Link to="/catalog" className="inline-block bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold">
              Start Learning
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                You have earned <strong className="text-[#1A365D]">{list.length}</strong> certificate(s). Keep going!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {list.map((cert) => (
                <Link
                  key={cert.certificate_id || cert.id}
                  to={`/certificates/${encodeURIComponent(cert.certificate_id || cert.id)}`}
                  className="bg-gradient-to-br from-[#1A365D] to-[#2C4A7C] p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all text-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">[Trophy]</div>
                    <span className="text-xs font-bold bg-[#ED8936] px-2 py-1 rounded">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-[#ED8936] uppercase tracking-wider font-bold">
                    Certificate of Achievement
                  </p>
                  <h3 className="font-bold text-lg mt-1 mb-3">{cert.subject}</h3>
                  <p className="text-sm opacity-90">
                    {cert.lessons_completed || cert.lessonsCompleted} lessons completed
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs">
                    <span>
                      Issued: {new Date(cert.issued_at || Date.now()).toLocaleDateString()}
                    </span>
                    <span className="font-bold">View</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
